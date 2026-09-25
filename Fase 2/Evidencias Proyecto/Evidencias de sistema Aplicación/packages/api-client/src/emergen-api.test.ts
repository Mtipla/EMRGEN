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

  it('paypal.createOrder hace POST JSON al backend', async () => {
    fetchMock.mockResolvedValueOnce(json({ id: 'ORDER1', status: 'CREATED' }));

    await expect(api.paypal.createOrder({ amount: '9.99' })).resolves.toEqual({
      id: 'ORDER1',
      status: 'CREATED',
    });
    const { url, init, headers } = lastCall();
    expect(url).toBe('http://api.test/payments/paypal/orders');
    expect(init.method).toBe('POST');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({ amount: '9.99' });
  });

  it('paypal.captureOrder codifica el id de la orden', async () => {
    fetchMock.mockResolvedValueOnce(json({ orderId: 'x', status: 'COMPLETED' }));
    await api.paypal.captureOrder('A/B');
    expect(lastCall().url).toBe('http://api.test/payments/paypal/orders/A%2FB/capture');
  });

  it('auth.me envía el ID token como Bearer', async () => {
    fetchMock.mockResolvedValueOnce(json({ uid: 'u1', emailVerified: true }));
    await api.auth.me('id-token');
    expect(lastCall().headers.get('Authorization')).toBe('Bearer id-token');
  });

  it('indicators.get arma la ruta y la fecha', async () => {
    fetchMock.mockImplementation(async () => json({ code: 'uf', series: [] }));
    await api.indicators.get('uf');
    expect(lastCall().url).toBe('http://api.test/indicators/uf');
    await api.indicators.get('uf', '24-09-2026');
    expect(lastCall().url).toBe('http://api.test/indicators/uf?date=24-09-2026');
  });

  it('maps codifica la dirección y las coordenadas', async () => {
    fetchMock.mockImplementation(async () => json([]));
    await api.maps.geocode('Av. Libertador & 123');
    expect(lastCall().url).toBe('http://api.test/maps/geocode?address=Av.+Libertador+%26+123');
    await api.maps.reverseGeocode({ lat: -33.4, lng: -70.6 });
    expect(lastCall().url).toBe('http://api.test/maps/reverse-geocode?lat=-33.4&lng=-70.6');
  });

  it('reports.generate devuelve un Blob', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(new Uint8Array([37, 80, 68, 70]), {
        headers: { 'Content-Type': 'application/pdf' },
      }),
    );
    const blob = await api.reports.generate({ templateName: 'x', data: {} });
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBe(4);
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
    const error = await api.paypal.createOrder({ amount: '1' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status, message, body });
  });

  it('lanza ApiError aunque el cuerpo del error no sea JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>Bad Gateway</html>', { status: 502 }));
    await expect(api.indicators.today()).rejects.toMatchObject({
      status: 502,
      message: 'Error HTTP 502',
    });
  });

  it('propaga el fallo de red (backend apagado)', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(api.indicators.today()).rejects.toThrow('Failed to fetch');
  });
});
