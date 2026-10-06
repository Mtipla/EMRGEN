import { Logger, ServiceUnavailableException } from '@nestjs/common';
import type { SendEmergencyAlertRequest } from '@repo/api-types';
import { WhatsappAlertService } from './whatsapp-alert.service';
import type { WhatsappConnectionService } from './whatsapp-connection.service';

const alert: SendEmergencyAlertRequest = {
  recipients: ['912345678'],
  senderName: 'Ana',
  message: 'Necesito ayuda',
  location: { lat: -33.4378, lng: -70.6504, address: 'Plaza de Armas' },
};

describe('WhatsappAlertService', () => {
  const connection = {
    assertReady: jest.fn(),
    findAccount: jest.fn(),
    send: jest.fn(),
  };
  const service = new WhatsappAlertService(
    connection as unknown as WhatsappConnectionService,
  );

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    connection.findAccount.mockImplementation((digits: string) =>
      Promise.resolve(`${digits}@s.whatsapp.net`),
    );
    connection.send.mockResolvedValueOnce('MSG-TEXT').mockResolvedValueOnce('MSG-LOC');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('envía el texto y luego el pin de ubicación', async () => {
    const result = await service.sendEmergencyAlert(alert);

    expect(result).toMatchObject({
      sent: 1,
      failed: 0,
      deliveries: [
        { phoneNumber: '912345678', status: 'sent', messageIds: ['MSG-TEXT', 'MSG-LOC'] },
      ],
    });
    expect(connection.findAccount).toHaveBeenCalledWith('56912345678');
    const [[jid, text], [, location]] = connection.send.mock.calls;
    expect(jid).toBe('56912345678@s.whatsapp.net');
    expect(text.text).toContain('Necesito ayuda');
    expect(location.location.degreesLatitude).toBe(-33.4378);
  });

  it('lanza 503 sin enviar nada si no hay sesión', async () => {
    connection.assertReady.mockImplementation(() => {
      throw new ServiceUnavailableException();
    });
    await expect(service.sendEmergencyAlert(alert)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(connection.send).not.toHaveBeenCalled();
  });

  it('envía una sola vez al mismo número escrito de dos formas', async () => {
    connection.send.mockResolvedValue('MSG');
    const result = await service.sendEmergencyAlert({
      ...alert,
      recipients: ['912345678', '+56912345678'],
    });
    expect(result.deliveries).toHaveLength(1);
    expect(connection.findAccount).toHaveBeenCalledTimes(1);
  });

  it('informa por contacto los números sin WhatsApp', async () => {
    connection.findAccount.mockResolvedValueOnce(undefined);
    const result = await service.sendEmergencyAlert(alert);
    expect(result).toMatchObject({
      sent: 0,
      failed: 1,
      deliveries: [{ status: 'not_on_whatsapp', messageIds: [] }],
    });
    expect(connection.send).not.toHaveBeenCalled();
  });

  it('reintenta ante errores temporales (CA-08.1)', async () => {
    jest.useFakeTimers();
    connection.send.mockReset();
    connection.send
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce('MSG-TEXT')
      .mockResolvedValueOnce('MSG-LOC');

    const pending = service.sendEmergencyAlert(alert);
    await jest.runAllTimersAsync();

    await expect(pending).resolves.toMatchObject({ sent: 1 });
    expect(connection.send).toHaveBeenCalledTimes(3);
  });

  it('marca "failed" tras agotar los reintentos, sin afectar a otros contactos', async () => {
    jest.useFakeTimers();
    connection.send.mockReset();
    connection.send.mockImplementation((jid: string) =>
      jid.startsWith('56911111111')
        ? Promise.reject(new Error('caído'))
        : Promise.resolve('MSG'),
    );

    const pending = service.sendEmergencyAlert({
      ...alert,
      recipients: ['911111111', '922222222'],
    });
    await jest.runAllTimersAsync();
    const result = await pending;

    expect(result).toMatchObject({ sent: 1, failed: 1 });
    expect(result.deliveries[0]).toMatchObject({ phoneNumber: '911111111', status: 'failed' });
    expect(result.deliveries[1]).toMatchObject({ phoneNumber: '922222222', status: 'sent' });
  });

  it('sigue siendo "sent" si solo falla el pin de ubicación', async () => {
    connection.send.mockReset();
    connection.send
      .mockResolvedValueOnce('MSG-TEXT')
      .mockRejectedValueOnce(new Error('sin pin'));

    const result = await service.sendEmergencyAlert(alert);
    expect(result.deliveries[0]).toMatchObject({ status: 'sent', messageIds: ['MSG-TEXT'] });
  });
});
