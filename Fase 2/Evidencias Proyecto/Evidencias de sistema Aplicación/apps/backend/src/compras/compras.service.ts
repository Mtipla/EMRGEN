import { BadGatewayException, BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { CompraPendiente, CapturePaypalOrderResponse, OrdenCompraResponse, ResultadoCompraResponse, ResumenCompraApadrinados } from '@repo/api-types';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { readEnv } from '../config/env';
import { transaction } from '../config/transaction';
import { MindicadorService } from '../integrations/mindicador/mindicador.service';
import { PaypalService } from '../integrations/paypal/paypal.service';
import { Plan } from '../planes/plan.entity';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import { ESTADO_PAGO, MAX_APADRINADOS, METODO_PAGO_PAYPAL, MONEDA_PAYPAL, PLAN_CUENTA_APADRINADA, clpAUsd, nombreEstado } from './compras.constants';
import { DetalleVenta } from './detalle-venta.entity';
import { Venta } from './venta.entity';

type Reserva = { venta_id: number; usuario_id: number; cupos: number; estado: string; actualizada_en: Date; clave_operacion: string };
const ABIERTAS = ['RESERVADA', 'CREANDO', 'CAPTURANDO', 'INCIERTA'];

/** Reserva -> red -> conciliación. Ninguna llamada externa ocurre dentro de una transacción. */
@Injectable()
export class ComprasService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Venta) private readonly ventas: Repository<Venta>,
    @InjectRepository(DetalleVenta) private readonly detalles: Repository<DetalleVenta>,
    @InjectRepository(Plan) private readonly planes: Repository<Plan>,
    @InjectRepository(PlanUsuario) private readonly planesUsuario: Repository<PlanUsuario>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly paypal: PaypalService,
    private readonly mindicador: MindicadorService,
  ) {}

  private async titular(manager: EntityManager, id: number, lock = false) {
    const usuario = await manager.findOne(Usuario, { where: { usuario_ID: id }, ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}) });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.usuario_principal_ID !== null || usuario.estado_ID !== 1) throw new ForbiddenException('Solo el principal con acceso completo puede comprar cupos');
    const plan = await manager.findOneBy(PlanUsuario, { usuario_ID: id });
    if (!plan) throw new ConflictException('Asigna un plan base antes de comprar cupos adicionales');
    return { usuario, plan };
  }

  private async reservados(manager: EntityManager, id: number): Promise<number> {
    const [row] = await manager.query('SELECT COALESCE(sum(cupos),0)::int AS total FROM reserva_cupos WHERE usuario_id=$1 AND estado=ANY($2)', [id, ABIERTAS]);
    return row.total;
  }

  private async producto(): Promise<Plan> {
    const producto = await this.planes.findOneBy({ plan_ID: PLAN_CUENTA_APADRINADA });
    if (!producto || producto.precio_actual <= 0) throw new ConflictException('El precio del cupo adicional no está configurado');
    return producto;
  }

  /** Precio vigente del cupo para la página pública /premium; no revela datos de ningún usuario. */
  async precioPublico() {
    const producto = await this.producto();
    return { plan: producto.nombre_plan, precioUnitario: producto.precio_actual, maxApadrinados: MAX_APADRINADOS };
  }

  async resumen(usuarioId: number): Promise<ResumenCompraApadrinados> {
    const { usuario, plan } = await this.titular(this.dataSource.manager, usuarioId);
    const producto = await this.producto();
    const reservados = await this.reservados(this.dataSource.manager, usuarioId);
    return { usuario: usuario.nombre_usuario, plan: producto.nombre_plan, precioUnitario: producto.precio_actual,
      cuposAdquiridos: plan.cupos_apadrinados_adq,
      maxCantidad: Math.max(0, Math.min(producto.limite_compra_max, MAX_APADRINADOS - plan.cupos_apadrinados_adq - reservados)) };
  }

  async pendientes(usuarioId: number): Promise<CompraPendiente[]> {
    await this.titular(this.dataSource.manager, usuarioId);
    return this.dataSource.query(`SELECT v.venta_id AS "ventaId",v.orden_paypal_id AS "orderId",
      v.total_venta AS "totalClp",v.monto_cobrado AS "montoCobrado",v.moneda_cobrada AS "monedaCobrada",
      r.cupos AS cantidad,(r.estado='RESERVADA' AND v.captura_paypal_id IS NULL) AS "puedeRetomar"
      FROM venta v JOIN reserva_cupos r USING(venta_id)
      WHERE v.usuario_id=$1 AND r.estado=ANY($2) ORDER BY v.venta_id DESC LIMIT 100`, [usuarioId,ABIERTAS]);
  }

  async crearOrden(usuarioId: number, cantidad: number): Promise<OrdenCompraResponse> {
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 5) throw new BadRequestException('Cantidad entre uno y cinco');
    const producto = await this.producto();
    const total = producto.precio_actual * cantidad;
    const monto = clpAUsd(total, await this.dolar());
    const venta = await transaction(this.dataSource, async (manager) => {
      const { plan } = await this.titular(manager, usuarioId, true);
      if (cantidad > producto.limite_compra_max || plan.cupos_apadrinados_adq + await this.reservados(manager, usuarioId) + cantidad > 5) throw new ConflictException('No hay capacidad disponible para reservar la compra');
      const nueva = await manager.save(Venta, manager.create(Venta, { usuario_ID: usuarioId, metodo_pago_ID: METODO_PAGO_PAYPAL, estado_pago_ID: ESTADO_PAGO.PENDIENTE, total_venta: total, fecha_venta: new Date(), monto_cobrado: monto, moneda_cobrada: MONEDA_PAYPAL }));
      await manager.save(DetalleVenta, manager.create(DetalleVenta, { venta_ID: nueva.venta_ID, plan_ID: plan.plan_ID, tipo_compra: 'CUPOS', cantidad, cupos_otorgados: cantidad, precio_uni: producto.precio_actual }));
      await manager.query('INSERT INTO reserva_cupos (venta_id,usuario_id,cupos) VALUES ($1,$2,$3)', [nueva.venta_ID,usuarioId,cantidad]);
      return nueva;
    });
    return this.crearOrdenExterna(venta);
  }

  private async crearOrdenExterna(venta: Venta): Promise<OrdenCompraResponse> {
    const reserva = await transaction(this.dataSource, async (manager) => {
      await this.titular(manager, venta.usuario_ID!, true);
      const actual = await manager.findOneOrFail(Venta, { where: { venta_ID: venta.venta_ID }, lock: { mode: 'pessimistic_write' } });
      if (actual.orden_paypal_ID) return { orderId: actual.orden_paypal_ID };
      const [r]: Reserva[] = await manager.query('SELECT * FROM reserva_cupos WHERE venta_id=$1 FOR UPDATE', [venta.venta_ID]);
      if (['APLICADA','LIBERADA'].includes(r.estado)) throw new ConflictException('La reserva ya terminó');
      if (r.estado === 'CREANDO' && Date.now()-r.actualizada_en.getTime()<60_000) throw new ConflictException('La orden está en creación; concilia después');
      // PayPal conserva la clave por tiempo limitado: fuera de ventana requiere revisión manual.
      if (Date.now()-venta.fecha_venta.getTime()>5*3600_000) throw new ConflictException('Concilia manualmente la orden antigua; su reserva se conserva');
      await manager.query("UPDATE reserva_cupos SET estado='CREANDO',actualizada_en=now() WHERE venta_id=$1", [venta.venta_ID]);
      return r;
    });
    const response = (orderId: string): OrdenCompraResponse => ({ ventaId: venta.venta_ID, orderId, totalClp: venta.total_venta, montoCobrado: venta.monto_cobrado!, monedaCobrada: venta.moneda_cobrada! });
    if ('orderId' in reserva) return response(reserva.orderId);
    try {
      const order = await this.paypal.createOrder({ amount: venta.monto_cobrado!, currency: venta.moneda_cobrada!, description: `EMERGEN: cupos adicionales - boleta ${venta.venta_ID}`, referenceId: String(venta.venta_ID) }, `${reserva.clave_operacion}-o`);
      await transaction(this.dataSource, async (manager) => {
        await this.titular(manager, venta.usuario_ID!, true);
        const actual = await manager.findOneByOrFail(Venta, { venta_ID: venta.venta_ID });
        if (actual.orden_paypal_ID) {
          if (actual.orden_paypal_ID !== order.id) throw new ConflictException('Orden externa contradictoria: requiere conciliación manual');
          return;
        }
        await manager.update(Venta, venta.venta_ID, { orden_paypal_ID: order.id, estado_pago_ID: ESTADO_PAGO.PENDIENTE });
        await manager.query("UPDATE reserva_cupos SET estado='RESERVADA', actualizada_en=now() WHERE venta_id=$1", [venta.venta_ID]);
      });
      return { ventaId: venta.venta_ID, orderId: order.id, totalClp: venta.total_venta, montoCobrado: venta.monto_cobrado!, monedaCobrada: venta.moneda_cobrada! };
    } catch {
      await this.incierta(venta.venta_ID, undefined, true);
      throw new BadGatewayException(`No se confirmó la creación de la orden. Venta ${venta.venta_ID}: concilia antes de volver a comprar`);
    }
  }

  async capturar(usuarioId: number, orderId: string): Promise<ResultadoCompraResponse> {
    const venta = await this.ventaDelUsuario(usuarioId, orderId);
    const claim = await transaction(this.dataSource, async (manager) => {
      await this.titular(manager, usuarioId, true);
      const actual = await manager.findOneOrFail(Venta, { where: { venta_ID: venta.venta_ID }, lock: { mode: 'pessimistic_write' } });
      const [reserva]: Reserva[] = await manager.query('SELECT * FROM reserva_cupos WHERE venta_id=$1 FOR UPDATE', [venta.venta_ID]);
      if (actual.estado_pago_ID === ESTADO_PAGO.PAGADO || reserva.estado === 'APLICADA') return { terminal: true, actual, reserva };
      if (reserva.estado === 'LIBERADA') throw new ConflictException('Compra cancelada o rechazada');
      if (reserva.estado === 'CAPTURANDO' && Date.now() - reserva.actualizada_en.getTime() < 60_000) return { ocupado: true, actual, reserva };
      await manager.query("UPDATE reserva_cupos SET estado='CAPTURANDO', actualizada_en=now() WHERE venta_id=$1", [venta.venta_ID]);
      return { actual, reserva };
    });
    if (claim.terminal) return this.resultado(claim.actual, await this.cuposAdquiridos(usuarioId));
    if (claim.ocupado) return { ventaId: venta.venta_ID, estado: 'PENDIENTE' };
    let captura: CapturePaypalOrderResponse;
    try {
      if (claim.reserva.estado !== 'RESERVADA' || claim.actual.captura_paypal_ID) {
        captura = await this.paypal.getOrder(orderId);
        if (!captura.captureStatus && captura.status === 'APPROVED' && Date.now() - venta.fecha_venta.getTime() < 5 * 3600_000) {
          captura = await this.paypal.captureOrder(orderId, `${claim.reserva.clave_operacion}-c`);
        }
      } else {
        captura = await this.paypal.captureOrder(orderId, `${claim.reserva.clave_operacion}-c`);
      }
    } catch {
      await this.incierta(venta.venta_ID);
      throw new BadGatewayException(`Resultado de pago incierto. Concilia la venta ${venta.venta_ID}; su reserva se conserva`);
    }
    try { return await this.aplicarRespuesta(usuarioId, venta.venta_ID, orderId, captura); }
    catch (error) { await this.incierta(venta.venta_ID, captura.captureId); throw error; }
  }

  private async aplicarRespuesta(usuarioId: number, ventaId: number, orderId: string, captura: CapturePaypalOrderResponse): Promise<ResultadoCompraResponse> {
    return transaction(this.dataSource, async (manager) => {
      const { plan } = await this.titular(manager, usuarioId, true);
      const venta = await manager.findOneOrFail(Venta, { where: { venta_ID: ventaId }, lock: { mode: 'pessimistic_write' } });
      const [reserva]: Reserva[] = await manager.query('SELECT * FROM reserva_cupos WHERE venta_id=$1 FOR UPDATE', [ventaId]);
      if (reserva.estado === 'APLICADA') return { ventaId, estado: 'PAGADO', cuposAdquiridos: plan.cupos_apadrinados_adq };
      if (captura.orderId !== orderId) throw new ConflictException('La respuesta de pago pertenece a otra orden');
      const correcto = captura.amount?.value === venta.monto_cobrado && captura.amount?.currency === venta.moneda_cobrada && !!captura.captureId;
      if (captura.captureStatus === 'COMPLETED' && correcto) {
        // Release reservation and grant final capacity atomically; retries cannot double grant.
        await manager.query("UPDATE reserva_cupos SET estado='APLICADA', actualizada_en=now() WHERE venta_id=$1", [ventaId]);
        plan.cupos_apadrinados_adq += reserva.cupos;
        await manager.save(PlanUsuario, plan);
        await manager.update(Venta, ventaId, { estado_pago_ID: ESTADO_PAGO.PAGADO, captura_paypal_ID: captura.captureId! });
        return { ventaId, estado: 'PAGADO', cuposAdquiridos: plan.cupos_apadrinados_adq };
      }
      const rechazado = ['DECLINED', 'FAILED', 'DENIED'].includes(captura.captureStatus ?? '');
      const estado = rechazado ? ESTADO_PAGO.RECHAZADO : captura.captureStatus === 'PENDING' ? ESTADO_PAGO.PENDIENTE : ESTADO_PAGO.REVISION;
      await manager.query('UPDATE reserva_cupos SET estado=$2, actualizada_en=now() WHERE venta_id=$1', [ventaId, rechazado ? 'LIBERADA' : 'INCIERTA']);
      await manager.update(Venta, ventaId, { estado_pago_ID: estado, captura_paypal_ID: captura.captureId ?? venta.captura_paypal_ID });
      return { ventaId, estado: nombreEstado(estado) };
    });
  }

  /** Persisted lease covers process failure after the external call. Recovery queries PayPal. */
  private async incierta(ventaId: number, captura?: string, creacion = false) {
    await transaction(this.dataSource, async (manager) => {
      const venta = await manager.findOneByOrFail(Venta, { venta_ID: ventaId });
      await manager.query('SELECT usuario_id FROM usuario WHERE usuario_id=$1 FOR UPDATE', [venta.usuario_ID]);
      const [reserva]: Reserva[] = await manager.query('SELECT * FROM reserva_cupos WHERE venta_id=$1 FOR UPDATE', [ventaId]);
      if (['APLICADA', 'LIBERADA'].includes(reserva.estado) || (creacion && venta.orden_paypal_ID)) return;
      await manager.query("UPDATE reserva_cupos SET estado='INCIERTA', actualizada_en=now() WHERE venta_id=$1", [ventaId]);
      await manager.update(Venta, ventaId, { estado_pago_ID: ESTADO_PAGO.REVISION, ...(captura ? { captura_paypal_ID: captura } : {}) });
    });
  }

  async conciliar(usuarioId: number, ventaId: number): Promise<ResultadoCompraResponse | OrdenCompraResponse> {
    const venta = await this.ventas.findOneBy({ venta_ID: ventaId, usuario_ID: usuarioId });
    if (!venta) throw new NotFoundException('Compra no encontrada');
    await this.titular(this.dataSource.manager, usuarioId);
    if (!venta.orden_paypal_ID) return this.crearOrdenExterna(venta);
    return this.capturar(usuarioId, venta.orden_paypal_ID);
  }

  async cancelar(usuarioId: number, orderId: string): Promise<ResultadoCompraResponse> {
    const venta = await this.ventaDelUsuario(usuarioId, orderId);
    return transaction(this.dataSource, async (manager) => {
      await this.titular(manager, usuarioId, true);
      const actual = await manager.findOneOrFail(Venta, { where: { venta_ID: venta.venta_ID }, lock: { mode: 'pessimistic_write' } });
      const [r]: Reserva[] = await manager.query('SELECT * FROM reserva_cupos WHERE venta_id=$1 FOR UPDATE', [venta.venta_ID]);
      if (['CREANDO','CAPTURANDO','INCIERTA'].includes(r.estado) || actual.captura_paypal_ID) throw new ConflictException('Concilia el pago antes de cancelar; no se libera una reserva incierta');
      if (r.estado === 'RESERVADA') {
        await manager.query("UPDATE reserva_cupos SET estado='LIBERADA', actualizada_en=now() WHERE venta_id=$1", [venta.venta_ID]);
        actual.estado_pago_ID = ESTADO_PAGO.CANCELADO;
        await manager.save(Venta, actual);
      }
      return this.resultado(actual);
    });
  }

  private async dolar(): Promise<number> {
    try { const valor = (await this.mindicador.get('dolar')).series[0]?.value; if (valor > 0) return valor; } catch { /* validated fallback below */ }
    const respaldo = Number(readEnv('DOLAR_CLP_RESPALDO'));
    if (respaldo > 0) return respaldo;
    throw new BadGatewayException('No hay conversión CLP/USD disponible');
  }
  private async cuposAdquiridos(id: number) { return (await this.planesUsuario.findOneBy({ usuario_ID: id }))?.cupos_apadrinados_adq ?? 0; }
  private async ventaDelUsuario(id: number, order: string) {
    const venta = await this.ventas.findOneBy({ usuario_ID: id, orden_paypal_ID: order });
    if (!venta) throw new NotFoundException('Compra no encontrada');
    return venta;
  }
  private resultado(venta: Venta, cuposAdquiridos?: number): ResultadoCompraResponse { return { ventaId: venta.venta_ID, estado: nombreEstado(venta.estado_pago_ID), cuposAdquiridos }; }
}
