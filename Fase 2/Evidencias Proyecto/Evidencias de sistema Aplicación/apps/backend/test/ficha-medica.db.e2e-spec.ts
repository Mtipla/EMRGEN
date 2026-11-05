import './load-root-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { FirebaseAuthService } from '../src/integrations/firebase-auth/firebase-auth.service';

const db = process.env.DB_E2E === '1' ? describe : describe.skip;
db('CA-11.1: ficha médica cifrada en reposo (AES-256-GCM)', () => {
  jest.setTimeout(60_000);
  let app: INestApplication, source: DataSource, token: string, parcial: string, id: number;
  const suffix = randomUUID().slice(0, 8), password = 'ClaveSegura123';
  const created: number[] = [];
  const http = () => request(app.getHttpServer());
  const auth = (t: string) => ({ Authorization: 'Bearer ' + t });
  const ficha = { tipo_sangre: 'AB-', alergias: 'Penicilina '+suffix, enfermedades_cronicas: 'Asma',
    medicamentos_actuales: 'Salbutamol', discapacidad_presente: '', donante_organos: true };
  const fila = async () => (await source.query('SELECT * FROM antecedente_medico WHERE usuario_id=$1', [id]))[0];
  const registrar = async (correo: string) => {
    const r = await http().post('/usuarios/registro').set(auth(correo)).send({ nombre_usuario: 'Ficha', correo_usuario: correo, password }).expect(201);
    created.push(r.body.usuario_ID);
    return { id: r.body.usuario_ID as number, token: (await http().post('/usuarios/login').send({ correo_usuario: correo, password }).expect(201)).body.access_token as string };
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FirebaseAuthService).useValue({ verifyIdToken: async (value: string) => ({ uid: value, email: value, emailVerified: true }) })
      .compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init(); source = app.get(DataSource);
    const completo = await registrar('ficha.' + suffix + '@emergen.test');
    id = completo.id;
    await http().post('/usuarios/me/pin').set(auth(completo.token)).send({ PIN: '1234' }).expect(201);
    token = (await http().post('/usuarios/login').send({ correo_usuario: 'ficha.' + suffix + '@emergen.test', password }).expect(201)).body.access_token;
    parcial = (await registrar('ficha.parcial.' + suffix + '@emergen.test')).token;
  });
  afterAll(async () => {
    if (source?.isInitialized) for (const u of created) await source.query('DELETE FROM usuario WHERE usuario_id=$1', [u]);
    await app?.close();
  });

  it('guarda cifrado y devuelve la ficha en claro solo por la API', async () => {
    const r = await http().put('/usuarios/me/perfil').set(auth(token)).send({ ficha_medica: ficha }).expect(200);
    expect(r.body.ficha_medica).toEqual(ficha);
    const guardada = await fila();
    for (const c of Object.keys(ficha)) expect(guardada[c]).toMatch(/^[a-z0-9]+:[^:]+:[^:]+:[^:]*$/i);
    expect(JSON.stringify(guardada)).not.toMatch(new RegExp('Penicilina|Asma|Salbutamol|AB-|true'));
    expect((await http().get('/usuarios/me/perfil').set(auth(token)).expect(200)).body.ficha_medica).toEqual(ficha);
  });

  it('sin clave el guardado se aborta (503) y la fila no cambia', async () => {
    const antes = await fila(), clave = process.env.MEDICAL_DATA_KEYS;
    delete process.env.MEDICAL_DATA_KEYS;
    try {
      await http().put('/usuarios/me/perfil').set(auth(token)).send({ ficha_medica: { ...ficha, alergias: 'Otra' } }).expect(503);
    } finally { process.env.MEDICAL_DATA_KEYS = clave; }
    expect(await fila()).toEqual(antes);
  });

  it('sin permisos: sin token 401 y acceso parcial 403', async () => {
    await http().put('/usuarios/me/perfil').send({ ficha_medica: ficha }).expect(401);
    await http().put('/usuarios/me/perfil').set(auth(parcial)).send({ ficha_medica: ficha }).expect(403);
  });

  it('regresión: contactos y mensaje siguen funcionando y null borra la ficha', async () => {
    const c = await http().post('/usuarios/me/contactos').set(auth(token)).send({ nombre_contacto: 'Mamá', num_emergencia: '+56912345678' }).expect(201);
    expect(c.body.contactos).toHaveLength(1);
    expect(c.body.ficha_medica).toEqual(ficha);
    await http().put('/usuarios/me/perfil').set(auth(token)).send({ mensaje: 'Ayuda' }).expect(200);
    const r = await http().put('/usuarios/me/perfil').set(auth(token)).send({ ficha_medica: null }).expect(200);
    expect(r.body.ficha_medica).toBeNull();
    expect(await fila()).toBeUndefined();
  });
});
