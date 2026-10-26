import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WhatsappSosDispatcher } from './whatsapp-sos-dispatcher.service';
import { WhatsappAlertService } from './whatsapp-alert.service';
import { WhatsappConnectionService } from './whatsapp-connection.service';

describe('Cola de SOS WhatsApp', () => {
  const row = {
    envio_alerta_id: 1,
    tipo_notificacion: 'ACTIVACION',
    alerta_id: 2,
    num_emergencia: '+56900000001',
    nombre_usuario: 'Prueba',
    correo_usuario: 'prueba@emergen.test',
    texto_mensaje: 'Ayuda',
    tipo_prioridad: 'URBANO',
    ubicacion: 'SIMULADA: -33.4378,-70.6504',
    fecha_creacion: new Date('2026-10-26T15:30:00Z'),
  };
  let service: WhatsappSosDispatcher;
  const manager = { query: jest.fn() };
  const source = { query: jest.fn(), transaction: jest.fn() };
  const connection = { isReady: jest.fn() };
  const alerts = {
    sendEmergencyAlert: jest.fn(),
    sendFinalizedAlert: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    connection.isReady.mockReturnValue(true);
    source.transaction.mockImplementation((callback) => callback(manager));
    manager.query
      .mockResolvedValueOnce([row])
      .mockResolvedValueOnce([])
      .mockResolvedValue([]);
    alerts.sendEmergencyAlert.mockResolvedValue({
      sent: 1,
      deliveries: [{ status: 'sent' }],
    });
    alerts.sendFinalizedAlert.mockResolvedValue({
      sent: 1,
      deliveries: [{ status: 'sent' }],
    });
    service = new WhatsappSosDispatcher(
      source as unknown as DataSource,
      connection as unknown as WhatsappConnectionService,
      alerts as unknown as WhatsappAlertService,
    );
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    jest.restoreAllMocks();
  });

  it('resuelve el mensaje, usuario, fecha, contacto y coordenadas del SOS guardado', async () => {
    await service.dispatchPending();
    expect(alerts.sendEmergencyAlert).toHaveBeenCalledWith({
      recipients: [row.num_emergencia],
      senderName: 'Prueba',
      senderEmail: 'prueba@emergen.test',
      occurredAt: '2026-10-26T15:30:00.000Z',
      emergencyType: 'URBANO',
      message: 'Ayuda',
      location: { lat: -33.4378, lng: -70.6504 },
      locationLabel: row.ubicacion,
    });
    expect(manager.query.mock.calls[1][1]).toEqual([1, 2]);
    expect(manager.query.mock.calls[0][0]).toContain(
      'FOR UPDATE OF e,a,u,c SKIP LOCKED',
    );
  });

  it('procesa un cierre sin volver a enviar el mensaje inicial ni la ubicación', async () => {
    manager.query.mockReset();
    manager.query
      .mockResolvedValueOnce([{ ...row, tipo_notificacion: 'FINALIZACION' }])
      .mockResolvedValueOnce([])
      .mockResolvedValue([]);
    await service.dispatchPending();
    expect(alerts.sendFinalizedAlert).toHaveBeenCalledWith({
      recipients: [row.num_emergencia],
      senderName: 'Prueba',
      senderEmail: 'prueba@emergen.test',
    });
    expect(alerts.sendEmergencyAlert).not.toHaveBeenCalled();
    expect(manager.query.mock.calls[1][1]).toEqual([1, 2]);
  });

  it('un cierre también queda pendiente mientras WhatsApp está desconectado', async () => {
    connection.isReady.mockReturnValue(false);
    await service.dispatchPending();
    expect(alerts.sendFinalizedAlert).not.toHaveBeenCalled();
    expect(source.query).not.toHaveBeenCalled();
  });

  it('conserva los pendientes mientras no haya conexión', async () => {
    connection.isReady.mockReturnValue(false);
    await service.dispatchPending();
    expect(source.transaction).not.toHaveBeenCalled();
    expect(alerts.sendEmergencyAlert).not.toHaveBeenCalled();
  });

  it('registra FALLIDO si el proveedor agota los intentos', async () => {
    alerts.sendEmergencyAlert.mockResolvedValue({
      sent: 0,
      deliveries: [{ status: 'failed' }],
    });
    await service.dispatchPending();
    expect(manager.query.mock.calls[1][1]).toEqual([1, 3]);
  });

  it('deja que la transacción revierta si la conexión desaparece antes de enviar', async () => {
    alerts.sendEmergencyAlert.mockRejectedValue(
      new ServiceUnavailableException(),
    );
    await service.dispatchPending();
    expect(manager.query).toHaveBeenCalledTimes(1);
  });

  it('no superpone dos ciclos del mismo despachador', async () => {
    let finish!: (value: unknown) => void;
    alerts.sendEmergencyAlert.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const first = service.dispatchPending();
    await new Promise<void>((resolve) => setImmediate(resolve));
    await service.dispatchPending();
    expect(alerts.sendEmergencyAlert).toHaveBeenCalledTimes(1);
    finish({ sent: 1, deliveries: [{ status: 'sent' }] });
    await first;
  });
});
