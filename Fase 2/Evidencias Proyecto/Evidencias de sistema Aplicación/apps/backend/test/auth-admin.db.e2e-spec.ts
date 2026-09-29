import './load-root-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';

/**
 * Login (JWT + bcrypt) y panel Admin contra la PostgreSQL REAL de docker-compose.
 * Desactivadas por defecto; con la BD levantada (`docker compose up -d`), en PowerShell:
 *   $env:DB_E2E=1; npm run test:e2e --workspace=backend -- auth-admin.db
 * Crea sus propios usuarios (correo único por ejecución) y los borra al terminar.
 */
const db = process.env.DB_E2E === '1' ? describe : describe.skip;

db('Login + Admin contra PostgreSQL (Docker)', () => {
  jest.setTimeout(60_000);

  const sufijo = randomUUID().slice(0, 8);
  const password = 'ClaveSegura123';
  const correoAdmin = `admin.${sufijo}@e2e.test`;
  const correoUsuario = `usuario.${sufijo}@e2e.test`;
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let http: () => ReturnType<typeof request>;
  let idAdmin: number;
  let idUsuario: number;
  let tokenAdmin: string;
  let tokenUsuario: string;

  const login = (correo_usuario: string, clave = password) =>
    http().post('/usuarios/login').send({ correo_usuario, password: clave });

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication({ logger: false });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    dataSource = app.get(DataSource);
    http = () => request(app.getHttpServer());
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      const ids = [idAdmin, idUsuario].filter(Boolean);
      if (ids.length) {
        await dataSource.query('DELETE FROM bitacora_sistema WHERE usuario_id = ANY($1)', [ids]);
        await dataSource.query('DELETE FROM usuario WHERE usuario_id = ANY($1)', [ids]);
      }
    }
    await app?.close();
  });

  it('registra usuarios en la BD con la contraseña hasheada con bcrypt', async () => {
    const admin = await http()
      .post('/usuarios/registro')
      .send({ nombre_usuario: 'Admin E2E', correo_usuario: correoAdmin.toUpperCase(), password })
      .expect(201);
    const usuario = await http()
      .post('/usuarios/registro')
      .send({ nombre_usuario: 'Usuario E2E', correo_usuario: correoUsuario, password })
      .expect(201);
    idAdmin = admin.body.usuario_ID;
    idUsuario = usuario.body.usuario_ID;

    expect(admin.body).toEqual({
      usuario_ID: expect.any(Number),
      nombre_usuario: 'Admin E2E',
      correo_usuario: correoAdmin,
    });
    const [fila] = await dataSource.query(
      'SELECT contra_usuario, rol_id, estado_id, usuario_principal_id FROM usuario WHERE usuario_id = $1',
      [idUsuario],
    );
    expect(fila.contra_usuario).toMatch(/^\$2b\$12\$.{53}$/);
    expect(fila).toMatchObject({ rol_id: 3, estado_id: 1, usuario_principal_id: null });
  });

  it('rechaza con 409 un correo ya registrado (sin distinguir mayúsculas)', () =>
    http()
      .post('/usuarios/registro')
      .send({ nombre_usuario: 'Duplicado', correo_usuario: correoUsuario.toUpperCase(), password })
      .expect(409));

  it('rechaza con 401 una contraseña incorrecta o un correo inexistente', async () => {
    await login(correoUsuario, 'OtraClave999').expect(401);
    await login(`nadie.${sufijo}@e2e.test`).expect(401);
  });

  it('inicia sesión y entrega un JWT', async () => {
    await dataSource.query('UPDATE usuario SET rol_id = 1 WHERE usuario_id = $1', [idAdmin]);
    tokenAdmin = (await login(correoAdmin).expect(201)).body.access_token;
    tokenUsuario = (await login(correoUsuario).expect(201)).body.access_token;
    expect(tokenAdmin.split('.')).toHaveLength(3);
  });

  it('protege /admin/usuarios: 401 sin token, 403 sin rol administrador', async () => {
    await http().get('/admin/usuarios').expect(401);
    await http().get('/admin/usuarios').set('Authorization', 'Bearer token-falso').expect(401);
    await http()
      .get('/admin/usuarios')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .expect(403);
    await http().get('/usuarios').set('Authorization', `Bearer ${tokenUsuario}`).expect(403);
  });

  it('el administrador lista usuarios sin exponer hashes', async () => {
    const { body } = await http()
      .get('/admin/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(body).toEqual(
      expect.arrayContaining([expect.objectContaining({ usuario_ID: idUsuario })]),
    );
    expect(JSON.stringify(body)).not.toContain('contra_usuario');
  });

  it('ignora el admin_ID del body: la petición se rechaza con 400', () =>
    http()
      .put(`/admin/usuarios/${idUsuario}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado_ID: 2, admin_ID: idUsuario })
      .expect(400));

  it('bloquea a un usuario y registra la acción en la bitácora con el ID del token', async () => {
    const { body } = await http()
      .put(`/admin/usuarios/${idUsuario}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado_ID: 3 })
      .expect(200);
    expect(body).toMatchObject({ usuario_ID: idUsuario, estado_ID: 3 });
    expect(body).not.toHaveProperty('contra_usuario');

    const bitacora = await dataSource.query(
      'SELECT bitacora_sistema_id, usuario_id, aplicacion_id, accion_realizada FROM bitacora_sistema WHERE usuario_id = $1',
      [idAdmin],
    );
    expect(bitacora).toEqual([
      {
        bitacora_sistema_id: expect.any(Number),
        usuario_id: idAdmin,
        aplicacion_id: 3,
        accion_realizada: `Cambio de estado del usuario ${idUsuario} a 3`,
      },
    ]);
  });

  it('un usuario bloqueado pierde la sesión y no puede volver a entrar', async () => {
    await http()
      .patch('/usuarios/me')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ nombre_usuario: 'No debería' })
      .expect(401);
    await login(correoUsuario).expect(403);
  });

  it('rechaza estados que no existen en ESTADO_USUARIO', () =>
    http()
      .put(`/admin/usuarios/${idUsuario}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado_ID: 99 })
      .expect(400));

  it('responde 404 (no 500) al eliminar un apadrinado inexistente', () =>
    http()
      .delete('/admin/usuarios/apadrinado/999999999')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(404));

  it('el administrador no puede eliminar su propia cuenta', () =>
    http()
      .delete(`/usuarios/${idAdmin}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(400));

  it('actualiza el perfil propio en la BD', async () => {
    const { body } = await http()
      .patch('/usuarios/me')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre_usuario: 'Admin Renombrado' })
      .expect(200);
    expect(body).toEqual({
      usuario_ID: idAdmin,
      nombre_usuario: 'Admin Renombrado',
      correo_usuario: correoAdmin,
    });
  });
});
