import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  JsreportService,
  type RenderedReport,
} from '../integrations/jsreport/jsreport.service';
import {
  type FormatoReporte,
  plantillaReporte,
  validarReporte,
} from '../integrations/jsreport/formato-reporte';
import {
  ConsultarVentasDto,
  FiltrosVentasDto,
} from './dto/consultar-ventas.dto';
import { PLANTILLA_VENTAS, PLANTILLA_VENTAS_EXCEL } from './plantilla-ventas';

export interface DetalleVentaAdmin {
  detalle_venta_id: number;
  plan_id: number;
  nombre_plan: string;
  tipo_compra: 'PLAN' | 'CUPOS';
  cantidad: number;
  cupos_otorgados: number;
  precio_uni: number;
}

export interface VentaAdmin {
  venta_id: number;
  usuario_id: number | null;
  nombre_usuario: string | null;
  correo_usuario: string | null;
  fecha_venta: string;
  estado_pago_id: number;
  estado: string;
  metodo_pago: string;
  total_venta: number;
  monto_cobrado: string | null;
  moneda_cobrada: string | null;
  detalles: DetalleVentaAdmin[];
}

export interface PaginaVentas {
  ventas: VentaAdmin[];
  total: number;
  total_pagado_clp: number;
}

const CLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
});
const FECHA_CHILE = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Santiago',
});
const ESTADOS: Record<number, string> = {
  1: 'PENDIENTE',
  2: 'PAGADO',
  3: 'RECHAZADO',
  4: 'CANCELADO',
  5: 'REVISION',
};

/** Solo lectura: consultar o exportar ventas no modifica pagos ni concede planes o cupos. */
@Injectable()
export class AdminVentasService {
  constructor(
    private readonly source: DataSource,
    private readonly jsreport: JsreportService,
  ) {}

  listar(filtros: ConsultarVentasDto): Promise<PaginaVentas> {
    return this.consultar(filtros, filtros.limit, filtros.offset);
  }

  private async consultar(
    filtros: FiltrosVentasDto,
    limit: number | null,
    offset = 0,
  ): Promise<PaginaVentas> {
    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      throw new BadRequestException(
        'La fecha Desde no puede ser posterior a Hasta',
      );
    }
    // Fechas inclusivas en Chile. Los totales y filas se leen en una única instantánea;
    // la agregación de líneas no multiplica las ventas ni sus montos.
    const [pagina] = await this.source.query<PaginaVentas[]>(
      `
      WITH filtradas AS (
        SELECT v.*, u.nombre_usuario, u.correo_usuario
        FROM venta v LEFT JOIN usuario u USING(usuario_id)
        WHERE ($1::text IS NULL OR strpos(lower(concat_ws(' ', v.venta_id::text, v.usuario_id::text,
                 u.nombre_usuario, u.correo_usuario, v.orden_paypal_id)), lower($1)) > 0)
          AND ($2::int IS NULL OR v.estado_pago_id = $2)
          AND ($3::date IS NULL OR v.fecha_venta >= ($3::date::timestamp AT TIME ZONE 'America/Santiago'))
          AND ($4::date IS NULL OR v.fecha_venta < (($4::date + 1)::timestamp AT TIME ZONE 'America/Santiago'))
      ), pagina AS (
        SELECT v.venta_id, v.usuario_id, v.nombre_usuario, v.correo_usuario, v.fecha_venta,
               v.estado_pago_id, e.descripcion_estado AS estado, m.nombre_metodo AS metodo_pago,
               v.total_venta, v.monto_cobrado::text, v.moneda_cobrada,
               COALESCE((SELECT json_agg(json_build_object(
                 'detalle_venta_id', d.detalle_venta_id, 'plan_id', d.plan_id, 'nombre_plan', p.nombre_plan,
                 'tipo_compra', d.tipo_compra, 'cantidad', d.cantidad,
                 'cupos_otorgados', d.cupos_otorgados, 'precio_uni', d.precio_uni)
                 ORDER BY d.detalle_venta_id)
                 FROM detalle_venta d JOIN plan p USING(plan_id) WHERE d.venta_id = v.venta_id), '[]'::json) AS detalles
        FROM filtradas v JOIN estado_pago e USING(estado_pago_id) JOIN metodo_pago m USING(metodo_pago_id)
        ORDER BY v.fecha_venta DESC, v.venta_id DESC LIMIT $5 OFFSET $6
      )
      SELECT (SELECT count(*)::int FROM filtradas) AS total,
             COALESCE((SELECT sum(total_venta) FROM filtradas WHERE estado_pago_id = 2), 0)::float8 AS total_pagado_clp,
             COALESCE((SELECT json_agg(pagina ORDER BY fecha_venta DESC, venta_id DESC) FROM pagina), '[]'::json) AS ventas
    `,
      [
        filtros.busqueda || null,
        filtros.estado_pago_id ?? null,
        filtros.desde ?? null,
        filtros.hasta ?? null,
        limit,
        offset,
      ],
    );
    return pagina;
  }

  async generarReporte(
    filtros: FiltrosVentasDto,
    formato: FormatoReporte = 'pdf',
  ): Promise<RenderedReport> {
    // LIMIT NULL exporta todos los resultados, independientemente de la página de la UI.
    const pagina = await this.consultar(filtros, null);
    const reporte = await this.jsreport.renderInline(
      plantillaReporte(formato, PLANTILLA_VENTAS, PLANTILLA_VENTAS_EXCEL),
      {
        generado: FECHA_CHILE.format(new Date()),
        filtros:
          [
            filtros.busqueda && `Búsqueda: ${filtros.busqueda}`,
            filtros.estado_pago_id &&
              `Estado: ${ESTADOS[filtros.estado_pago_id]}`,
            filtros.desde && `Desde: ${filtros.desde}`,
            filtros.hasta && `Hasta: ${filtros.hasta}`,
          ]
            .filter(Boolean)
            .join(' · ') || 'Todas las ventas',
        total: pagina.total,
        total_pagado: CLP.format(pagina.total_pagado_clp),
        total_pagado_clp: pagina.total_pagado_clp,
        ventas: pagina.ventas.map((venta) => ({
          ...venta,
          usuario: venta.nombre_usuario ?? 'Cuenta eliminada',
          correo: venta.correo_usuario ?? 'Sin cuenta asociada',
          fecha: FECHA_CHILE.format(new Date(venta.fecha_venta)),
          importe: CLP.format(venta.total_venta),
          cobro:
            venta.monto_cobrado && venta.moneda_cobrada
              ? `${venta.monto_cobrado} ${venta.moneda_cobrada}`
              : '',
          detalles: venta.detalles.map((d) => ({
            ...d,
            descripcion: d.tipo_compra === 'CUPOS' ? 'Cupos adicionales' : 'Plan Premium',
            cantidad: d.cantidad,
            subtotal: d.cantidad * d.precio_uni,
            precio: CLP.format(d.precio_uni),
          })),
        })),
      },
    );
    validarReporte(reporte, formato);
    return reporte;
  }
}
