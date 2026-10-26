import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { parseAlertLocation } from './emergency-alert.message';
import { WhatsappAlertService } from './whatsapp-alert.service';
import { WhatsappConnectionService } from './whatsapp-connection.service';

interface PendingDelivery {
  envio_alerta_id: number;
  tipo_notificacion: 'ACTIVACION' | 'FINALIZACION';
  alerta_id: number;
  num_emergencia: string;
  nombre_usuario: string;
  correo_usuario: string;
  texto_mensaje: string;
  tipo_prioridad: string;
  ubicacion: string | null;
  fecha_creacion: Date;
}

/** Consume la cola que FastAPI confirma junto con el SOS; no necesita credenciales HTTP. */
@Injectable()
export class WhatsappSosDispatcher
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(WhatsappSosDispatcher.name);
  private timer?: NodeJS.Timeout;
  private running?: Promise<void>;
  private stopped = false;

  constructor(
    private readonly source: DataSource,
    private readonly connection: WhatsappConnectionService,
    private readonly alerts: WhatsappAlertService,
  ) {}

  onApplicationBootstrap(): void {
    this.timer = setInterval(() => {
      void this.dispatchPending();
    }, 2_000);
    this.timer.unref();
  }

  async onModuleDestroy(): Promise<void> {
    this.stopped = true;
    clearInterval(this.timer);
    await this.running;
  }

  async dispatchPending(): Promise<void> {
    if (this.stopped || this.running || !this.connection.isReady()) return;
    this.running = this.dispatchBatch().catch((error: unknown) => {
      this.logger.error(
        `No se pudo procesar la cola SOS: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
    try {
      await this.running;
    } finally {
      this.running = undefined;
    }
  }

  private async dispatchBatch(): Promise<void> {
    await this.source.query(`UPDATE envio_alerta e SET estado_envio_id=3
      FROM alerta a WHERE a.alerta_id=e.alerta_id AND e.estado_envio_id=1
      AND (a.usuario_id IS NULL OR e.contacto_emergencia_id IS NULL
        OR (e.tipo_notificacion='ACTIVACION' AND (a.estado_alerta<>'ACTIVA'
          OR a.fecha_creacion<=clock_timestamp()-interval '24 hours'))
        OR (e.tipo_notificacion='FINALIZACION' AND a.estado_alerta<>'FINALIZADA'))`);
    for (let i = 0; i < 5 && !this.stopped && this.connection.isReady(); i++) {
      const processed = await this.source.transaction(async (manager) => {
        const [row] = await manager.query<
          PendingDelivery[]
        >(`SELECT e.envio_alerta_id,e.tipo_notificacion,
          a.alerta_id,a.fecha_creacion,c.num_emergencia,u.nombre_usuario,u.correo_usuario,
          d.texto_mensaje,l.ubicacion,p.tipo_prioridad
          FROM envio_alerta e JOIN alerta a USING(alerta_id)
          JOIN usuario u ON u.usuario_id=a.usuario_id
          JOIN contacto_emergencia c ON c.contacto_emergencia_id=e.contacto_emergencia_id
            AND c.usuario_id=a.usuario_id
          JOIN detalle_alerta d USING(detalle_alerta_id)
          JOIN prioridad p ON p.prioridad_id=a.prioridad_id
          LEFT JOIN ubicacion_alerta l USING(ubicacion_alerta_id)
          WHERE e.estado_envio_id=1 AND (
            (e.tipo_notificacion='ACTIVACION' AND a.estado_alerta='ACTIVA'
              AND a.fecha_creacion>clock_timestamp()-interval '24 hours')
            OR (e.tipo_notificacion='FINALIZACION' AND a.estado_alerta='FINALIZADA'))
          ORDER BY e.envio_alerta_id LIMIT 1 FOR UPDATE OF e,a,u,c SKIP LOCKED`);
        if (!row) return false;
        const sender = {
          recipients: [row.num_emergencia],
          senderName: row.nombre_usuario,
          senderEmail: row.correo_usuario,
        };
        const result =
          row.tipo_notificacion === 'FINALIZACION'
            ? await this.alerts.sendFinalizedAlert(sender)
            : await this.alerts.sendEmergencyAlert({
                ...sender,
                emergencyType: row.tipo_prioridad,
                occurredAt: row.fecha_creacion.toISOString(),
                message: row.texto_mensaje,
                location: parseAlertLocation(row.ubicacion),
                locationLabel: row.ubicacion ?? undefined,
              });
        await manager.query(
          `UPDATE envio_alerta SET estado_envio_id=$2,
          fecha_envio=CASE WHEN $2=2 THEN GREATEST(clock_timestamp(),fecha_registro) END
          WHERE envio_alerta_id=$1`,
          [row.envio_alerta_id, result.sent === 1 ? 2 : 3],
        );
        this.logger.log(
          `SOS ${row.alerta_id}, ${row.tipo_notificacion}, envío ${row.envio_alerta_id}: ${result.deliveries[0]?.status ?? 'failed'}.`,
        );
        return true;
      });
      if (!processed) break;
    }
  }
}
