import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  JsreportService,
  RenderedReport,
} from '../integrations/jsreport/jsreport.service';
import { Usuario } from '../usuarios/usuarios.entity';
import { APLICACION, Aplicacion } from './aplicacion.entity';
import { BitacoraSistema } from './bitacora.entity';
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

/** Fila de la bitácora con los nombres del usuario y la aplicación. */
export interface EntradaBitacora {
  bitacora_sistema_ID: number;
  /** Instante UTC; en JSON se serializa como ISO 8601 ("...Z"). */
  fecha_accion: Date;
  accion_realizada: string;
  usuario_ID: number;
  nombre_usuario: string | null;
  aplicacion_ID: number;
  origen_aplicacion: string | null;
}

export interface NuevaEntradaBitacora {
  usuario_ID: number;
  accion: string;
  aplicacion_ID?: number;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(BitacoraSistema)
    private readonly bitacoraRepository: Repository<BitacoraSistema>,
    private readonly jsreportService: JsreportService,
  ) {}

  /**
   * Registra una acción usando el `manager` de la transacción del llamador: si la acción
   * falla, tampoco queda la entrada en la bitácora (y viceversa).
   * `fecha_accion` es TIMESTAMP sin zona: se guarda la hora UTC que calcula PostgreSQL,
   * así la hora no depende de si el backend corre en Docker (UTC) o en Windows (Chile).
   */
  async registrar(
    manager: EntityManager,
    { usuario_ID, accion, aplicacion_ID = APLICACION.ESCRITORIO }: NuevaEntradaBitacora,
  ): Promise<void> {
    await manager
      .createQueryBuilder()
      .insert()
      .into(BitacoraSistema)
      .values({
        usuario_ID,
        aplicacion_ID,
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
      .leftJoin(
        Aplicacion,
        'aplicacion',
        'aplicacion.aplicacion_ID = bitacora.aplicacion_ID',
      )
      .select('bitacora.bitacora_sistema_ID', 'bitacora_sistema_ID')
      // TIMESTAMP guardado en UTC -> TIMESTAMPTZ, para que pg lo lea como instante UTC.
      .addSelect("bitacora.fecha_accion AT TIME ZONE 'UTC'", 'fecha_accion')
      .addSelect('bitacora.accion_realizada', 'accion_realizada')
      .addSelect('bitacora.usuario_ID', 'usuario_ID')
      .addSelect('usuario.nombre_usuario', 'nombre_usuario')
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
    if (filtros.aplicacion_ID) {
      consulta.andWhere('bitacora.aplicacion_ID = :aplicacion_ID', {
        aplicacion_ID: filtros.aplicacion_ID,
      });
    }

    return consulta.getRawMany<EntradaBitacora>();
  }

  /**
   * PDF de la bitácora generado por jsReport. Si jsReport no está disponible responde 502,
   * pero el resto del backend (incluido GET /admin/auditoria) sigue funcionando.
   */
  async generarReporte(filtros: ConsultarBitacoraDto = {}): Promise<RenderedReport> {
    const entradas = await this.listar(filtros);
    try {
      return await this.jsreportService.renderInline(
        { content: PLANTILLA_BITACORA },
        {
          generado: FORMATO_CHILE.format(new Date()),
          filtros: this.describirFiltros(filtros),
          total: entradas.length,
          entradas: entradas.map((entrada) => ({
            bitacora_sistema_ID: entrada.bitacora_sistema_ID,
            fecha: FORMATO_CHILE.format(entrada.fecha_accion),
            usuario: entrada.nombre_usuario ?? `(usuario ${entrada.usuario_ID})`,
            aplicacion: entrada.origen_aplicacion ?? `(aplicación ${entrada.aplicacion_ID})`,
            accion_realizada: entrada.accion_realizada,
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

  private describirFiltros(filtros: ConsultarBitacoraDto): string {
    const partes = [
      filtros.desde && `desde ${filtros.desde}`,
      filtros.hasta && `hasta ${filtros.hasta}`,
      filtros.usuario_ID && `usuario ${filtros.usuario_ID}`,
      filtros.aplicacion_ID && `aplicación ${filtros.aplicacion_ID}`,
      `máximo ${filtros.limite ?? LIMITE_POR_DEFECTO} registros`,
    ];
    return partes.filter(Boolean).join(', ');
  }
}
