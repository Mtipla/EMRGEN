import { Logger, ServiceUnavailableException } from '@nestjs/common';
import type { WhatsappAuthStateStore } from './whatsapp-auth-state.store';
import { WhatsappConnectionService } from './whatsapp-connection.service';

describe('WhatsappConnectionService', () => {
  const load = jest.fn();
  const authStore = { load, clear: jest.fn() } as unknown as WhatsappAuthStateStore;
  let service: WhatsappConnectionService;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    service = new WhatsappConnectionService(authStore);
  });

  afterEach(() => {
    service.onModuleDestroy();
    delete process.env.WHATSAPP_ENABLED;
    jest.restoreAllMocks();
  });

  describe('con WHATSAPP_ENABLED sin definir', () => {
    it('no se conecta al arrancar', () => {
      service.onApplicationBootstrap();
      expect(load).not.toHaveBeenCalled();
      expect(service.getStatus()).toEqual({
        enabled: false,
        state: 'disabled',
        qrAvailable: false,
        phoneNumber: undefined,
        lastError: undefined,
      });
    });

    it('responde 503 al enviar, vincular o cerrar sesión', async () => {
      expect(() => service.assertReady()).toThrow(ServiceUnavailableException);
      await expect(service.send('x@s.whatsapp.net', { text: 'hola' })).rejects.toThrow(
        /WHATSAPP_ENABLED=true/,
      );
      await expect(service.requestPairingCode('+56912345678')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      await expect(service.logout()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('con WHATSAPP_ENABLED=true', () => {
    // Timers simulados: la conexión agendada con setImmediate nunca llega a ejecutarse.
    beforeEach(() => {
      jest.useFakeTimers();
      process.env.WHATSAPP_ENABLED = 'true';
      service.onApplicationBootstrap();
    });

    afterEach(() => jest.useRealTimers());

    it('arranca en segundo plano sin bloquear el bootstrap', () => {
      expect(load).not.toHaveBeenCalled();
      expect(service.getStatus()).toMatchObject({ enabled: true, state: 'connecting' });
      expect(service.isReady()).toBe(false);
    });

    it('no envía hasta que la sesión esté abierta', async () => {
      await expect(service.findAccount('56912345678')).rejects.toThrow(
        /no está conectado \(estado: connecting\)/,
      );
    });

    it('no pide código de emparejamiento antes de tener socket', async () => {
      await expect(service.requestPairingCode('+56912345678')).rejects.toThrow(
        /aún no está listo para vincular/,
      );
    });

    it('no se conecta si el módulo se destruye antes de arrancar', () => {
      service.onModuleDestroy();
      jest.runAllTimers();
      expect(load).not.toHaveBeenCalled();
    });
  });
});
