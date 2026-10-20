import { BadGatewayException, HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  JsreportService,
  RenderedReport,
} from '../integrations/jsreport/jsreport.service';
import { ROL } from '../login/roles.decorator';
import { Usuario } from '../usuarios/usuarios.entity';
import { APLICACION, Aplicacion } from './aplicacion.entity';
import {
  BitacoraSistema,
  type CambiosAuditoria,
  ENTIDAD_AUDITADA,
  type EntidadAuditada,
  RESULTADO_ACCION,
  type ResultadoAccion,
  TIPO_ACCION,
  type TipoAccion,
  type ValorAuditado,
} from './bitacora.entity';
import { ConsultarBitacoraDto } from './dto/consultar-bitacora.dto';
import { PLANTILLA_BITACORA } from './plantilla-bitacora';

/** Largo de BITACORA_SISTEMA.accion_realizada (VARCHAR(150)). */
const LARGO_ACCION = 150;
const LIMITE_POR_DEFECTO = 100;

const FORMATO_CHILE = new Intl.DateTimeFormat('es-CL', {
  timeZone: 'America/Santiago',
  dateStyle: 'short',
  timeStyle: 'medium',
});

const NOMBRE_ROL: Record<number, string> = Object.fromEntries(
  Object.entries(ROL).map(([nombre, id]) => [id, nombre]),
);

/** Quien ejecuta la acción: sale de la sesión verificada (JwtAuthGuard), nunca del body. */
export interface ActorAuditoria {
  sub: number;
  rol_ID: number;
}

/** Fila de la bitácora con los nombres del actor, del usuario afectado y de la aplicación. */
export interface EntradaBitacora {
  bitacora_sistema_ID: number;
  /** Instante UTC; en JSON se serializa como ISO 8601 ("...Z"). */
  fecha_accion: Date;
  accion_realizada: string;
  tipo_accion: TipoAccion | null;
  entidad_afectada: EntidadAuditada | null;
  resultado: ResultadoAccion;
  cambios: CambiosAuditoria | null;
  /** Actor. */
  usuario_ID: number;
  nombre_usuario: string | null;
  rol_actor_ID: number | null;
  usuario_afectado_ID: number | null;
  /** `null` si la acción no recae en un usuario o si este ya fue eliminado. */
  nombre_usuario_afectado: string | null;
  aplicacion_ID: number;
  origen_aplicacion: string | null;
}

export interface NuevaEntradaBitacora {
  actor: ActorAuditoria;
  accion: string;
  tipo: TipoAccion;
  entidad: EntidadAuditada;
  usuario_afectado_ID?: number | null;
  cambios?: CambiosAuditoria | null;
  resultado?: ResultadoAccion;
  aplicacion_ID?: number;
}

/** Lo que se sabe de la acción antes de ejecutarla. */
export type EventoAuditado = Omit<NuevaEntradaBitacora, 'cambios' | 'resultado'>;

