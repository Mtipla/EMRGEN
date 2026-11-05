import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { CAMPOS_FICHA, cifrarFicha } from '../../perfil/cifrado-medico';
import { WhatsappSosDispatcher } from './whatsapp-sos-dispatcher.service';
import { WhatsappAlertService } from './whatsapp-alert.service';
import { WhatsappConnectionService } from './whatsapp-connection.service';

describe('Cola de SOS WhatsApp', () => {
  const row = {
    envio_alerta_id: 1,
    tipo_notificacion: 'ACTIVACION',
    alerta_id: 2,
    usuario_id: 7,
    ficha_cifrada: null,
    num_emergencia: '+56900000001',
    compartir_antecedentes: true,
    nombre_usuario: 'Prueba',
    correo_usuario: 'prueba@emergen.test',
    texto_mensaje: 'Ayuda',
    tipo_prioridad: 'URBANO',
    ubicacion: 'SIMULADA: -33.4378,-70.6504',
    fecha_creacion: new Date('2026-10-26T15:30:00Z'),
  };
  let service: WhatsappSosDispatcher;
  let warn: jest.SpyInstance;
  const originalMedicalKeys = process.env.MEDICAL_DATA_KEYS;
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
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    process.env.MEDICAL_DATA_KEYS =
      'watest:' + randomBytes(32).toString('base64');
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
    if (originalMedicalKeys === undefined) delete process.env.MEDICAL_DATA_KEYS;
    else process.env.MEDICAL_DATA_KEYS = originalMedicalKeys;
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
      medicalInfo: undefined,
      includeMedicalInfo: true,
    });
    expect(manager.query.mock.calls[1][1]).toEqual([1, 2]);
    expect(manager.query.mock.calls[0][0]).toContain(
      'FOR UPDATE OF e,a,u,c SKIP LOCKED',
    );
  });

  it('descifra únicamente la ficha vinculada al emisor y envía sus seis campos', async () => {
    const record = {
      tipo_sangre: 'AB-',
      alergias: 'Penicilina',
      enfermedades_cronicas: 'Asma',
      medicamentos_actuales: 'Tratamiento de prueba',
      discapacidad_presente: '',
      donante_organos: true,
    };
    const encrypted = cifrarFicha(row.usuario_id, record);
    manager.query.mockReset();
    manager.query
      .mockResolvedValueOnce([
        {
          ...row,
          ficha_cifrada: Object.fromEntries(
            CAMPOS_FICHA.map((field, index) => [field, encrypted[index]]),
          ),
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValue([]);
    await service.dispatchPending();
    expect(alerts.sendEmergencyAlert).toHaveBeenCalledWith(
      expect.objectContaining({ medicalInfo: { record } }),
    );
  });

  it('un fallo de descifrado no impide el SOS ni envía el cifrado', async () => {
    manager.query.mockReset();
    manager.query
      .mockResolvedValueOnce([
        { ...row, ficha_cifrada: { tipo_sangre: 'INVALIDO' } },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValue([]);
    await service.dispatchPending();
    expect(alerts.sendEmergencyAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        medicalInfo: { summary: 'No disponibles en este momento.' },
      }),
    );
    expect(manager.query.mock.calls[1][1]).toEqual([1, 2]);
  });

  it('respeta permisos distintos para cada contacto y no descifra una ficha deshabilitada', async () => {
    manager.query.mockReset();
    manager.query
      .mockResolvedValueOnce([{ ...row, compartir_antecedentes: false, ficha_cifrada: { tipo_sangre: 'INVALIDO' } }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ ...row, envio_alerta_id: 3, num_emergencia: '+56900000002' }])
      .mockResolvedValueOnce([])
      .mockResolvedValue([]);
    await service.dispatchPending();
    expect(alerts.sendEmergencyAlert).toHaveBeenNthCalledWith(1, expect.objectContaining({
      recipients: [row.num_emergencia], includeMedicalInfo: false, medicalInfo: undefined,
    }));
    expect(alerts.sendEmergencyAlert).toHaveBeenNthCalledWith(2, expect.objectContaining({
      recipients: ['+56900000002'], includeMedicalInfo: true,
    }));
    expect(warn).not.toHaveBeenCalled();
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
