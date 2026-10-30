import { INestApplication, ValidationPipe } from '@nestjs/common';
import { generateKeyPairSync } from 'node:crypto';
import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { createAppTestingModule } from './app-testing-module';
import { FirebaseAuthService } from './../src/integrations/firebase-auth/firebase-auth.service';
import { JwtAuthGuard } from './../src/login/jwt-auth.guard';
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
    const moduleFixture = await createAppTestingModule().overrideGuard(JwtAuthGuard).useValue({
      canActivate: (context: { switchToHttp(): { getRequest(): { headers: Record<string,string> } } }) =>
        context.switchToHttp().getRequest().headers.authorization === 'Bearer synthetic',
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

  describe('PayPal HTTP generico retirado', () => {
    it('no publica creacion ni captura genericas', async () => {
      await http().post('/payments/paypal/orders').send({ amount: '1.00' }).expect(404);
      await http().post('/payments/paypal/orders/ORDER1/capture').expect(404);
      expect(fetchMock).not.toHaveBeenCalled();
    });
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

  describe('jsReport HTTP generico retirado', () => {
    it('no permite seleccionar plantillas por HTTP', async () => {
      await http().post('/reports').send({ templateName: 'synthetic', data: {} }).expect(404);
      expect(fetchMock).not.toHaveBeenCalled();
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
        .get('/maps/geocode').set('Authorization', 'Bearer synthetic')
        .query({ address: 'Plaza de Armas' })
        .expect(200);
      expect(res.body[0].location).toEqual({ lat: -33.43, lng: -70.65 });
    });

    it('GET /maps/reverse-geocode convierte lat/lng a número (200)', async () => {
      fetchMock.mockResolvedValueOnce(
        json({ status: 'ZERO_RESULTS', results: [] }),
      );
      await http()
        .get('/maps/reverse-geocode').set('Authorization', 'Bearer synthetic')
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
        .get('/maps/geocode').set('Authorization', 'Bearer synthetic')
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
      const res = await http().get('/indicators/uf').set('Authorization', 'Bearer synthetic').expect(200);
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
        .get('/indicators/uf').set('Authorization', 'Bearer synthetic')
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
      await http().get('/indicators').set('Authorization', 'Bearer synthetic').expect(502);
    });
  });
});
