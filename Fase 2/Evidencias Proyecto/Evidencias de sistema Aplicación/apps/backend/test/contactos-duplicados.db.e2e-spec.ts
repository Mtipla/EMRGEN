import './load-root-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { FirebaseAuthService } from '../src/integrations/firebase-auth/firebase-auth.service';

const db = process.env.DB_E2E === '1' ? describe : describe.skip;
db('CA-03.1: número de contacto duplicado (E.164)', () => {
  jest.setTimeout(60_000);
  let app: INestApplication, source: DataSource, token: string, otro: string, parcial: string;
  const suffix = randomUUID().slice(0, 8), password = 'ClaveSegura123';
  const created: number[] = [];
  const DUPLICADO = 'Ese número ya está en tu lista de contactos de emergencia';
  const http = () => request(app.getHttpServer());
  const auth = (t: string) => ({ Authorization: 'Bearer ' + t });
  const contacto = (t: string, num_emergencia: string, nombre_contacto = 'Contacto') =>
    http().post('/usuarios/me/contactos').set(auth(t)).send({ nombre_contacto, num_emergencia });

  async function cuenta(nombre: string, conPin = true) {
    const correo = `${nombre}.${suffix}@emergen.test`;
    const r = await http().post('/usuarios/registro').set(auth(correo)).send({ nombre_usuario: 'Contactos', correo_usuario: correo, password }).expect(201);
    created.push(r.body.usuario_ID);
    const login = () => http().post('/usuarios/login').send({ correo_usuario: correo, password }).expect(201);
    const sinPin = (await login()).body.access_token as string;
    if (!conPin) return sinPin;
    await http().post('/usuarios/me/pin').set(auth(sinPin)).send({ PIN: '1234' }).expect(201);
    return (await login()).body.access_token as string;
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FirebaseAuthService).useValue({ verifyIdToken: async (value: string) => ({ uid: value, email: value, emailVerified: true }) })
      .compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init(); source = app.get(DataSource);
    token = await cuenta('contactos');
    otro = await cuenta('otro');
    parcial = await cuenta('parcial', false);
  });
  afterAll(async () => {
    if (source?.isInitialized) for (const u of created) await source.query('DELETE FROM usuario WHERE usuario_id=$1', [u]);
    await app?.close();
  });

  it('guarda la forma canónica E.164 aunque se escriba con formato nacional', async () => {
    const r = await contacto(token, '(9) 1234-5678', 'Mamá').expect(201);
    expect(r.body.contactos.map((c: { num_emergencia: string }) => c.num_emergencia)).toEqual(['+56912345678']);
  });

  it.each(['+56912345678', '+56 9 1234 5678', '912345678', '+56-9-1234-5678'])(
    'rechaza %s porque es el mismo número (409)',
    async (numero) => {
      expect((await contacto(token, numero).expect(409)).body.message).toBe(DUPLICADO);
    },
  );

  it('al editar: no puede tomar el número de otro contacto, pero sí conservar el suyo', async () => {
    const r = await contacto(token, '+56987654321', 'Papá').expect(201);
    const papa = r.body.contactos.find((c: { nombre_contacto: string }) => c.nombre_contacto === 'Papá').contacto_emergencia_ID;
    const editar = (num_emergencia: string, nombre_contacto = 'Papá') =>
      http().put(`/usuarios/me/contactos/${papa}`).set(auth(token)).send({ nombre_contacto, num_emergencia });
    expect((await editar('+56 9 1234 5678').expect(409)).body.message).toBe(DUPLICADO);
    await editar('+56987654321', 'Papá Juan').expect(200);
  });

  it('otro usuario puede registrar el mismo número', async () => {
    await contacto(otro, '+56912345678').expect(201);
  });

  it('CA-04.1: el único contacto no se borra y responde con el texto del CA', async () => {
    const [unico] = (await http().get('/usuarios/me/perfil').set(auth(otro)).expect(200)).body.contactos;
    const r = await http().delete(`/usuarios/me/contactos/${unico.contacto_emergencia_ID}`).set(auth(otro)).expect(409);
    expect(r.body.message).toBe('Debe mantener al menos un contacto activo en su red de auxilio. Se recomienda editar el contacto activo');
  });

  it('CA-05.1: el mensaje personalizado admite 160 caracteres y rechaza 161 (API y BD)', async () => {
    const guardar = (mensaje: string) => http().put('/usuarios/me/perfil').set(auth(token)).send({ mensaje });
    expect((await guardar('a'.repeat(160)).expect(200)).body.mensaje).toHaveLength(160);
    const r = await guardar('a'.repeat(161)).expect(400);
    expect(r.body.message).toContain('El mensaje personalizado admite como máximo 160 caracteres');
    // La BD también lo rechaza aunque se salte la API.
    await expect(
      source.query('INSERT INTO usuario_mensaje_personalizado (mensaje) VALUES ($1)', ['a'.repeat(161)]),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('sin permisos: sin token 401 y acceso parcial 403', async () => {
    await http().post('/usuarios/me/contactos').send({ nombre_contacto: 'X', num_emergencia: '+56911111111' }).expect(401);
    await contacto(parcial, '+56911111111').expect(403);
    await http().put('/usuarios/me/perfil').set(auth(parcial)).send({ mensaje: 'Hola' }).expect(403);
  });

  it('regresión: formato inválido 400 y límite de 5 contactos con su mensaje', async () => {
    await contacto(token, 'abc').expect(400);
    for (const n of ['1', '2', '3']) await contacto(token, `+5698765430${n}`).expect(201);
    const sexto = await contacto(token, '+56987654309').expect(409);
    expect(sexto.body.message).toBe('Máximo 5 contactos de emergencia por perfil');
  });
});
