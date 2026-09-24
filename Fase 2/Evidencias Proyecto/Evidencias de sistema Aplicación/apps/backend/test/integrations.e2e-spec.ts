import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { generateKeyPairSync } from 'node:crypto';
import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { FirebaseAuthService } from './../src/integrations/firebase-auth/firebase-auth.service';
import { PaypalService } from './../src/integrations/paypal/paypal.service';

/**
 * Endpoints de las 5 integraciones a través de HTTP real (controlador + DTO +
 * ValidationPipe como en main.ts). Los proveedores externos se simulan con `fetch`.
 */
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const paypalToken = () => json({ access_token: 'tok', expires_in: 3600 });

describe('Integraciones externas (HTTP)', () => {
  const originalEnv = { ...process.env };
  let app: INestApplication<App>;
  let fetchMock: jest.SpyInstance;
  let http: () => ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication({ logger: false });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    http = () => request(app.getHttpServer());
  });

  afterAll(() => app.close());

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'client';
    process.env.PAYPAL_SECRET = 'secret';
    process.env.FIREBASE_PROJECT_ID = 'emergen-test';
    process.env.GOOGLE_MAPS_API_KEY = 'maps-key';
    process.env.JSREPORT_URL = 'http://jsreport.local';
    // Sin respuesta simulada, fetch falla: esta suite nunca debe salir a internet.
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('fetch no simulado en el test'));
    // PaypalService es singleton y cachea el token OAuth entre requests.
    (app.get(PaypalService) as unknown as { token?: unknown }).token =
      undefined;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  describe('PayPal', () => {
    it('POST /payments/paypal/orders crea la orden (201)', async () => {
      fetchMock.mockResolvedValueOnce(paypalToken()).mockResolvedValueOnce(
        json({
          id: 'ORDER1',
          status: 'CREATED',
          links: [{ rel: 'approve', href: 'https://paypal/approve' }],
        }),
      );

      const res = await http()
        .post('/payments/paypal/orders')
        .send({ amount: '9.99', description: 'Plan mensual' })
        .expect(201);

      expect(res.body).toEqual({
        id: 'ORDER1',
        status: 'CREATED',
        approveUrl: 'https://paypal/approve',
      });
    });

    it.each([
      [{ amount: 'abc' }],
      [{ amount: '-1' }],
      [{ amount: '1.999' }],
      [{ amount: '1.00', currency: 'usd' }],
      [{ amount: '1.00', precioReal: '0.01' }],
      [{}],
    ])('rechaza con 400 el body %j sin llamar a PayPal', async (body) => {
      await http().post('/payments/paypal/orders').send(body).expect(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    // Falla con el código actual: el regex del DTO acepta "0" y "0.00", que PayPal
    // rechaza (422) y el cliente recibe un 502 en vez de un 400 de validación.
    it('rechaza con 400 un monto cero', async () => {
      await http()
        .post('/payments/paypal/orders')
        .send({ amount: '0.00' })
        .expect(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('responde 503 si faltan las credenciales', async () => {
      delete process.env.PAYPAL_SECRET;
      await http()
        .post('/payments/paypal/orders')
        .send({ amount: '1.00' })
        .expect(503);
    });

    it('responde 502 si PayPal rechaza las credenciales (401)', async () => {
      fetchMock.mockResolvedValueOnce(json({ error: 'invalid_client' }, 401));
      const res = await http()
        .post('/payments/paypal/orders')
        .send({ amount: '1.00' })
        .expect(502);
      expect(JSON.stringify(res.body)).not.toContain('invalid_client');
    });

    it('POST .../capture captura la orden aprobada (201)', async () => {
      fetchMock.mockResolvedValueOnce(paypalToken()).mockResolvedValueOnce(
        json({
          id: 'ORDER12345',
          status: 'COMPLETED',
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

      const res = await http()
        .post('/payments/paypal/orders/ORDER12345/capture')
        .expect(201);
      expect(res.body).toMatchObject({
        status: 'COMPLETED',
        captureId: 'CAP1',
      });
    });

    it.each(['abc', 'order-1', 'ORDER%2F..%2Fx'])(
      'rechaza con 400 el orderId %p',
      async (orderId) => {
        await http()
          .post(`/payments/paypal/orders/${orderId}/capture`)
          .expect(400);
        expect(fetchMock).not.toHaveBeenCalled();
      },
    );
  });

  describe('Firebase Authentication', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    beforeEach(() => {
      const service = app.get(FirebaseAuthService);
      jest
        .spyOn(
          (
            service as unknown as {
              jwks: { getSigningKey: () => Promise<unknown> };
            }
          ).jwks,
          'getSigningKey',
        )
        .mockResolvedValue({ getPublicKey: () => publicKey });
    });

    it('GET /auth/me devuelve el usuario con un ID token válido (200)', async () => {
      const token = sign(
        { email: 'ana@example.com', email_verified: true },
        privateKey,
        {
          algorithm: 'RS256',
          keyid: 'k1',
          audience: 'emergen-test',
          issuer: 'https://securetoken.google.com/emergen-test',
          subject: 'uid-123',
          expiresIn: '1h',
        },
      );

      const res = await http()
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body).toEqual({
        uid: 'uid-123',
        email: 'ana@example.com',
        emailVerified: true,
      });
    });

    it('GET /auth/me responde 401 sin header', () =>
      http().get('/auth/me').expect(401));

    it('GET /auth/me responde 401 con un token inválido', () =>
      http().get('/auth/me').set('Authorization', 'Bearer x.y.z').expect(401));

    it('GET /auth/me responde 503 si falta FIREBASE_PROJECT_ID', () => {
      delete process.env.FIREBASE_PROJECT_ID;
      return http()
        .get('/auth/me')
        .set('Authorization', 'Bearer x.y.z')
        .expect(503);
    });
  });

  describe('jsReport', () => {
    it('POST /reports devuelve el PDF como descarga (200)', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(Buffer.from('%PDF-1.7'), {
          status: 200,
          headers: { 'Content-Type': 'application/pdf' },
        }),
      );

      const res = await http()
        .post('/reports')
        .send({ templateName: 'alertas', data: { total: 1 }, fileName: 'mayo' })
        .expect(200);

      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="mayo.pdf"',
      );
      expect(Buffer.from(res.body as Buffer).toString()).toBe('%PDF-1.7');
    });

    it.each([
      [{ templateName: '../secreto', data: {} }],
      [{ templateName: 'x', data: 'no-objeto' }],
      [{ templateName: 'x', data: {}, fileName: 'a"; x="b' }],
      [{ templateName: 'x', data: {}, template: { content: '<script>' } }],
    ])('rechaza con 400 el body %j', async (body) => {
      await http().post('/reports').send(body).expect(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('responde 502 si jsReport no está disponible', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
      await http()
        .post('/reports')
        .send({ templateName: 'alertas', data: {} })
        .expect(502);
    });
  });

  describe('Google Maps', () => {
    it('GET /maps/geocode geocodifica (200)', async () => {
      fetchMock.mockResolvedValueOnce(
        json({
          status: 'OK',
          results: [
            {
              formatted_address: 'Plaza de Armas, Santiago',
              place_id: 'p1',
              geometry: { location: { lat: -33.43, lng: -70.65 } },
            },
          ],
        }),
      );
      const res = await http()
        .get('/maps/geocode')
        .query({ address: 'Plaza de Armas' })
        .expect(200);
      expect(res.body[0].location).toEqual({ lat: -33.43, lng: -70.65 });
    });

    it('GET /maps/reverse-geocode convierte lat/lng a número (200)', async () => {
      fetchMock.mockResolvedValueOnce(
        json({ status: 'ZERO_RESULTS', results: [] }),
      );
      await http()
        .get('/maps/reverse-geocode')
        .query({ lat: '-33.44', lng: '-70.65' })
        .expect(200, []);
      const url = new URL(fetchMock.mock.calls[0][0] as string);
      expect(url.searchParams.get('latlng')).toBe('-33.44,-70.65');
    });

    it.each([
      ['/maps/geocode', {}],
      ['/maps/geocode', { address: 'ab' }],
      ['/maps/reverse-geocode', { lat: '91', lng: '0' }],
      ['/maps/reverse-geocode', { lat: '0', lng: '181' }],
      ['/maps/reverse-geocode', { lat: 'abc', lng: '0' }],
    ])('GET %s con %j responde 400', async (path, query) => {
      await http().get(path).query(query).expect(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('responde 503 si falta GOOGLE_MAPS_API_KEY', () => {
      delete process.env.GOOGLE_MAPS_API_KEY;
      return http()
        .get('/maps/geocode')
        .query({ address: 'Plaza de Armas' })
        .expect(503);
    });
  });

  describe('mindicador', () => {
    it('GET /indicators/uf devuelve el valor de la UF (200)', async () => {
      fetchMock.mockResolvedValueOnce(
        json({
          codigo: 'uf',
          nombre: 'Unidad de fomento (UF)',
          unidad_medida: 'Pesos',
          serie: [{ fecha: '2026-09-24T03:00:00.000Z', valor: 39000.5 }],
        }),
      );
      const res = await http().get('/indicators/uf').expect(200);
      expect(res.body.series[0]).toEqual({
        date: '2026-09-24T03:00:00.000Z',
        value: 39000.5,
      });
    });

    it('GET /indicators/uf?date=24-09-2026 pide ese día (200)', async () => {
      fetchMock.mockResolvedValueOnce(
        json({ codigo: 'uf', nombre: 'UF', unidad_medida: 'Pesos', serie: [] }),
      );
      await http()
        .get('/indicators/uf')
        .query({ date: '24-09-2026' })
        .expect(200);
      expect(fetchMock.mock.calls[0][0]).toBe(
        'https://mindicador.cl/api/uf/24-09-2026',
      );
    });

    it.each([
      ['/indicators/peso', {}],
      ['/indicators/uf', { date: '2026-09-24' }],
      ['/indicators/uf', { date: '24/09/2026' }],
    ])('GET %s con %j responde 400', async (path, query) => {
      await http().get(path).query(query).expect(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('responde 502 si mindicador.cl no responde', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
      await http().get('/indicators').expect(502);
    });
  });
});
