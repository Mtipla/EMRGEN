import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { createAppTestingModule } from './app-testing-module';
import { LoginService } from '../src/login/login.service';
import { WhatsappConnectionService } from '../src/integrations/whatsapp/whatsapp-connection.service';
import { WhatsappSosDispatcher } from '../src/integrations/whatsapp/whatsapp-sos-dispatcher.service';
import { GoogleMapsService } from '../src/integrations/google-maps/google-maps.service';
import { configureHttpBoundary } from '../src/config/http-boundary';

describe('registro HTTP y JWT de integraciones aisladas', () => {
  let app: INestApplication;
  let jwt: string;
  const geocode = jest.fn().mockResolvedValue([]);
  const origin = 'http://frontend.emergen-test.invalid';
  beforeAll(async () => {
    const module = await createAppTestingModule()
      .overrideProvider(LoginService).useValue({ buscarActivo: async () => ({ usuario_ID: 7, correo_usuario: null, rol_ID: 3, estado_ID: 2 }) })
      .overrideProvider(WhatsappConnectionService).useValue({ isReady: () => false })
      .overrideProvider(WhatsappSosDispatcher).useValue({})
      .overrideProvider(GoogleMapsService).useValue({ geocode })
      .compile();
    app = module.createNestApplication({ logger: false, bodyParser: false });
    configureHttpBoundary(app, [origin], 64);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.listen(0, '127.0.0.1');
    jwt = await module.get(JwtService).signAsync({ sub: 7 });
  });
  afterAll(async () => { await app?.close(); });
  it('creación PayPal genérica no está registrada', async () => { await request(app.getHttpServer()).post('/payments/paypal/orders').send({ amount: '1' }).expect(404); });
  it('captura genérica tampoco está registrada', async () => { await request(app.getHttpServer()).post('/payments/paypal/orders/ORDER1/capture').expect(404); });
  it('render genérico no está registrado', async () => { await request(app.getHttpServer()).post('/reports').send({ templateName: 'synthetic', data: {} }).expect(404); });
  it('mapas sin sesión no llega al proveedor', async () => {
    await request(app.getHttpServer()).get('/maps/geocode?address=synthetic').expect(401);
    expect(geocode).not.toHaveBeenCalled();
  });
  it('sesión parcial válida conserva mapas', async () => {
    await request(app.getHttpServer()).get('/maps/geocode?address=synthetic').set('Authorization', `Bearer ${jwt}`).expect(200, []);
    expect(geocode).toHaveBeenCalledTimes(1);
  });
  it('credencial inválida no llega al proveedor', async () => {
    await request(app.getHttpServer()).get('/maps/geocode?address=synthetic').set('Authorization', 'Bearer invalid').expect(401);
    expect(geocode).toHaveBeenCalledTimes(1);
  });
  for (const [name, contentType, body, status, message] of [
    ['413', 'application/json', JSON.stringify({ value: 'x'.repeat(80) }), 413, 'Cuerpo de solicitud demasiado grande'],
    ['415', 'text/plain', 'synthetic', 415, 'Usa application/json'],
    ['400', 'application/json', '{', 400, 'JSON inválido o estructura no admitida'],
  ] as const) {
    it('CORS: rechazo temprano ' + name + ' conserva cabecera y contrato', async () => {
      const before = geocode.mock.calls.length;
      await request(app.getHttpServer()).post('/maps/geocode')
        .set('Origin', origin).set('Content-Type', contentType).send(body)
        .expect('Access-Control-Allow-Origin', origin)
        .expect(status, { statusCode: status, message, error: 'Request rejected' });
      expect(geocode).toHaveBeenCalledTimes(before);
    });
  }
  it('CORS: respuesta válida del proveedor falso conserva sesión parcial', async () => {
    await request(app.getHttpServer()).get('/maps/geocode?address=synthetic')
      .set('Origin', origin).set('Authorization', 'Bearer ' + jwt)
      .expect('Access-Control-Allow-Origin', origin).expect(200, []);
  });
  it('CORS: preflight permitido no llega al proveedor ni habilita credenciales', async () => {
    const before = geocode.mock.calls.length;
    const result = await request(app.getHttpServer()).options('/maps/geocode')
      .set('Origin', origin).set('Access-Control-Request-Method', 'GET')
      .expect('Access-Control-Allow-Origin', origin).expect(204);
    expect(result.headers['access-control-allow-credentials']).toBeUndefined();
    expect(geocode).toHaveBeenCalledTimes(before);
  });
  it('CORS: origen ajeno no recibe autorización en un rechazo temprano', async () => {
    const before = geocode.mock.calls.length;
    const result = await request(app.getHttpServer()).post('/maps/geocode')
      .set('Origin', 'http://unlisted.emergen-test.invalid').set('Content-Type', 'text/plain')
      .send('synthetic').expect(415);
    expect(result.headers['access-control-allow-origin']).toBeUndefined();
    expect(result.body).toEqual({ statusCode: 415, message: 'Usa application/json', error: 'Request rejected' });
    expect(geocode).toHaveBeenCalledTimes(before);
  });
});
