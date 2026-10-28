import './load-root-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { FirebaseAuthService } from '../src/integrations/firebase-auth/firebase-auth.service';

const db = process.env.DB_E2E === '1' ? describe : describe.skip;
db('HU-10 / CA-10.1: PIN del principal para acciones críticas sobre apadrinados', () => {
  jest.setTimeout(90_000);
  let app: INestApplication, source: DataSource, admin: string, token: string, otro: string;
  let id: number, hijo: number;
  const suffix = randomUUID().slice(0, 8), password = 'ClaveSegura123';
  const created: number[] = [];
  const http = () => request(app.getHttpServer());
  const auth = (t: string) => ({ Authorization: 'Bearer ' + t });
  const ruta = (sufijo = '') => `/usuarios/me/apadrinados/${hijo}${sufijo}`;
  const contador = async () =>
    (await source.query('SELECT p.intentos_fallidos, p.bloqueado_hasta FROM pin p JOIN usuario u USING (pin_id) WHERE u.usuario_id=$1', [id]))[0];

  /** Principal con PIN 1234 y sesión de acceso completo. */
  async function principal(nombre: string) {
    const correo = `${nombre}.${suffix}@emergen.test`;
    const r = await http().post('/usuarios/registro').set(auth(correo)).send({ nombre_usuario: 'Principal', correo_usuario: correo, password }).expect(201);
    created.push(r.body.usuario_ID);
    const parcial = (await http().post('/usuarios/login').send({ correo_usuario: correo, password }).expect(201)).body.access_token;
    await http().post('/usuarios/me/pin').set(auth(parcial)).send({ PIN: '1234' }).expect(201);
    return { id: r.body.usuario_ID as number, token: (await http().post('/usuarios/login')
      .send({ correo_usuario: correo, password, perfil_ID: r.body.usuario_ID, PIN: '1234' }).expect(201)).body.access_token as string };
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FirebaseAuthService).useValue({ verifyIdToken: async (value: string) => ({ uid: value, email: value, emailVerified: true }) })
      .compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init(); source = app.get(DataSource);
    admin = (await http().post('/usuarios/login').send({ correo_usuario: 'admin@emergen.test', password: 'EmergenDev123!' }).expect(201)).body.access_token;
    ({ id, token } = await principal('pin'));
    otro = (await principal('ajeno')).token;
    await http().put(`/admin/usuarios/${id}/plan`).set(auth(admin)).send({ plan_ID: 2, cupos_apadrinados_adq: 1 }).expect(200);
    const lista = await http().post('/usuarios/me/apadrinados').set(auth(token))
      .send({ nombre_usuario: 'Hijo', acceso_completo: false, PIN: '4321' }).expect(201);
    hijo = lista.body[0].usuario_ID;
  });
  afterAll(async () => {
    if (source?.isInitialized) {
      if (hijo) await source.query('DELETE FROM usuario WHERE usuario_id=$1', [hijo]);
      for (const u of created) await source.query('DELETE FROM usuario WHERE usuario_id=$1', [u]);
    }
    await app?.close();
  });

  it('sin PIN (petición HTTP directa) se rechaza en las tres acciones', async () => {
    await http().delete(ruta()).set(auth(token)).expect(400);
    await http().put(ruta('/estado')).set(auth(token)).send({ estado_ID: 1 }).expect(400);
    await http().put(ruta('/pin')).set(auth(token)).send({ PIN: '5555' }).expect(400);
    expect((await source.query('SELECT 1 FROM usuario WHERE usuario_id=$1', [hijo]))).toHaveLength(1);
  });

  it('sin permisos: sin token 401 y otro principal 404 sin gastar intentos', async () => {
    await http().delete(ruta()).send({ PIN_principal: '1234' }).expect(401);
    await http().delete(ruta()).set(auth(otro)).send({ PIN_principal: '1234' }).expect(404);
    expect((await contador()).intentos_fallidos).toBe(0);
  });

  it('el apadrinado no guarda correo ni contraseña y no inicia sesión por su cuenta', async () => {
    const [fila] = await source.query('SELECT correo_usuario, contra_usuario FROM usuario WHERE usuario_id=$1', [hijo]);
    expect(fila).toEqual({ correo_usuario: null, contra_usuario: null });
    await http().post('/usuarios/me/apadrinados').set(auth(token))
      .send({ nombre_usuario: 'Otro', correo_usuario: `x.${suffix}@emergen.test`, password, acceso_completo: false, PIN: '4321' }).expect(400);
  });

  it('E-08: el apadrinado parcial edita su nombre solo con el PIN de su principal', async () => {
    const parcial = (await http().post('/usuarios/login')
      .send({ correo_usuario: `pin.${suffix}@emergen.test`, password, perfil_ID: hijo, PIN: '4321' }).expect(201)).body.access_token;
    const editar = (body: object) => http().patch('/usuarios/me').set(auth(parcial)).send(body);
    expect((await editar({ nombre_usuario: 'Hijo Nuevo' }).expect(403)).body.message)
      .toBe('Para modificar esta cuenta se necesita el PIN de la cuenta principal');
    await editar({ nombre_usuario: 'Hijo Nuevo', PIN_principal: '12' }).expect(400);
    expect((await editar({ nombre_usuario: 'Hijo Nuevo', PIN_principal: '0000' }).expect(403)).body.message)
      .toBe('PIN incorrecto. Te quedan 2 intentos.');
    expect((await contador()).intentos_fallidos).toBe(1); // cuenta en el PIN del principal
    const r = await editar({ nombre_usuario: 'Hijo Nuevo', PIN_principal: '1234' }).expect(200);
    expect(r.body).toMatchObject({ nombre_usuario: 'Hijo Nuevo', correo_usuario: null });
    expect((await contador()).intentos_fallidos).toBe(0);
    await editar({ correo_usuario: `hijo2.${suffix}@emergen.test`, PIN_principal: '1234' }).expect(400);
    await http().patch('/usuarios/me/password').set(auth(parcial)).send({ password_actual: password, password_nueva: 'OtraClave123' }).expect(403);
    // Sigue sin poder tocar sus datos de emergencia (solo lectura) ni enviar PIN_principal al admin.
    await http().put('/usuarios/me/perfil').set(auth(parcial)).send({ mensaje: 'Hola', PIN_principal: '1234' }).expect(400);
    await http().patch(`/admin/usuarios/${hijo}`).set(auth(admin)).send({ nombre_usuario: 'X', PIN_principal: '1234' }).expect(400);
    await http().patch('/usuarios/me').set(auth(token)).send({ nombre_usuario: 'Principal' }).expect(200); // regresión: completo sin PIN
  });

  it('PIN correcto cambia el PIN del apadrinado y el acceso, y reinicia el contador', async () => {
    await http().put(ruta('/estado')).set(auth(token)).send({ estado_ID: 1, PIN_principal: '0000' }).expect(403);
    expect((await contador()).intentos_fallidos).toBe(1);
    const pin = await http().put(ruta('/pin')).set(auth(token)).send({ PIN: '5555', PIN_principal: '1234' }).expect(200);
    expect(pin.body[0].tiene_pin).toBe(true);
    expect((await contador()).intentos_fallidos).toBe(0);
    const acceso = await http().put(ruta('/estado')).set(auth(token)).send({ estado_ID: 1, PIN_principal: '1234' }).expect(200);
    expect(acceso.body[0].estado_ID).toBe(1);
  });

  it('tres fallos bloquean 5 minutos, incluso con el PIN correcto; al vencer vuelve a funcionar', async () => {
    const fallo = (n: number) => http().delete(ruta()).set(auth(token)).send({ PIN_principal: '0000' }).expect(n);
    expect((await fallo(403)).body.message).toBe('PIN incorrecto. Te quedan 2 intentos.');
    await fallo(403);
    expect((await fallo(429)).body.message).toBe('Por seguridad, se ha bloqueado el intento de acceso por 5 minutos debido a intentos fallidos reiterados');
    const { bloqueado_hasta } = await contador();
    const minutos = (new Date(bloqueado_hasta).getTime() - Date.now()) / 60_000;
    expect(minutos).toBeGreaterThan(4);
    expect(minutos).toBeLessThanOrEqual(5);
    await http().delete(ruta()).set(auth(token)).send({ PIN_principal: '1234' }).expect(429);
    expect((await source.query('SELECT 1 FROM usuario WHERE usuario_id=$1', [hijo]))).toHaveLength(1);
    // Simula que pasaron los 5 minutos.
    await source.query("UPDATE pin SET bloqueado_hasta = clock_timestamp() - interval '1 second' WHERE pin_id = (SELECT pin_id FROM usuario WHERE usuario_id=$1)", [id]);
    await http().delete(ruta()).set(auth(token)).send({ PIN_principal: '1234' }).expect(200);
    expect(await contador()).toEqual({ intentos_fallidos: 0, bloqueado_hasta: null });
  });

  it('regresión RF19: desvincular con PIN libera el cupo sin perderlo', async () => {
    expect((await source.query('SELECT 1 FROM usuario WHERE usuario_id=$1', [hijo]))).toHaveLength(0);
    hijo = 0;
    const [plan] = await source.query('SELECT cupos_apadrinados_adq FROM plan_usuario WHERE usuario_id=$1', [id]);
    expect(plan.cupos_apadrinados_adq).toBe(1);
    const lista = await http().post('/usuarios/me/apadrinados').set(auth(token))
      .send({ nombre_usuario: 'Hija', acceso_completo: false, PIN: '4321' }).expect(201);
    hijo = lista.body[0].usuario_ID;
  });
});
