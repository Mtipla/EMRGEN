import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { readEnv } from '../config/env';
import { WhatsappConnectionService } from '../integrations/whatsapp/whatsapp-connection.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly source: DataSource,
    private readonly whatsapp: WhatsappConnectionService,
  ) {}

  @Get()
  live() {
    return { status: 'ok', service: 'emergen-backend' };
  }

  /** La API puede aceptar login/vinculación aunque WhatsApp necesite reconectarse. */
  @Get('ready')
  async ready() {
    let database = 'up';
    try {
      await this.source.query(
        'SELECT e.tipo_notificacion,a.estado_alerta,c.compartir_antecedentes,s.trabajador_id,s.trabajador_nombre,s.trabajador_correo FROM envio_alerta e JOIN alerta a USING(alerta_id) LEFT JOIN contacto_emergencia c ON c.contacto_emergencia_id=e.contacto_emergencia_id LEFT JOIN soporte s ON false LIMIT 0',
      );
    } catch {
      database = 'down';
    }
    const connection = this.whatsapp.getStatus();
    const result = {
      status: database === 'up' ? 'ready' : 'unavailable',
      service: 'emergen-backend',
      environment: readEnv('EMERGEN_ENVIRONMENT') ?? 'development',
      deployment: readEnv('EMERGEN_DEPLOYMENT_ID') ?? 'local',
      database,
      sosReady: database === 'up' && this.whatsapp.isReady(),
      whatsapp: { enabled: connection.enabled, state: connection.state },
    };
    if (database !== 'up') throw new ServiceUnavailableException(result);
    return result;
  }

  /** Monitor de despacho SOS; no es la prueba de vida del contenedor. */
  @Get('sos')
  async sos() {
    const result = await this.ready();
    if (!result.sosReady) throw new ServiceUnavailableException(result);
    return result;
  }
}
