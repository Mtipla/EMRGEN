import { ServiceUnavailableException } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import type { WhatsappConnectionService } from '../integrations/whatsapp/whatsapp-connection.service';
import { HealthController } from './health.controller';

describe('Disponibilidad de APIs y despacho SOS', () => {
  const query = jest.fn();
  const isReady = jest.fn();
  const getStatus = jest.fn();
  const health = new HealthController(
    { query } as unknown as DataSource,
    { isReady, getStatus } as unknown as WhatsappConnectionService,
  );
  beforeEach(() => {
    query.mockReset().mockResolvedValue([]);
    isReady.mockReturnValue(true);
    getStatus.mockReturnValue({
      enabled: true,
      state: 'open',
      phoneNumber: 'privado',
      lastError: 'privado',
    });
  });
  it('confirma PostgreSQL/esquema y WhatsApp sin divulgar datos del emisor', async () => {
    expect(await health.sos()).toMatchObject({
      database: 'up',
      sosReady: true,
      whatsapp: { enabled: true, state: 'open' },
    });
    expect(JSON.stringify(await health.ready())).not.toContain('privado');
  });
  it('mantiene disponible la API para vincular, pero rechaza el despacho si WhatsApp está deshabilitado', async () => {
    isReady.mockReturnValue(false);
    getStatus.mockReturnValue({ enabled: false, state: 'disabled' });
    expect(await health.ready()).toMatchObject({
      status: 'ready',
      sosReady: false,
    });
    await expect(health.sos()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
  it('un fallo de base de datos o de esquema no se presenta como disponible', async () => {
    query.mockRejectedValue(new Error('detalle privado de conexión'));
    await expect(health.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(health.live()).toEqual({ status: 'ok', service: 'emergen-backend' });
  });
});
