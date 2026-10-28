import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConsultarAlertasDto } from './dto/consultar-alertas.dto';

export interface AlertaAdmin {
  alerta_id: number;
  usuario_id: number | null;
  nombre_usuario: string | null;
  correo_usuario: string | null;
  estado_alerta: string;
  prioridad_id: number;
  prioridad: string;
  mensaje: string;
  ubicacion: string | null;
  fecha_creacion: string;
  fecha_cierre: string | null;
}

export interface PaginaAlertas {
  alertas: AlertaAdmin[];
  total: number;
  activas: number;
}

/** Consulta las mismas alertas de FastAPI, sin depender de su proceso ni duplicar escrituras SOS. */
@Injectable()
export class AdminAlertasService {
  constructor(private readonly source: DataSource) {}

  async listar(filtros: ConsultarAlertasDto): Promise<PaginaAlertas> {
    // Una sentencia mantiene el listado y sus contadores en la misma instantánea.
    const [pagina] = await this.source.query<PaginaAlertas[]>(
      `
      WITH filtradas AS (
        SELECT a.* FROM alerta a
        WHERE ($1::text IS NULL OR a.estado_alerta = $1)
          AND ($2::int IS NULL OR a.usuario_id = $2)
      ), pagina AS (
        SELECT a.alerta_id, a.usuario_id, u.nombre_usuario, u.correo_usuario,
               a.estado_alerta, a.prioridad_id, p.tipo_prioridad AS prioridad,
               d.texto_mensaje AS mensaje, l.ubicacion, a.fecha_creacion, a.fecha_cierre
        FROM filtradas a
        LEFT JOIN usuario u ON u.usuario_id = a.usuario_id
        JOIN prioridad p ON p.prioridad_id = a.prioridad_id
        JOIN detalle_alerta d ON d.detalle_alerta_id = a.detalle_alerta_id
        LEFT JOIN ubicacion_alerta l ON l.ubicacion_alerta_id = a.ubicacion_alerta_id
        ORDER BY a.fecha_creacion DESC, a.alerta_id DESC
        LIMIT $3 OFFSET $4
      )
      SELECT (SELECT count(*)::int FROM filtradas) AS total,
             (SELECT count(*)::int FROM alerta WHERE estado_alerta = 'ACTIVA') AS activas,
             COALESCE((SELECT json_agg(pagina ORDER BY fecha_creacion DESC, alerta_id DESC)
                       FROM pagina), '[]'::json) AS alertas
    `,
      [
        filtros.estado ?? null,
        filtros.usuario_id ?? null,
        filtros.limit,
        filtros.offset,
      ],
    );
    return pagina;
  }
}
