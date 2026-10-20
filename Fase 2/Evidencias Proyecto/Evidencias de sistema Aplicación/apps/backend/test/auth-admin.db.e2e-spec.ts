import './load-root-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { FirebaseAuthService } from './../src/integrations/firebase-auth/firebase-auth.service';

/**
 * Login (JWT + bcrypt) y panel Admin contra la PostgreSQL REAL de docker-compose.
 * Desactivadas por defecto; con la BD levantada (`docker compose up -d`), en PowerShell:
 *   $env:DB_E2E=1; npm run test:e2e --workspace=backend -- auth-admin.db
 * Crea sus propios usuarios (correo único por ejecución) y los borra al terminar.
 */
const db = process.env.DB_E2E === '1' ? describe : describe.skip;
const SIN_VERIFICAR = 'sin-verificar:';

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
  let idApadrinado: number;
  let idSoporte: number;
  let idObjetivo: number;
  let tokenAdmin: string;
  let tokenSoporte: string;
  let tokenUsuario: string;

  const login = (correo_usuario: string, clave = password) =>
    http().post('/usuarios/login').send({ correo_usuario, password: clave });
  const registro = (nombre_usuario: string, correo_usuario: string, firebaseEmail = correo_usuario) =>
    http()
      .post('/usuarios/registro')
      .set('Authorization', `Bearer ${firebaseEmail.toLowerCase()}`)
      .send({ nombre_usuario, correo_usuario, password });

  beforeAll(async () => {
    // Firebase simulado: el ID token de prueba es el propio correo (ver `registro`);
    // con el prefijo SIN_VERIFICAR es una cuenta que aún no confirma su correo.
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseAuthService)
      .useValue({
        verifyIdToken: async (token: string) => {
          const email = token.replace(SIN_VERIFICAR, '');
          return { uid: `uid-${email}`, email, emailVerified: !token.startsWith(SIN_VERIFICAR) };
        },
      })
      .compile();
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
      const ids = [idAdmin, idUsuario, idApadrinado, idSoporte, idObjetivo].filter(Boolean);
      if (ids.length) {
        await dataSource.query('DELETE FROM plan_usuario WHERE usuario_id = ANY($1)', [ids]);
        await dataSource.query('DELETE FROM contacto_emergencia WHERE usuario_id = ANY($1)', [ids]);
        await dataSource.query('DELETE FROM bitacora_sistema WHERE usuario_id = ANY($1)', [ids]);
        await dataSource.query('DELETE FROM usuario WHERE usuario_id = ANY($1)', [ids]);
      }
    }
    await app?.close();
  });

  it('registra usuarios en la BD con la contraseña hasheada con bcrypt', async () => {
    const admin = await registro('Admin E2E', correoAdmin.toUpperCase()).expect(201);
    const usuario = await registro('Usuario E2E', correoUsuario).expect(201);
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
    registro('Duplicado', correoUsuario.toUpperCase()).expect(409));

  it('exige un ID token de Firebase del mismo correo para registrarse', async () => {
    await http()
      .post('/usuarios/registro')
      .send({ nombre_usuario: 'Sin token', correo_usuario: `otro.${sufijo}@e2e.test`, password })
      .expect(401);
    await registro('Otro correo', `otro.${sufijo}@e2e.test`, correoUsuario).expect(403);
  });

  it('no guarda en la BD una cuenta que aún no confirma su correo', async () => {
    const correo = `sinverificar.${sufijo}@e2e.test`;
    await registro('Sin verificar', correo, `${SIN_VERIFICAR}${correo}`).expect(403);
    const filas = await dataSource.query('SELECT 1 FROM usuario WHERE correo_usuario = $1', [correo]);
    expect(filas).toHaveLength(0);
  });

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

  it('el administrador no puede cambiar el estado de su propia cuenta', () =>
    http()
      .put(`/admin/usuarios/${idAdmin}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado_ID: 3 })
      .expect(400));

  describe('apadrinado con registros asociados', () => {
    const idContacto = 900_000_000 + Math.floor(Math.random() * 99_999_999);
    const accionesEliminacion = () =>
      dataSource.query(
        `SELECT accion_realizada, resultado FROM bitacora_sistema
         WHERE usuario_id = $1 AND usuario_afectado_id = $2 ORDER BY bitacora_sistema_id`,
        [idAdmin, idApadrinado],
      );
    const intentoFallido = () => ({
      accion_realizada: `Eliminación de usuario apadrinado ${idApadrinado}: El usuario apadrinado tiene registros asociados; bloquéalo en vez de eliminarlo`,
      resultado: 'FALLIDA',
    });

    beforeAll(async () => {
      [{ usuario_id: idApadrinado }] = await dataSource.query(
        `INSERT INTO usuario (nombre_usuario, correo_usuario, contra_usuario, rol_id, estado_id, usuario_principal_id)
         VALUES ('Apadrinado E2E', $1, 'sin-login', 3, 1, $2) RETURNING usuario_id`,
        [correoUsuario, idUsuario],
      );
      await dataSource.query(
        'INSERT INTO contacto_emergencia (contacto_emergencia_id, usuario_id, num_emergencia) VALUES ($1, $2, $3)',
        [idContacto, idApadrinado, '912345678'],
      );
    });

    it('responde 409 (no 500), revierte el borrado y registra el intento como FALLIDA', async () => {
      await http()
        .delete(`/admin/usuarios/apadrinado/${idApadrinado}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(409);

      const [fila] = await dataSource.query(
        'SELECT usuario_id FROM usuario WHERE usuario_id = $1',
        [idApadrinado],
      );
      expect(fila).toBeDefined();
      expect(await accionesEliminacion()).toEqual([intentoFallido()]);
    });

    it('sin registros asociados, elimina y registra la acción en la bitácora', async () => {
      await dataSource.query('DELETE FROM contacto_emergencia WHERE contacto_emergencia_id = $1', [
        idContacto,
      ]);
      await http()
        .delete(`/admin/usuarios/apadrinado/${idApadrinado}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      // El registro sobrevive al usuario eliminado (usuario_afectado_id no es llave foránea).
      expect(await accionesEliminacion()).toEqual([
        intentoFallido(),
        {
          accion_realizada: `Eliminación de usuario apadrinado ${idApadrinado}`,
          resultado: 'EXITOSA',
        },
      ]);
    });
  });

  describe('auditoría (/admin/auditoria)', () => {
    const auditoria = (ruta = '') =>
      http().get(`/admin/auditoria${ruta}`).set('Authorization', `Bearer ${tokenAdmin}`);

    it('exige sesión de administrador', () => http().get('/admin/auditoria').expect(401));

    it('lista la bitácora con actor, rol, usuario afectado, cambios y la hora en UTC', async () => {
      const { body } = await auditoria(`?usuario_ID=${idAdmin}`).expect(200);

      expect(body.length).toBeGreaterThanOrEqual(2);
      expect(body[0]).toEqual({
        bitacora_sistema_ID: expect.any(Number),
        fecha_accion: expect.stringMatching(/Z$/),
        accion_realizada: `Eliminación de usuario apadrinado ${idApadrinado}`,
        tipo_accion: 'ELIMINACION',
        entidad_afectada: 'USUARIO',
        resultado: 'EXITOSA',
        cambios: {
          nombre_usuario: { antes: 'Apadrinado E2E', despues: null },
          usuario_principal_ID: { antes: idUsuario, despues: null },
        },
        usuario_ID: idAdmin,
        nombre_usuario: 'Admin Renombrado',
        rol_actor_ID: 1,
        usuario_afectado_ID: idApadrinado,
        // El apadrinado ya no existe: queda su ID, no su nombre.
        nombre_usuario_afectado: null,
        aplicacion_ID: 3,
        origen_aplicacion: 'ESCRITORIO',
      });
      // Misma hora sin importar si el backend corre en Docker (UTC) o en Windows (Chile).
      expect(Math.abs(Date.parse(body[0].fecha_accion) - Date.now())).toBeLessThan(5 * 60_000);
    });

    it('filtra por fecha (hasta es inclusivo) y valida los filtros', async () => {
      const hoy = new Date().toISOString().slice(0, 10);
      const { body: deHoy } = await auditoria(`?usuario_ID=${idAdmin}&desde=${hoy}&hasta=${hoy}`).expect(200);
      expect(deHoy.length).toBeGreaterThanOrEqual(2);

      const { body: antiguos } = await auditoria(`?usuario_ID=${idAdmin}&hasta=2000-01-01`).expect(200);
      expect(antiguos).toEqual([]);

      await auditoria('?desde=30-09-2026').expect(400);
      await auditoria('?limite=0').expect(400);
      await auditoria('?admin=1').expect(400);
    });

    // jsReport es opcional en desarrollo: con el servidor levantado se valida el PDF;
    // sin él, el backend responde 502 con un mensaje claro y sigue funcionando.
    it('genera el PDF con jsReport o informa que jsReport no está disponible', async () => {
      const respuesta = await auditoria(`/reporte?usuario_ID=${idAdmin}`)
        .buffer(true)
        .parse((res, callback) => {
          const partes: Buffer[] = [];
          res.on('data', (parte: Buffer) => partes.push(parte));
          res.on('end', () => callback(null, Buffer.concat(partes)));
        });

      if (respuesta.status === 200) {
        expect(respuesta.headers['content-type']).toContain('application/pdf');
        expect((respuesta.body as Buffer).subarray(0, 4).toString()).toBe('%PDF');
      } else {
        expect(respuesta.status).toBe(502);
        const { message } = JSON.parse((respuesta.body as Buffer).toString()) as {
          message: string;
        };
        expect(message).toContain('jsReport');
        expect(message).toContain('GET /admin/auditoria');
      }

      // El backend sigue respondiendo después del fallo (o éxito) de jsReport.
      const { body } = await auditoria('?limite=1').expect(200);
      if (respuesta.status === 200) {
        expect(body[0].accion_realizada).toBe('Exportación de la bitácora a PDF');
      }
    });

    it('la bitácora es de solo lectura: no acepta notas manuales ni flujos de solicitud', async () => {
      await http()
        .post('/admin/auditoria')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ accion: 'Nota escrita a mano' })
        .expect(404);
      await http()
        .get('/admin/solicitudes-permiso')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(404);
    });
  });

  describe('cuentas de SOPORTE (/admin/usuarios/soporte)', () => {
    const correoSoporte = `soporte.${sufijo}@e2e.test`;
    const crear = (cuerpo: object) =>
      http().post('/admin/usuarios/soporte').set('Authorization', `Bearer ${tokenAdmin}`).send(cuerpo);

    it('crea la cuenta con rol SOPORTE, sin devolver el hash, y la registra en la bitácora', async () => {
      const { body } = await crear({
        nombre_usuario: 'Soporte E2E',
        correo_usuario: correoSoporte.toUpperCase(),
        password,
      }).expect(201);
      idSoporte = body.usuario_ID;

      expect(body).toEqual({
        usuario_ID: expect.any(Number),
        nombre_usuario: 'Soporte E2E',
        correo_usuario: correoSoporte,
        rol_ID: 2,
        estado_ID: 1,
      });
      const [fila] = await dataSource.query(
        'SELECT contra_usuario, rol_id, usuario_principal_id FROM usuario WHERE usuario_id = $1',
        [idSoporte],
      );
      expect(fila.contra_usuario).toMatch(/^\$2b\$12\$.{53}$/);
      expect(fila).toMatchObject({ rol_id: 2, usuario_principal_id: null });

      const [ultima] = await dataSource.query(
        'SELECT accion_realizada FROM bitacora_sistema WHERE usuario_id = $1 ORDER BY bitacora_sistema_id DESC LIMIT 1',
        [idAdmin],
      );
      expect(ultima.accion_realizada).toBe(`Registro de nueva cuenta de SOPORTE: ${correoSoporte}`);
    });

    it('la cuenta de SOPORTE inicia sesión pero no entra al panel de administrador', async () => {
      tokenSoporte = (await login(correoSoporte).expect(201)).body.access_token;
      await http().get('/admin/usuarios').set('Authorization', `Bearer ${tokenSoporte}`).expect(403);
      await http()
        .post('/admin/usuarios/soporte')
        .set('Authorization', `Bearer ${tokenSoporte}`)
        .send({ nombre_usuario: 'Otro', correo_usuario: `otro.${sufijo}@e2e.test`, password })
        .expect(403);
    });

    it('rechaza un correo repetido (409) y un body que intenta elegir el rol (400)', async () => {
      await crear({ nombre_usuario: 'Repetido', correo_usuario: correoSoporte, password }).expect(409);
      await crear({
        nombre_usuario: 'Escalada',
        correo_usuario: `escalada.${sufijo}@e2e.test`,
        password,
        rol_ID: 1,
      }).expect(400);
    });
  });

  describe('gestión completa del usuario por el administrador', () => {
    const correoObjetivo = `objetivo.${sufijo}@e2e.test`;
    const correoNuevo = `objetivo.editado.${sufijo}@e2e.test`;

    const comoAdmin = (peticion: request.Test) =>
      peticion.set('Authorization', `Bearer ${tokenAdmin}`);
    const bitacoraDelObjetivo = () =>
      dataSource.query(
        `SELECT usuario_id, rol_actor_id, tipo_accion, entidad_afectada, resultado, accion_realizada, cambios
         FROM bitacora_sistema WHERE usuario_afectado_id = $1 ORDER BY bitacora_sistema_id`,
        [idObjetivo],
      );
    const ultimaDelObjetivo = async () => (await bitacoraDelObjetivo()).at(-1);

    beforeAll(async () => {
      const { body } = await http()
        .post('/usuarios/registro')
        .send({ nombre_usuario: 'Objetivo E2E', correo_usuario: correoObjetivo, password })
        .expect(201);
      idObjetivo = body.usuario_ID;
      // Bloqueado a propósito: ESTADO_USUARIO no decide si el administrador puede gestionarlo.
      await dataSource.query('UPDATE usuario SET estado_id = 3 WHERE usuario_id = $1', [idObjetivo]);
    });

    it('exige rol administrador: 401 sin sesión y 403 para SOPORTE', async () => {
      await http().get(`/admin/usuarios/${idObjetivo}`).expect(401);
      const comoSoporte = (peticion: request.Test) =>
        peticion.set('Authorization', `Bearer ${tokenSoporte}`);
      await comoSoporte(http().get(`/admin/usuarios/${idObjetivo}`)).expect(403);
      await comoSoporte(http().patch(`/admin/usuarios/${idObjetivo}`))
        .send({ nombre_usuario: 'Intruso' })
        .expect(403);
      await comoSoporte(http().put(`/admin/usuarios/${idObjetivo}/plan`))
        .send({ tiene_acceso_completo: true, cupos_apadrinados_adq: 1 })
        .expect(403);
      expect(await bitacoraDelObjetivo()).toEqual([]);
    });

    it('consulta el expediente sin exponer el hash y registra la consulta', async () => {
      const { body } = await comoAdmin(http().get(`/admin/usuarios/${idObjetivo}`)).expect(200);

      expect(body).toMatchObject({
        usuario: {
          usuario_ID: idObjetivo,
          nombre_usuario: 'Objetivo E2E',
          correo_usuario: correoObjetivo,
          rol_ID: 3,
          estado_ID: 3,
        },
        plan: null,
        apadrinados: [],
      });
      expect(JSON.stringify(body)).not.toContain('contra_usuario');
      expect(await ultimaDelObjetivo()).toEqual({
        usuario_id: idAdmin,
        rol_actor_id: 1,
        tipo_accion: 'CONSULTA',
        entidad_afectada: 'USUARIO',
        resultado: 'EXITOSA',
        accion_realizada: `Consulta del expediente del usuario ${idObjetivo}`,
        cambios: null,
      });
    });

    it('modifica nombre y correo de un usuario bloqueado y registra antes y después', async () => {
      const { body } = await comoAdmin(http().patch(`/admin/usuarios/${idObjetivo}`))
        .send({ nombre_usuario: ' Objetivo Editado ', correo_usuario: correoNuevo.toUpperCase() })
        .expect(200);

      expect(body).toEqual({
        usuario_ID: idObjetivo,
        nombre_usuario: 'Objetivo Editado',
        correo_usuario: correoNuevo,
        rol_ID: 3,
        estado_ID: 3,
      });
      const [fila] = await dataSource.query(
        'SELECT nombre_usuario, correo_usuario, estado_id FROM usuario WHERE usuario_id = $1',
        [idObjetivo],
      );
      expect(fila).toEqual({
        nombre_usuario: 'Objetivo Editado',
        correo_usuario: correoNuevo,
        estado_id: 3,
      });
      expect(await ultimaDelObjetivo()).toEqual({
        usuario_id: idAdmin,
        rol_actor_id: 1,
        tipo_accion: 'MODIFICACION',
        entidad_afectada: 'USUARIO',
        resultado: 'EXITOSA',
        accion_realizada: `Modificación de los datos del usuario ${idObjetivo}`,
        cambios: {
          nombre_usuario: { antes: 'Objetivo E2E', despues: 'Objetivo Editado' },
          correo_usuario: { antes: correoObjetivo, despues: correoNuevo },
        },
      });
    });

    it('conserva las validaciones: correo duplicado 409 (registrado como FALLIDA) y campos ajenos 400', async () => {
      await comoAdmin(http().patch(`/admin/usuarios/${idObjetivo}`))
        .send({ correo_usuario: correoAdmin })
        .expect(409);
      expect(await ultimaDelObjetivo()).toMatchObject({
        tipo_accion: 'MODIFICACION',
        resultado: 'FALLIDA',
        accion_realizada: `Modificación de los datos del usuario ${idObjetivo}: Ya existe una cuenta con ese correo`,
        cambios: null,
      });

      // El DTO no admite rol, estado ni contraseña: la petición no llega al servicio.
      const antes = (await bitacoraDelObjetivo()).length;
      await comoAdmin(http().patch(`/admin/usuarios/${idObjetivo}`))
        .send({ nombre_usuario: 'Escalada', rol_ID: 1 })
        .expect(400);
      await comoAdmin(http().patch(`/admin/usuarios/${idObjetivo}`))
        .send({ password: 'OtraClave12345' })
        .expect(400);
      expect(await bitacoraDelObjetivo()).toHaveLength(antes);
    });

    it('asigna el plan y los cupos, y lo registra como creación de PLAN_USUARIO', async () => {
      const { body } = await comoAdmin(http().put(`/admin/usuarios/${idObjetivo}/plan`))
        .send({ tiene_acceso_completo: true, cupos_apadrinados_adq: 2 })
        .expect(200);

      expect(body).toEqual({
        plan_usuario_ID: expect.any(Number),
        usuario_ID: idObjetivo,
        tiene_acceso_completo: true,
        cupos_apadrinados_adq: 2,
        cupos_apadrinados_utili: 0,
      });
      const filas = await dataSource.query(
        'SELECT tiene_acceso_completo, cupos_apadrinados_adq, cupos_apadrinados_utili FROM plan_usuario WHERE usuario_id = $1',
        [idObjetivo],
      );
      expect(filas).toEqual([
        { tiene_acceso_completo: true, cupos_apadrinados_adq: 2, cupos_apadrinados_utili: 0 },
      ]);
      expect(await ultimaDelObjetivo()).toMatchObject({
        usuario_id: idAdmin,
        tipo_accion: 'CREACION',
        entidad_afectada: 'PLAN_USUARIO',
        resultado: 'EXITOSA',
        accion_realizada: `Asignación de plan y cupos al usuario ${idObjetivo}`,
        cambios: {
          tiene_acceso_completo: { antes: null, despues: true },
          cupos_apadrinados_adq: { antes: null, despues: 2 },
          cupos_apadrinados_utili: { antes: null, despues: 0 },
        },
      });
    });

    it('modifica los cupos del plan existente sin duplicarlo y registra solo lo que cambió', async () => {
      await comoAdmin(http().put(`/admin/usuarios/${idObjetivo}/plan`))
        .send({ tiene_acceso_completo: true, cupos_apadrinados_adq: 5 })
        .expect(200);

      const filas = await dataSource.query(
        'SELECT cupos_apadrinados_adq FROM plan_usuario WHERE usuario_id = $1',
        [idObjetivo],
      );
      expect(filas).toEqual([{ cupos_apadrinados_adq: 5 }]);
      expect(await ultimaDelObjetivo()).toMatchObject({
        tipo_accion: 'MODIFICACION',
        entidad_afectada: 'PLAN_USUARIO',
        accion_realizada: `Modificación del plan y cupos del usuario ${idObjetivo}`,
        cambios: { cupos_apadrinados_adq: { antes: 2, despues: 5 } },
      });

      const { body } = await comoAdmin(http().get(`/admin/usuarios/${idObjetivo}`)).expect(200);
      expect(body.plan).toMatchObject({ tiene_acceso_completo: true, cupos_apadrinados_adq: 5 });
    });

    it('no deja menos cupos que apadrinados existentes ni supera el máximo', async () => {
      const [{ usuario_id: idHijo }] = await dataSource.query(
        `INSERT INTO usuario (nombre_usuario, correo_usuario, contra_usuario, rol_id, estado_id, usuario_principal_id)
         VALUES ('Hijo del objetivo', $1, 'sin-login', 3, 1, $2) RETURNING usuario_id`,
        [correoNuevo, idObjetivo],
      );
      const guardar = (cupos: number) =>
        comoAdmin(http().put(`/admin/usuarios/${idObjetivo}/plan`)).send({
          tiene_acceso_completo: false,
          cupos_apadrinados_adq: cupos,
        });

      await guardar(6).expect(400);
      await guardar(0).expect(400);
      expect(await ultimaDelObjetivo()).toMatchObject({
        resultado: 'FALLIDA',
        entidad_afectada: 'PLAN_USUARIO',
      });
      const { body } = await guardar(1).expect(200);
      expect(body).toMatchObject({ cupos_apadrinados_adq: 1, cupos_apadrinados_utili: 1 });

      // Los planes pertenecen a la cuenta principal, no al apadrinado.
      await comoAdmin(http().put(`/admin/usuarios/${idHijo}/plan`))
        .send({ tiene_acceso_completo: false, cupos_apadrinados_adq: 0 })
        .expect(400);

      // El apadrinado se elimina por la ruta auditada; quitar los cupos ya es posible.
      await comoAdmin(http().delete(`/admin/usuarios/apadrinado/${idHijo}`)).expect(200);
      await guardar(0).expect(200);
    });

    it('filtra la bitácora por usuario afectado, con el nombre del actor y del afectado', async () => {
      const { body } = await comoAdmin(
        http().get(`/admin/auditoria?usuario_afectado_ID=${idObjetivo}`),
      ).expect(200);

      const filas = await bitacoraDelObjetivo();
      expect(body).toHaveLength(filas.length);
      expect(body.length).toBeGreaterThanOrEqual(6);
      for (const entrada of body) {
        expect(entrada).toMatchObject({
          usuario_ID: idAdmin,
          nombre_usuario: 'Admin Renombrado',
          rol_actor_ID: 1,
          usuario_afectado_ID: idObjetivo,
          nombre_usuario_afectado: 'Objetivo Editado',
        });
      }
      // Nada sensible llega a la bitácora.
      expect(JSON.stringify(filas)).not.toMatch(/\$2b\$|ClaveSegura|contra_usuario/);
    });

    it('audita también DELETE /usuarios/:id y el registro sobrevive al usuario eliminado', async () => {
      const { body: desechable } = await http()
        .post('/usuarios/registro')
        .send({ nombre_usuario: 'Desechable E2E', correo_usuario: `desechable.${sufijo}@e2e.test`, password })
        .expect(201);

      await comoAdmin(http().delete(`/usuarios/${desechable.usuario_ID}`)).expect(200);

      const filas = await dataSource.query(
        `SELECT usuario_id, rol_actor_id, aplicacion_id, tipo_accion, resultado, cambios
         FROM bitacora_sistema WHERE usuario_afectado_id = $1`,
        [desechable.usuario_ID],
      );
      expect(filas).toEqual([
        {
          usuario_id: idAdmin,
          rol_actor_id: 1,
          aplicacion_id: 1,
          tipo_accion: 'ELIMINACION',
          resultado: 'EXITOSA',
          cambios: {
            nombre_usuario: { antes: 'Desechable E2E', despues: null },
            correo_usuario: { antes: `desechable.${sufijo}@e2e.test`, despues: null },
            rol_ID: { antes: 3, despues: null },
          },
        },
      ]);
    });
  });
});
