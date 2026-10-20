import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type {
  OrdenCompraResponse,
  ResultadoCompraResponse,
  ResumenCompraApadrinados,
} from '@repo/api-types';
import { DataSource, Repository } from 'typeorm';
import { readEnv } from '../config/env';
import { MindicadorService } from '../integrations/mindicador/mindicador.service';
import { PaypalService } from '../integrations/paypal/paypal.service';
import { Plan } from '../planes/plan.entity';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import {
  ESTADO_PAGO,
  MAX_APADRINADOS,
  METODO_PAGO_PAYPAL,
  MONEDA_PAYPAL,
  PLAN_CUENTA_APADRINADA,
  clpAUsd,
  nombreEstado,
} from './compras.constants';
import { DetalleVenta } from './detalle-venta.entity';
import { Venta } from './venta.entity';

/**
 * Compra de cuentas apadrinadas adicionales con PayPal (Orders v2, intent CAPTURE).
 *
 * 1. `crearOrden`: valida cantidad y cupos, toma el precio de PLAN, registra la VENTA
 *    PENDIENTE y crea la orden en PayPal por el monto calculado aquí (nunca el del navegador).
 * 2. El comprador aprueba la orden en la ventana de PayPal.
 * 3. `capturar`: cobra en PayPal, comprueba monto y moneda, y en una transacción marca la
 *    venta PAGADO y suma los cupos. Solo entonces la compra cuenta como exitosa.
 */
