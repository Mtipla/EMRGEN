import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { FirebaseAuthService } from '../src/integrations/firebase-auth/firebase-auth.service';
import { PaypalService } from '../src/integrations/paypal/paypal.service';
import { MindicadorService } from '../src/integrations/mindicador/mindicador.service';
import { JsreportService } from '../src/integrations/jsreport/jsreport.service';
import { GoogleMapsService } from '../src/integrations/google-maps/google-maps.service';
import { WhatsappConnectionService } from '../src/integrations/whatsapp/whatsapp-connection.service';
import { WhatsappSosDispatcher } from '../src/integrations/whatsapp/whatsapp-sos-dispatcher.service';
import { boundedJson } from '../src/config/security';

if (process.env.SECURITY_ISOLATED_DB !== '1' || process.env.DB_NAME !== 'emergen_security_test' ||
    process.env.DB_PORT !== '55439' || process.env.DB_HOST !== '127.0.0.1' || process.env.EMERGEN_ENVIRONMENT !== 'test')
  throw new Error('This file requires the disposable security-db-check runner');

describe('integridad nominal con PostgreSQL desechable y proveedores falsos', () => {
  let app: INestApplication;
  let db: DataSource;
  const tokens: Record<string, string> = {};
  const password = 'Synthetic-only-' + Math.random().toString(36);
  const pin = '4826';
  let amount = '';
  const captured = () => ({ orderId: 'SYNTHETICORDER1', status: 'COMPLETED', captureId: 'SYNTHETICCAPTURE1',
    captureStatus: 'COMPLETED', amount: { value: amount, currency: 'USD' } });
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FirebaseAuthService).useValue({ verifyIdToken: async () => ({ uid: 'synthetic',
        email: 'register@example.invalid', emailVerified: true, authTime: Date.now() / 1000 }) })
      .overrideProvider(PaypalService).useValue({ createOrder: async (dto: { amount: string }) => {
        amount = dto.amount; return { id: 'SYNTHETICORDER1', status: 'CREATED', approveUrl: 'https://payments.example.invalid' };
      }, captureOrder: async () => captured(), getOrder: async () => captured() })
      .overrideProvider(MindicadorService).useValue({ get: async () => ({ code: 'dolar', series: [{ value: 1000 }] }), today: async () => [] })
      .overrideProvider(JsreportService).useValue({ renderInline: async () => ({ content: Buffer.from('%PDF-1.7\nsynthetic report'), contentType: 'application/pdf' }) })
      .overrideProvider(GoogleMapsService).useValue({ geocode: async () => [] })
      .overrideProvider(WhatsappConnectionService).useValue({ isReady: () => false, getStatus: () => ({ enabled: false, state: 'disabled' }) })
      .overrideProvider(WhatsappSosDispatcher).useValue({})
      .compile();
    app = module.createNestApplication({ logger: false, bodyParser: false });
    app.use(boundedJson());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.listen(0, '127.0.0.1');
    db = app.get(DataSource);
    const hash = await bcrypt.hash(password, 4);
    const pinHash = await bcrypt.hash(pin, 12);
    for (const [id, role] of [[900001, 3], [900004, 1], [900005, 2]]) {
      const [credential] = await db.query('INSERT INTO pin(pin_hash) VALUES($1) RETURNING pin_id', [pinHash]);
      await db.query('INSERT INTO usuario(usuario_id,nombre_usuario,correo_usuario,contra_usuario,rol_id,estado_id,pin_id) VALUES($1,$2,$3,$4,$5,1,$6)',
        [id, 'Synthetic', `synthetic${id}@example.invalid`, hash, role, credential.pin_id]);
      tokens[String(id)] = await app.get(JwtService).signAsync({ sub: id });
    }
    await db.query('INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES(900001,2,0)');
    // Independent test secrets/fixtures; never printed or exported.
  });
  afterAll(async () => { await app?.close(); });
  const http = () => request(app.getHttpServer());
  const auth = (id = 900001) => `Bearer ${tokens[String(id)]}`;

  it('registro, verificación, selección de perfil/PIN y recuperación mantienen contrato', async () => {
    const data = { nombre_usuario: 'Synthetic Registration', correo_usuario: 'register@example.invalid', password };
    await http().post('/usuarios/registro/validar').send(data).expect(201);
    const created = await http().post('/usuarios/registro').set('Authorization', 'Bearer synthetic-firebase').send(data).expect(201);
    const first = await http().post('/usuarios/login').send({ correo_usuario: data.correo_usuario, password }).expect(201);
    expect(first.body.access_token).toBeTruthy();
    await http().post('/usuarios/me/pin').set('Authorization', `Bearer ${first.body.access_token}`).send({ PIN: pin }).expect(201);
    const login = await http().post('/usuarios/login').send({ correo_usuario: data.correo_usuario, password, perfil_ID: created.body.usuario_ID, PIN: pin }).expect(201);
    expect(login.body.usuario.usuario_ID).toBe(created.body.usuario_ID);
    await http().post('/usuarios/password/firebase').set('Authorization', 'Bearer synthetic-firebase').send({ password: password + 'new' }).expect(201);
  });

  it('roles y vínculo conservan operaciones permitidas y deniegan usuario común', async () => {
    await http().get('/admin/usuarios').set('Authorization', auth(900004)).expect(200);
    await http().get('/admin/usuarios').set('Authorization', auth(900005)).expect(200);
    await http().get('/admin/usuarios').set('Authorization', auth()).expect(403);
  });

  it('perfil, contacto y AES-GCM con consentimiento sintético', async () => {
    const ficha = { tipo_sangre: 'synthetic', alergias: '', enfermedades_cronicas: '', medicamentos_actuales: '', discapacidad_presente: '', donante_organos: false };
    await http().put('/usuarios/me/perfil').set('Authorization', auth()).send({ ficha_medica: ficha, mensaje: 'Synthetic SOS' }).expect(200);
    await http().post('/usuarios/me/contactos').set('Authorization', auth()).send({ nombre_contacto: 'Synthetic', num_emergencia: '+12025550123', compartir_antecedentes: false }).expect(201);
    const own = await http().get('/usuarios/me/perfil').set('Authorization', auth()).expect(200);
    expect(JSON.stringify(own.body)).toContain('synthetic');
    const [stored] = await db.query('SELECT tipo_sangre FROM antecedente_medico WHERE usuario_id=900001');
    expect(stored.tipo_sangre).not.toBe(ficha.tipo_sangre);
  });

  it('precio servidor, reserva, captura y conciliación no dependen de PayPal real', async () => {
    await http().get('/compras/precio').expect(200);
    const order = await http().post('/compras/apadrinados/ordenes').set('Authorization', auth()).send({ cantidad: 1, tipo: 'CUPOS' }).expect(201);
    expect(order.body).toBeTruthy();
    const paid = await http().post('/compras/apadrinados/ordenes/SYNTHETICORDER1/captura').set('Authorization', auth()).expect(200);
    expect(paid.body.estado).toBe('PAGADO');
    expect(paid.body.cuposAdquiridos).toBe(1);
    const [venta] = await db.query('SELECT venta_id FROM venta WHERE usuario_id=900001');
    await http().post(`/compras/apadrinados/ventas/${venta.venta_id}/conciliar`).set('Authorization', auth()).expect(200);
    await http().post('/usuarios/me/apadrinados').set('Authorization', auth()).send({ nombre_usuario: 'Synthetic child', acceso_completo: false, PIN: pin }).expect(201);
  });

  it('reporte autorizado, mapa, indicador y health mantienen respuesta utilizable', async () => {
    await http().get('/admin/tickets/reporte').set('Authorization', auth(900004)).expect(200);
    await http().get('/maps/geocode?address=synthetic').set('Authorization', auth()).expect(200, []);
    await http().get('/indicators').set('Authorization', auth()).expect(200, []);
    const health = await http().get('/health/ready').expect(200);
    expect(health.body.database).toBe('up');
  });
});