/** Resultado de una operación auditada; los opcionales completan o precisan el evento. */
export interface ResultadoAuditado<T> {
  valor: T;
  cambios?: CambiosAuditoria;
  accion?: string;
  tipo?: TipoAccion;
  usuario_afectado_ID?: number;
}

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(BitacoraSistema)
    private readonly bitacoraRepository: Repository<BitacoraSistema>,
    private readonly jsreportService: JsreportService,
  ) {}

  /**
   * Ejecuta una operación administrativa y su entrada de bitácora en una sola transacción:
   * si la operación falla no se aplica nada y el intento queda registrado como FALLIDA,
   * nunca como exitoso. Es el único punto donde se registra cada acción (sin duplicados).
   */
  async auditar<T>(
    evento: EventoAuditado,
    operacion: (manager: EntityManager) => Promise<ResultadoAuditado<T>>,
  ): Promise<T> {
    try {
      return await this.bitacoraRepository.manager.transaction(async (manager) => {
        const { valor, cambios, accion, tipo, usuario_afectado_ID } = await operacion(manager);
        await this.registrar(manager, {
          ...evento,
          accion: accion ?? evento.accion,
          tipo: tipo ?? evento.tipo,
          usuario_afectado_ID: usuario_afectado_ID ?? evento.usuario_afectado_ID,
          cambios,
        });
        return valor;
      });
    } catch (error) {
      await this.registrarFallo(evento, error);
      throw error;
    }
  }

  /**
   * Inserta la entrada usando el `manager` de la transacción del llamador.
   * `fecha_accion` es TIMESTAMP sin zona: se guarda la hora UTC que calcula PostgreSQL,
   * así la hora no depende de si el backend corre en Docker (UTC) o en Windows (Chile).
   */
  async registrar(
    manager: EntityManager,
    {
      actor,
      accion,
      tipo,
      entidad,
      usuario_afectado_ID = null,
      cambios = null,
      resultado = RESULTADO_ACCION.EXITOSA,
      aplicacion_ID = APLICACION.ESCRITORIO,
    }: NuevaEntradaBitacora,
  ): Promise<void> {
    await manager
      .createQueryBuilder()
      .insert()
      .into(BitacoraSistema)
      .values({
        usuario_ID: actor.sub,
        rol_actor_ID: actor.rol_ID,
        aplicacion_ID,
        usuario_afectado_ID,
        tipo_accion: tipo,
        entidad_afectada: entidad,
        resultado,
        cambios: cambios && Object.keys(cambios).length > 0 ? cambios : null,
        accion_realizada: accion.slice(0, LARGO_ACCION),
        fecha_accion: () => "timezone('UTC', now())",
      })
      .execute();
  }

  /** Bitácora más reciente primero, con filtros opcionales. */
  async listar(filtros: ConsultarBitacoraDto = {}): Promise<EntradaBitacora[]> {
    const consulta = this.bitacoraRepository
      .createQueryBuilder('bitacora')
      .leftJoin(Usuario, 'usuario', 'usuario.usuario_ID = bitacora.usuario_ID')
      .leftJoin(Usuario, 'afectado', 'afectado.usuario_ID = bitacora.usuario_afectado_ID')
      .leftJoin(
        Aplicacion,
        'aplicacion',
        'aplicacion.aplicacion_ID = bitacora.aplicacion_ID',
      )
      .select('bitacora.bitacora_sistema_ID', 'bitacora_sistema_ID')
      // TIMESTAMP guardado en UTC -> TIMESTAMPTZ, para que pg lo lea como instante UTC.
      .addSelect("bitacora.fecha_accion AT TIME ZONE 'UTC'", 'fecha_accion')
      .addSelect('bitacora.accion_realizada', 'accion_realizada')
      .addSelect('bitacora.tipo_accion', 'tipo_accion')
      .addSelect('bitacora.entidad_afectada', 'entidad_afectada')
      .addSelect('bitacora.resultado', 'resultado')
      .addSelect('bitacora.cambios', 'cambios')
      .addSelect('bitacora.usuario_ID', 'usuario_ID')
      .addSelect('usuario.nombre_usuario', 'nombre_usuario')
      .addSelect('bitacora.rol_actor_ID', 'rol_actor_ID')
      .addSelect('bitacora.usuario_afectado_ID', 'usuario_afectado_ID')
      .addSelect('afectado.nombre_usuario', 'nombre_usuario_afectado')
      .addSelect('bitacora.aplicacion_ID', 'aplicacion_ID')
      .addSelect('aplicacion.origen_aplicacion', 'origen_aplicacion')
      .orderBy('bitacora.fecha_accion', 'DESC')
      .addOrderBy('bitacora.bitacora_sistema_ID', 'DESC')
      .limit(filtros.limite ?? LIMITE_POR_DEFECTO);

    if (filtros.desde) {
      consulta.andWhere('bitacora.fecha_accion >= CAST(:desde AS date)', {
        desde: filtros.desde,
      });
    }
    if (filtros.hasta) {
      consulta.andWhere('bitacora.fecha_accion < CAST(:hasta AS date) + 1', {
        hasta: filtros.hasta,
      });
    }
    if (filtros.usuario_ID) {
      consulta.andWhere('bitacora.usuario_ID = :usuario_ID', {
        usuario_ID: filtros.usuario_ID,
      });
    }
    if (filtros.usuario_afectado_ID) {
      consulta.andWhere('bitacora.usuario_afectado_ID = :usuario_afectado_ID', {
        usuario_afectado_ID: filtros.usuario_afectado_ID,
      });
    }
    if (filtros.aplicacion_ID) {
      consulta.andWhere('bitacora.aplicacion_ID = :aplicacion_ID', {
        aplicacion_ID: filtros.aplicacion_ID,
      });
    }

    return consulta.getRawMany<EntradaBitacora>();
  }

  /**
   * PDF de la bitácora que descarga un administrador; la exportación también queda
   * registrada. No usa `auditar` para no mantener una transacción abierta mientras
   * jsReport genera el documento.
   */
  async exportarReporte(
    filtros: ConsultarBitacoraDto,
    actor: ActorAuditoria,
  ): Promise<RenderedReport> {
    const evento: EventoAuditado = {
      actor,
      accion: 'Exportación de la bitácora a PDF',
      tipo: TIPO_ACCION.EXPORTACION,
      entidad: ENTIDAD_AUDITADA.BITACORA_SISTEMA,
      usuario_afectado_ID: filtros.usuario_afectado_ID ?? null,
    };
    try {
      const reporte = await this.generarReporte(filtros);
      await this.registrar(this.bitacoraRepository.manager, evento);
      return reporte;
    } catch (error) {
      await this.registrarFallo(evento, error);
      throw error;
    }
  }

  /**
   * PDF de la bitácora generado por jsReport. Si jsReport no está disponible responde 502,
   * pero el resto del backend (incluido GET /admin/auditoria) sigue funcionando.
   */
  async generarReporte(filtros: ConsultarBitacoraDto = {}): Promise<RenderedReport> {
    const entradas = await this.listar(filtros);
    try {
      return await this.jsreportService.renderInline(
        { content: PLANTILLA_BITACORA, chrome: { landscape: true } },
        {
          generado: FORMATO_CHILE.format(new Date()),
          filtros: this.describirFiltros(filtros),
          total: entradas.length,
          entradas: entradas.map((entrada) => ({
            bitacora_sistema_ID: entrada.bitacora_sistema_ID,
            fecha: FORMATO_CHILE.format(entrada.fecha_accion),
            actor: entrada.nombre_usuario ?? `(usuario ${entrada.usuario_ID})`,
            rol: this.nombreRol(entrada.rol_actor_ID),
            afectado: this.describirAfectado(entrada),
            tipo: entrada.tipo_accion ?? '',
            entidad: entrada.entidad_afectada ?? '',
            aplicacion: entrada.origen_aplicacion ?? `(aplicación ${entrada.aplicacion_ID})`,
            resultado: entrada.resultado,
            fallida: entrada.resultado === RESULTADO_ACCION.FALLIDA,
            accion_realizada: entrada.accion_realizada,
            cambios: this.describirCambios(entrada.cambios),
          })),
        },
      );
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw new BadGatewayException(
          `${error.message} El listado de la bitácora sigue disponible en GET /admin/auditoria.`,
        );
      }
      throw error;
    }
  }

  /** Deja constancia del intento fallido sin tapar el error original de la operación. */
  private async registrarFallo(evento: EventoAuditado, error: unknown): Promise<void> {
    // Solo los mensajes de negocio (4xx/5xx de Nest); nunca el detalle interno de un error.
    const motivo = error instanceof HttpException ? error.message : 'error interno';
    try {
      await this.registrar(this.bitacoraRepository.manager, {
        ...evento,
        accion: `${evento.accion}: ${motivo}`,
        resultado: RESULTADO_ACCION.FALLIDA,
      });
    } catch (falloBitacora) {
      this.logger.error(
        `No se pudo registrar el intento fallido "${evento.accion}": ${(falloBitacora as Error).message}`,
      );
    }
  }

  private nombreRol(rol_ID: number | null): string {
    return rol_ID === null ? '' : (NOMBRE_ROL[rol_ID] ?? `rol ${rol_ID}`);
  }

  private describirAfectado(entrada: EntradaBitacora): string {
    if (entrada.usuario_afectado_ID === null) return '';
    return `${entrada.usuario_afectado_ID} - ${entrada.nombre_usuario_afectado ?? '(eliminado)'}`;
  }

  /** "campo: anterior → posterior" por cada campo modificado. */
  private describirCambios(cambios: CambiosAuditoria | null): string[] {
    const texto = (valor: ValorAuditado) => (valor === null ? '(vacío)' : String(valor));
    return Object.entries(cambios ?? {}).map(
      ([campo, { antes, despues }]) => `${campo}: ${texto(antes)} → ${texto(despues)}`,
    );
  }

  private describirFiltros(filtros: ConsultarBitacoraDto): string {
    const partes = [
      filtros.desde && `desde ${filtros.desde}`,
      filtros.hasta && `hasta ${filtros.hasta}`,
      filtros.usuario_ID && `actor ${filtros.usuario_ID}`,
      filtros.usuario_afectado_ID && `usuario afectado ${filtros.usuario_afectado_ID}`,
      filtros.aplicacion_ID && `aplicación ${filtros.aplicacion_ID}`,
      `máximo ${filtros.limite ?? LIMITE_POR_DEFECTO} registros`,
    ];
    return partes.filter(Boolean).join(', ');
  }
}