@Injectable()
export class ComprasService {
  private readonly logger = new Logger(ComprasService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Venta) private readonly ventas: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalles: Repository<DetalleVenta>,
    @InjectRepository(Plan) private readonly planes: Repository<Plan>,
    @InjectRepository(PlanUsuario)
    private readonly planesUsuario: Repository<PlanUsuario>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly paypal: PaypalService,
    private readonly mindicador: MindicadorService,
  ) {}

  async resumen(usuarioId: number): Promise<ResumenCompraApadrinados> {
    const usuario = await this.usuarios.findOneBy({ usuario_ID: usuarioId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');
    if (usuario.usuario_principal_ID !== null) {
      throw new ForbiddenException(
        'Solo la cuenta principal puede comprar cuentas apadrinadas.',
      );
    }
    const plan = await this.plan();
    const cuposAdquiridos = await this.cuposAdquiridos(usuarioId);
    return {
      usuario: usuario.nombre_usuario,
      plan: plan.nombre_plan,
      precioUnitario: plan.precio_actual,
      cuposAdquiridos,
      maxCantidad: Math.max(
        0,
        Math.min(plan.limite_compra_max, MAX_APADRINADOS - cuposAdquiridos),
      ),
    };
  }

  async crearOrden(
    usuarioId: number,
    cantidad: number,
  ): Promise<OrdenCompraResponse> {
    const { precioUnitario, maxCantidad } = await this.resumen(usuarioId);
    if (cantidad > maxCantidad) {
      throw new BadRequestException(
        maxCantidad === 0
          ? `Ya alcanzaste el máximo de ${MAX_APADRINADOS} cuentas apadrinadas.`
          : `Puedes comprar como máximo ${maxCantidad} cuenta(s) más.`,
      );
    }

    const totalClp = precioUnitario * cantidad;
    const montoCobrado = clpAUsd(totalClp, await this.dolar());

    const venta = await this.dataSource.transaction(async (manager) => {
      const nueva = await manager.save(
        manager.create(Venta, {
          usuario_ID: usuarioId,
          metodo_pago_ID: METODO_PAGO_PAYPAL,
          estado_pago_ID: ESTADO_PAGO.PENDIENTE,
          total_venta: totalClp,
          fecha_venta: new Date(),
          monto_cobrado: montoCobrado,
          moneda_cobrada: MONEDA_PAYPAL,
        }),
      );
      await manager.save(
        manager.create(DetalleVenta, {
          venta_ID: nueva.venta_ID,
          plan_ID: PLAN_CUENTA_APADRINADA,
          cantidad,
          precio_uni: precioUnitario,
        }),
      );
      return nueva;
    });

    let orderId: string;
    try {
      orderId = (
        await this.paypal.createOrder({
          amount: montoCobrado,
          currency: MONEDA_PAYPAL,
          description: `FIND ME: ${cantidad} cuenta(s) apadrinada(s) - boleta ${venta.venta_ID}`,
          referenceId: String(venta.venta_ID),
        })
      ).id;
    } catch (error) {
      // Nada se cobró: la venta queda cerrada para que no parezca una compra en curso.
      await this.ventas.update(venta.venta_ID, {
        estado_pago_ID: ESTADO_PAGO.CANCELADO,
      });
      throw error;
    }
    await this.ventas.update(venta.venta_ID, { orden_paypal_ID: orderId });

    return {
      ventaId: venta.venta_ID,
      orderId,
      totalClp,
      montoCobrado,
      monedaCobrada: MONEDA_PAYPAL,
    };
  }

  async capturar(
    usuarioId: number,
    orderId: string,
  ): Promise<ResultadoCompraResponse> {
    const venta = await this.ventaDelUsuario(usuarioId, orderId);
    if (venta.estado_pago_ID !== ESTADO_PAGO.PENDIENTE) {
      // PAGADO se responde igual que la primera vez (reintento tras perder la conexión).
      if (venta.estado_pago_ID === ESTADO_PAGO.PAGADO) {
        return this.resultado(venta, await this.cuposAdquiridos(usuarioId));
      }
      throw new ConflictException(
        `La compra (boleta ${venta.venta_ID}) ya no está pendiente de pago.`,
      );
    }

    const { cantidad } = await this.detalles.findOneByOrFail({
      venta_ID: venta.venta_ID,
    });
    // shortcut: dos capturas simultáneas de órdenes distintas del mismo usuario pueden
    // pasar este control juntas; si se vuelve un caso real, bloquear plan_usuario aquí.
    if ((await this.cuposAdquiridos(usuarioId)) + cantidad > MAX_APADRINADOS) {
      await this.ventas.update(venta.venta_ID, {
        estado_pago_ID: ESTADO_PAGO.CANCELADO,
      });
      throw new ConflictException(
        `La compra superaría el máximo de ${MAX_APADRINADOS} cuentas apadrinadas; no se realizó el cobro.`,
      );
    }

    // Si PayPal falla (rechazo o red) la venta sigue PENDIENTE y el error llega al cliente:
    // se puede reintentar y la clave de idempotencia evita un segundo cobro.
    const captura = await this.paypal.captureOrder(
      orderId,
      `findme-venta-${venta.venta_ID}-captura`,
    );

    if (captura.captureStatus === 'PENDING') {
      await this.ventas.update(venta.venta_ID, {
        captura_paypal_ID: captura.captureId ?? null,
      });
      return this.resultado(venta);
    }
    if (captura.captureStatus !== 'COMPLETED') {
      await this.ventas.update(venta.venta_ID, {
        estado_pago_ID: ESTADO_PAGO.RECHAZADO,
      });
      return { ventaId: venta.venta_ID, estado: 'RECHAZADO' };
    }
    if (
      captura.amount?.value !== venta.monto_cobrado ||
      captura.amount?.currency !== venta.moneda_cobrada
    ) {
      this.logger.error(
        `Venta ${venta.venta_ID}: PayPal cobró ${captura.amount?.value} ${captura.amount?.currency}, se esperaba ${venta.monto_cobrado} ${venta.moneda_cobrada}.`,
      );
      return this.marcarRevision(venta, captura.captureId);
    }

    try {
      const cupos = await this.dataSource.transaction(async (manager) => {
        // Solo una transacción puede pasar la venta de PENDIENTE a PAGADO (el UPDATE
        // bloquea la fila); una captura concurrente ve 0 filas y no vuelve a sumar cupos.
        const { affected } = await manager.update(
          Venta,
          { venta_ID: venta.venta_ID, estado_pago_ID: ESTADO_PAGO.PENDIENTE },
          {
            estado_pago_ID: ESTADO_PAGO.PAGADO,
            captura_paypal_ID: captura.captureId ?? null,
          },
        );
        const [{ cupos_apadrinados_adq }] = await manager.query<
          { cupos_apadrinados_adq: number }[]
        >(
          `INSERT INTO plan_usuario (tiene_acceso_completo, cupos_apadrinados_adq, cupos_apadrinados_utili, usuario_id)
           VALUES (true, $1, 0, $2)
           ON CONFLICT (usuario_id) DO UPDATE
             SET cupos_apadrinados_adq = plan_usuario.cupos_apadrinados_adq + EXCLUDED.cupos_apadrinados_adq,
                 tiene_acceso_completo = true
           RETURNING cupos_apadrinados_adq`,
          [affected ? cantidad : 0, usuarioId],
        );
        return cupos_apadrinados_adq;
      });
      return {
        ventaId: venta.venta_ID,
        estado: 'PAGADO',
        cuposAdquiridos: cupos,
      };
    } catch (error) {
      this.logger.error(
        `Venta ${venta.venta_ID}: cobrada en PayPal (captura ${captura.captureId}) pero no se pudo habilitar: ${(error as Error).message}`,
      );
      return this.marcarRevision(venta, captura.captureId);
    }
  }

  async cancelar(
    usuarioId: number,
    orderId: string,
  ): Promise<ResultadoCompraResponse> {
    const venta = await this.ventaDelUsuario(usuarioId, orderId);
    // Con captura registrada (PENDING en PayPal) el dinero puede llegar: no se cancela.
    if (
      venta.estado_pago_ID === ESTADO_PAGO.PENDIENTE &&
      !venta.captura_paypal_ID
    ) {
      await this.ventas.update(venta.venta_ID, {
        estado_pago_ID: ESTADO_PAGO.CANCELADO,
      });
      venta.estado_pago_ID = ESTADO_PAGO.CANCELADO;
    }
    return this.resultado(venta);
  }

  /** Dólar observado del día; DOLAR_CLP_RESPALDO (opcional) solo si mindicador falla. */
  private async dolar(): Promise<number> {
    let error: unknown;
    try {
      const valor = (await this.mindicador.get('dolar')).series[0]?.value;
      if (valor > 0) return valor;
    } catch (cause) {
      error = cause;
    }
    const respaldo = Number(readEnv('DOLAR_CLP_RESPALDO'));
    if (respaldo > 0) {
      this.logger.warn(`mindicador no disponible: se usa DOLAR_CLP_RESPALDO=${respaldo}`);
      return respaldo;
    }
    throw error ?? new BadGatewayException('mindicador no entregó el valor del dólar.');
  }

  private async plan(): Promise<Plan> {
    const plan = await this.planes.findOneBy({
      plan_ID: PLAN_CUENTA_APADRINADA,
    });
    if (!plan) {
      throw new InternalServerErrorException(
        'El plan de cuentas apadrinadas no está configurado (ver migraciones/001_compras_paypal.sql).',
      );
    }
    return plan;
  }

  private async cuposAdquiridos(usuarioId: number): Promise<number> {
    const plan = await this.planesUsuario.findOneBy({ usuario_ID: usuarioId });
    return plan?.cupos_apadrinados_adq ?? 0;
  }

  /** 404 también si la orden es de otro usuario: no se revela que existe. */
  private async ventaDelUsuario(
    usuarioId: number,
    orderId: string,
  ): Promise<Venta> {
    const venta = await this.ventas.findOneBy({
      orden_paypal_ID: orderId,
      usuario_ID: usuarioId,
    });
    if (!venta) throw new NotFoundException('No se encontró la compra.');
    return venta;
  }

  /** Cobrado pero sin habilitar: queda para soporte; nunca se cobra de nuevo automáticamente. */
  private async marcarRevision(
    venta: Venta,
    captureId?: string,
  ): Promise<never> {
    await this.ventas
      .update(venta.venta_ID, {
        estado_pago_ID: ESTADO_PAGO.REVISION,
        captura_paypal_ID: captureId ?? null,
      })
      .catch((error: Error) =>
        this.logger.error(
          `Venta ${venta.venta_ID}: no se pudo marcar para revisión: ${error.message}`,
        ),
      );
    throw new InternalServerErrorException(
      `Recibimos tu pago, pero no pudimos habilitar la cuenta. Contacta al servicio al cliente indicando la boleta ${venta.venta_ID}; no vuelvas a pagar.`,
    );
  }

  private resultado(
    venta: Venta,
    cuposAdquiridos?: number,
  ): ResultadoCompraResponse {
    return {
      ventaId: venta.venta_ID,
      estado: nombreEstado(venta.estado_pago_ID),
      cuposAdquiridos,
    };
  }
}
