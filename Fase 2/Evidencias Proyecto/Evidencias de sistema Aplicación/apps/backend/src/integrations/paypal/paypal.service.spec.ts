import {
  BadGatewayException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PaypalService } from './paypal.service';

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('PaypalService', () => {
  const originalEnv = { ...process.env };
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'test-client';
    process.env.PAYPAL_SECRET = 'test-secret';
    delete process.env.PAYPAL_MODE;
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('crea una orden en sandbox y reutiliza el token OAuth', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok', expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'ORDER1',
          status: 'CREATED',
          links: [{ rel: 'approve', href: 'https://paypal/approve' }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ id: 'ORDER2', status: 'CREATED', links: [] }),
      );

    const service = new PaypalService();
    const order = await service.createOrder({ amount: '9.99' });
    await service.createOrder({ amount: '1.00' });

    expect(order).toEqual({
      id: 'ORDER1',
      status: 'CREATED',
      approveUrl: 'https://paypal/approve',
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    );
    const body = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(body.purchase_units[0].amount).toEqual({
      currency_code: 'USD',
      value: '9.99',
    });
  });

  it('extrae los datos de la captura', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok', expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'ORDER1',
          status: 'COMPLETED',
          payer: { email_address: 'comprador@example.com' },
          purchase_units: [
            {
              payments: {
                captures: [
                  {
                    id: 'CAP1',
                    status: 'COMPLETED',
                    amount: { value: '9.99', currency_code: 'USD' },
                  },
                ],
              },
            },
          ],
        }),
      );

    await expect(new PaypalService().captureOrder('ORDER1')).resolves.toEqual({
      orderId: 'ORDER1',
      status: 'COMPLETED',
      captureId: 'CAP1',
      amount: { value: '9.99', currency: 'USD' },
      payerEmail: 'comprador@example.com',
    });
  });

  it('responde 503 si las credenciales son el marcador de ejemplo', async () => {
    process.env.PAYPAL_CLIENT_ID = '<INSERT_YOUR_PAYPAL_CLIENT_ID_HERE>';
    await expect(
      new PaypalService().createOrder({ amount: '1.00' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('pide un token nuevo cuando el anterior expira', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok1', expires_in: 3600 }),
      )
      .mockResolvedValueOnce(jsonResponse({ id: 'ORDER1', status: 'CREATED' }))
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok2', expires_in: 3600 }),
      )
      .mockResolvedValueOnce(jsonResponse({ id: 'ORDER2', status: 'CREATED' }));

    const service = new PaypalService();
    await service.createOrder({ amount: '1.00' });
    // 1 minuto de margen: a los 3541 s el token ya se considera vencido.
    now.mockReturnValue(1_000_000 + 3_541_000);
    await service.createOrder({ amount: '1.00' });
    now.mockRestore();

    const urls = fetchMock.mock.calls.map(([url]) => url as string);
    expect(urls.filter((url) => url.endsWith('/v1/oauth2/token'))).toHaveLength(
      2,
    );
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe(
      'Bearer tok2',
    );
  });

  it('envía Basic auth con client id y secret al pedir el token', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok', expires_in: 3600 }),
      )
      .mockResolvedValueOnce(jsonResponse({ id: 'ORDER1', status: 'CREATED' }));

    await new PaypalService().createOrder({ amount: '1.00' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe(
      `Basic ${Buffer.from('test-client:test-secret').toString('base64')}`,
    );
    expect(init.body).toBe('grant_type=client_credentials');
    expect(fetchMock.mock.calls[1][1].headers['PayPal-Request-Id']).toMatch(
      /^[0-9a-f-]{36}$/,
    );
  });

  it('responde 502 y no crea la orden si PayPal rechaza las credenciales (401)', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    fetchMock.mockResolvedValueOnce(
      new Response('{"error":"invalid_client"}', { status: 401 }),
    );

    await expect(
      new PaypalService().createOrder({ amount: '1.00' }),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('responde 502 si la captura falla en PayPal (ej. 422 ORDER_NOT_APPROVED)', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok', expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        new Response('{"name":"UNPROCESSABLE_ENTITY"}', { status: 422 }),
      );

    await expect(
      new PaypalService().captureOrder('ORDER1'),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('usa la URL de producción con PAYPAL_MODE=live y acepta el link payer-action', async () => {
    process.env.PAYPAL_MODE = 'live';
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok', expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'ORDER1',
          status: 'PAYER_ACTION_REQUIRED',
          links: [{ rel: 'payer-action', href: 'https://paypal/checkout' }],
        }),
      );

    const order = await new PaypalService().createOrder({ amount: '1.00' });

    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://api-m.paypal.com/v2/checkout/orders',
    );
    expect(order.approveUrl).toBe('https://paypal/checkout');
  });
});
