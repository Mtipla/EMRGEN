import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmergenApi } from './emergen-api';
import { ApiError } from './http';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('createEmergenApi', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const api = createEmergenApi('http://api.test/');

  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  const lastCall = () => {
    const [url, init] = fetchMock.mock.calls.at(-1)!;
    return {
      url: String(url),
      init: init!,
      headers: new Headers(init!.headers),
    };
  };

  it('paypal legacy fails locally without a provider request', async () => {
    await expect(api.paypal.createOrder({ amount: '1' })).rejects.toMatchObject({ status: 410 });
    await expect(api.paypal.captureOrder('synthetic')).rejects.toMatchObject({ status: 410 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('auth.me envía el ID token como Bearer', async () => {
    fetchMock.mockResolvedValueOnce(json({ uid: 'u1', emailVerified: true }));
    await api.auth.me('id-token');
    expect(lastCall().headers.get('Authorization')).toBe('Bearer id-token');
  });

  it('indicators.get arma la ruta y la fecha', async () => {
    fetchMock.mockImplementation(async () => json({ code: 'uf', series: [] }));
    await api.indicators.get('synthetic', 'uf');
    expect(lastCall().url).toBe('http://api.test/indicators/uf');
    await api.indicators.get('synthetic', 'uf', '24-09-2026');
    expect(lastCall().url).toBe('http://api.test/indicators/uf?date=24-09-2026');
  });

  it('maps codifica la dirección y las coordenadas', async () => {
    fetchMock.mockImplementation(async () => json([]));
    await api.maps.geocode('synthetic', 'Av. Libertador & 123');
    expect(lastCall().url).toBe('http://api.test/maps/geocode?address=Av.+Libertador+%26+123');
    await api.maps.reverseGeocode('synthetic', { lat: -33.4, lng: -70.6 });
    expect(lastCall().url).toBe('http://api.test/maps/reverse-geocode?lat=-33.4&lng=-70.6');
  });

  it('whatsapp.sendAlert hace POST con el JWT del administrador', async () => {
    fetchMock.mockResolvedValueOnce(json({ sent: 1, failed: 0, deliveries: [] }, 201));
    const alert = {
      recipients: ['912345678'],
      message: 'Necesito ayuda',
      location: { lat: -33.4, lng: -70.6 },
    };

    await expect(api.whatsapp.sendAlert('jwt', alert)).resolves.toMatchObject({ sent: 1 });
    const { url, init, headers } = lastCall();
    expect(url).toBe('http://api.test/notifications/whatsapp/alerts');
    expect(init.method).toBe('POST');
    expect(headers.get('Authorization')).toBe('Bearer jwt');
    expect(JSON.parse(init.body as string)).toEqual(alert);
  });

  it('whatsapp.qr devuelve el PNG como Blob', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(new Uint8Array([137, 80, 78, 71]), {
        headers: { 'Content-Type': 'image/png' },
      }),
    );
    const png = await api.whatsapp.qr('jwt');
    expect(png.type).toBe('image/png');
    expect(lastCall().url).toBe('http://api.test/notifications/whatsapp/qr');
  });

  it('reports legacy fails locally without a provider request', async () => {
    await expect(api.reports.generate({ templateName: 'synthetic', data: {} })).rejects.toMatchObject({ status: 410 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [
      400,
      { statusCode: 400, message: ['amount inválido', 'currency inválida'] },
      'amount inválido, currency inválida',
    ],
    [401, { statusCode: 401, message: 'Falta el header' }, 'Falta el header'],
    [
      502,
      { statusCode: 502, message: 'PayPal rechazó la solicitud (HTTP 500).' },
      'PayPal rechazó la solicitud (HTTP 500).',
    ],
    [503, { statusCode: 503, message: 'PayPal no está configurado' }, 'PayPal no está configurado'],
  ])('lanza ApiError con HTTP %i y el mensaje del backend', async (status, body, message) => {
    fetchMock.mockResolvedValueOnce(json(body, status));
    const error = await api.compras.createOrder('synthetic', 1, 'PLAN').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status, message, body });
  });

  it('lanza ApiError aunque el cuerpo del error no sea JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>Bad Gateway</html>', { status: 502 }));
    await expect(api.indicators.today('synthetic')).rejects.toMatchObject({
      status: 502,
      message: 'Error HTTP 502',
    });
  });

  it('propaga el fallo de red (backend apagado)', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(api.indicators.today('synthetic')).rejects.toThrow('Failed to fetch');
  });
});
