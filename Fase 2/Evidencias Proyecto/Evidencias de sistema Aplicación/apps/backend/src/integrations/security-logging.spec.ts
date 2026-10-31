import { Logger } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { boundedExternalBody, requestExternal } from './http-client';
import { BaileysLoggerAdapter } from './whatsapp/baileys-logger.adapter';
import { WhatsappConnectionService } from './whatsapp/whatsapp-connection.service';
import { WhatsappSosDispatcher } from './whatsapp/whatsapp-sos-dispatcher.service';
import { WhatsappAlertService } from './whatsapp/whatsapp-alert.service';
import type { WhatsappAuthStateStore } from './whatsapp/whatsapp-auth-state.store';
import * as loader from './whatsapp/baileys.loader';
import * as retry from './whatsapp/retry';

const marker = 'SYNTHETIC_PRIVATE_MARKER';
describe('logging: allowlist sin cuerpos, destinos ni excepciones', () => {
  let errorLog: jest.SpyInstance;
  beforeEach(() => {
    errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); delete process.env.WHATSAPP_ENABLED; });
  const noPrivateData = () => expect(JSON.stringify(errorLog.mock.calls)).not.toContain(marker);

  it('HTTP rechazado conserva 502 y solo registra campos permitidos', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(marker, { status: 403 }));
    await expect(requestExternal('Synthetic', `https://provider.invalid/?key=${marker}`)).rejects.toMatchObject({ status: 502 });
    expect(errorLog).toHaveBeenCalledWith({ event: 'provider_rejected', integration: 'Synthetic', status: 403 });
    noPrivateData();
  });
  it('fallo de red omite el texto de la excepción', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error(marker));
    await expect(requestExternal('Synthetic', 'https://provider.invalid')).rejects.toMatchObject({ status: 502 });
    expect(errorLog).toHaveBeenCalledWith({ event: 'provider_unavailable', integration: 'Synthetic' });
    noPrivateData();
  });
  it('adaptador Baileys omite objetos y mensajes del transporte', () => {
    new BaileysLoggerAdapter(new Logger('Synthetic')).error({ err: new Error(marker), session: marker }, marker);
    expect(errorLog).toHaveBeenCalledWith({ event: 'whatsapp_transport', level: 'error' });
    noPrivateData();
  });
  it('estado de conexión usa error genérico con loader falso', async () => {
    jest.useFakeTimers();
    process.env.WHATSAPP_ENABLED = 'true';
    jest.spyOn(loader, 'loadBaileys').mockRejectedValueOnce(new Error(marker));
    const connection = new WhatsappConnectionService({} as WhatsappAuthStateStore);
    try {
      await (connection as unknown as { connect(): Promise<void> }).connect();
      expect(connection.getStatus().lastError).toBe('Fallo de conexión WhatsApp; consulta el estado operativo.');
      noPrivateData();
    } finally { connection.onModuleDestroy(); }
  });
  it('fallo del dispatcher no registra error SQL ni inventa envío', async () => {
    const query = jest.fn().mockRejectedValueOnce(new Error(marker));
    const alerts = { sendEmergencyAlert: jest.fn() };
    const dispatcher = new WhatsappSosDispatcher({ query } as unknown as DataSource,
      { isReady: () => true } as WhatsappConnectionService, alerts as unknown as WhatsappAlertService);
    await dispatcher.dispatchPending();
    expect(errorLog).toHaveBeenCalledWith({ event: 'sos_dispatch_failed' });
    expect(alerts.sendEmergencyAlert).not.toHaveBeenCalled();
    noPrivateData();
  });
  it('entrega fallida conserva estado failed y omite detalles del proveedor', async () => {
    jest.spyOn(retry, 'withRetry').mockRejectedValueOnce(new Error(marker));
    const service = new WhatsappAlertService({ assertReady() {} } as WhatsappConnectionService);
    const result = await service.sendEmergencyAlert({ recipients: ['+12025550123'], message: 'Synthetic only' });
    expect(result.sent).toBe(0);
    expect(result.failed).toBe(1);
    expect(errorLog).toHaveBeenCalledWith({ event: 'whatsapp_delivery_failed' });
    noPrivateData();
  });
});

describe('respuesta externa: bytes reales acotados', () => {
  it('conserva una respuesta válida pequeña', async () => {
    const result = await boundedExternalBody(new Response('small'), 8);
    expect(new TextDecoder().decode(result)).toBe('small');
  });
  it('cancela una respuesta chunked excesiva con umbral pequeño', async () => {
    const cancel = jest.fn();
    const body = new ReadableStream({ start(controller) {
      controller.enqueue(new TextEncoder().encode('12345'));
      controller.enqueue(new TextEncoder().encode('6789'));
    }, cancel });
    await expect(boundedExternalBody(new Response(body), 8)).rejects.toMatchObject({ status: 502 });
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
