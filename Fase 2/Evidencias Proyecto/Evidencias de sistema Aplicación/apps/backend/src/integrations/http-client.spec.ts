import { BadGatewayException, Logger } from '@nestjs/common';
import { requestExternal, requestExternalJson } from './http-client';

describe('requestExternal', () => {
  let fetchMock: jest.SpyInstance;
  let logError: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch');
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    fetchMock.mockRestore();
    logError.mockRestore();
  });

  it('devuelve la respuesta cuando el proveedor responde 200', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"ok":true}', { status: 200 }),
    );
    await expect(
      requestExternalJson('Prueba', 'https://api.test/ok'),
    ).resolves.toEqual({ ok: true });
  });

  it.each([400, 401, 404, 500, 503])(
    'convierte HTTP %i del proveedor en 502 sin exponer el cuerpo',
    async (status) => {
      fetchMock.mockResolvedValueOnce(
        new Response('{"detalle":"secreto interno"}', { status }),
      );

      const error = await requestExternal('Prueba', 'https://api.test').catch(
        (e: unknown) => e,
      );

      expect(error).toBeInstanceOf(BadGatewayException);
      expect((error as Error).message).toBe(
        `Prueba rechazó la solicitud (HTTP ${status}).`,
      );
      expect((error as Error).message).not.toContain('secreto');
    },
  );

  it('convierte un fallo de red en 502', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await expect(requestExternal('Prueba', 'https://api.test')).rejects.toThrow(
      'Prueba: no se pudo contactar al proveedor.',
    );
  });

  it('aborta la petición al superar timeoutMs y responde 502', async () => {
    fetchMock.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) =>
          init.signal!.addEventListener('abort', () =>
            reject(init.signal!.reason),
          ),
        ),
    );

    const started = Date.now();
    await expect(
      requestExternal('Prueba', 'https://api.test', { timeoutMs: 50 }),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it('usa 15 s de timeout por defecto', async () => {
    const timeout = jest.spyOn(AbortSignal, 'timeout');
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    await requestExternal('Prueba', 'https://api.test');
    expect(timeout).toHaveBeenCalledWith(15_000);
    timeout.mockRestore();
  });

  it('nunca registra la URL (puede llevar la API key) en el log', async () => {
    fetchMock.mockResolvedValueOnce(new Response('denied', { status: 403 }));
    await requestExternal(
      'Prueba',
      'https://api.test/geocode?key=CLAVE-SECRETA',
    ).catch(() => undefined);

    expect(logError).toHaveBeenCalled();
    for (const [message] of logError.mock.calls)
      expect(String(message)).not.toContain('CLAVE-SECRETA');
  });

  // Falla con el código actual: `response.json()` queda fuera del try de
  // requestExternal, así que un 200 con HTML/JSON roto termina en un 500 genérico.
  it('responde 502 si el proveedor devuelve 200 con un cuerpo que no es JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('<html>Mantenimiento</html>', { status: 200 }),
    );
    await expect(
      requestExternalJson('Prueba', 'https://api.test'),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
