import { ServiceUnavailableException } from '@nestjs/common';
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
    fetchMock.mockRestore();
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
});
