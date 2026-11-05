import './load-root-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

const db = process.env.DB_E2E === '1' ? describe : describe.skip;

db('Monitor administrativo de alertas (PostgreSQL)', () => {
  jest.setTimeout(60_000);
  let app: INestApplication;
  let source: DataSource;
  let usuarioId: number;
  let activaId: number;
  let finalizadaId: number;
  const detalles: number[] = [];
  const alertas: number[] = [];
  const tokens: Record<string, string> = {};
  const http = () => request(app.getHttpServer());
  const consultar = () =>
    http().get('/admin/alertas').auth(tokens.admin, { type: 'bearer' });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    source = app.get(DataSource);
    for (const nombre of ['admin', 'soporte', 'principal']) {
      const sesion = await http()
        .post('/usuarios/login')
        .send({
          correo_usuario: `${nombre}@emergen.test`,
          password: 'EmergenDev123!',
        })
        .expect(201);
      tokens[nombre] = sesion.body.access_token;
    }
    await source.transaction(async (manager) => {
      const [usuario] = await manager.query(
        `INSERT INTO usuario(nombre_usuario, correo_usuario, contra_usuario, estado_id)
        VALUES ('Prueba monitor SOS', $1, 'sin-login-de-prueba', 2) RETURNING usuario_id`,
        [`monitor.${randomUUID()}@emergen.test`],
      );
      usuarioId = usuario.usuario_id;
      await manager.query(
        'INSERT INTO plan_usuario(usuario_id, plan_id, cupos_apadrinados_adq) VALUES ($1, 2, 0)',
        [usuarioId],
      );
      await manager.query(
        `INSERT INTO contacto_emergencia(usuario_id, num_emergencia, nombre_contacto)
        VALUES ($1, '+56900000001', 'Ficticio monitor')`,
        [usuarioId],
      );
      for (let i = 0; i < 2; i++) {
        const [detalle] =
          await manager.query(`INSERT INTO detalle_alerta(texto_mensaje)
          VALUES ('Mensaje de prueba del monitor') RETURNING detalle_alerta_id`);
        detalles.push(detalle.detalle_alerta_id);
        const [alerta] = await manager.query(
          `INSERT INTO alerta(usuario_id, detalle_alerta_id, prioridad_id, clave_idempotencia, huella_solicitud)
          VALUES ($1, $2, 3, $3, repeat('a', 64)) RETURNING alerta_id`,
          [usuarioId, detalle.detalle_alerta_id, randomUUID()],
        );
        alertas.push(alerta.alerta_id);
        if (i === 0) {
          finalizadaId = alerta.alerta_id;
          await manager.query(
            `UPDATE alerta SET estado_alerta = 'FINALIZADA', fecha_cierre = clock_timestamp() WHERE alerta_id = $1`,
            [finalizadaId],
          );
        } else activaId = alerta.alerta_id;
      }
    });
  });

  afterAll(async () => {
    if (source?.isInitialized && usuarioId) {
      await source.transaction(async (manager) => {
        await manager.query(
          'DELETE FROM alerta WHERE alerta_id = ANY($1::int[])',
          [alertas],
        );
        await manager.query(
          'DELETE FROM detalle_alerta WHERE detalle_alerta_id = ANY($1::int[])',
          [detalles],
        );
        await manager.query('DELETE FROM usuario WHERE usuario_id = $1', [
          usuarioId,
        ]);
      });
    }
    await app?.close();
  });

  it('exige sesión y administrador con acceso completo', async () => {
    await http().get('/admin/alertas').expect(401);
    for (const nombre of ['soporte', 'principal']) {
      await http()
        .get('/admin/alertas')
        .auth(tokens[nombre], { type: 'bearer' })
        .expect(403);
    }
  });

  it('muestra usuario, mensaje, tipo y fechas sin exponer credenciales', async () => {
    const { body, headers } = await consultar()
      .query({ usuario_id: usuarioId })
      .expect(200);
    expect(headers['cache-control']).toBe('no-store');
    expect(body.total).toBe(2);
    expect(body.activas).toBeGreaterThanOrEqual(1);
    expect(body.alertas.map((a: { alerta_id: number }) => a.alerta_id)).toEqual(
      [activaId, finalizadaId],
    );
    expect(body.alertas[0]).toMatchObject({
      usuario_id: usuarioId,
      nombre_usuario: 'Prueba monitor SOS',
      prioridad: 'EMERGENCIA',
      mensaje: 'Mensaje de prueba del monitor',
      estado_alerta: 'ACTIVA',
      ubicacion: null,
      fecha_cierre: null,
    });
    expect(new Date(body.alertas[0].fecha_creacion).getTime()).not.toBeNaN();
    expect(JSON.stringify(body)).not.toMatch(
      /contra_usuario|pin_hash|huella_solicitud/,
    );
  });

  it('filtra y pagina con total correcto incluso en una página vacía', async () => {
    const filtrada = await consultar()
      .query({ usuario_id: usuarioId, estado: 'FINALIZADA' })
      .expect(200);
    expect(filtrada.body.total).toBe(1);
    expect(filtrada.body.alertas[0].alerta_id).toBe(finalizadaId);
    const pagina = await consultar()
      .query({ usuario_id: usuarioId, limit: 1, offset: 1 })
      .expect(200);
    expect(pagina.body.total).toBe(2);
    expect(
      pagina.body.alertas.map((a: { alerta_id: number }) => a.alerta_id),
    ).toEqual([finalizadaId]);
    const vacia = await consultar()
      .query({ usuario_id: usuarioId, offset: 20 })
      .expect(200);
    expect(vacia.body).toMatchObject({ total: 2, alertas: [] });
  });

  it('rechaza filtros inválidos y parámetros ajenos al contrato', async () => {
    for (const query of [
      { estado: 'OTRO' },
      { usuario_id: '1 OR 1=1' },
      { limit: 101 },
      { offset: -1 },
      { rol: 1 },
    ]) {
      await consultar().query(query).expect(400);
    }
  });

  it('la siguiente consulta refleja un cierre y conserva eventos de cuentas eliminadas', async () => {
    await source.query(
      `UPDATE alerta SET estado_alerta = 'FINALIZADA', fecha_cierre = clock_timestamp() WHERE alerta_id = $1`,
      [activaId],
    );
    const cerradas = await consultar()
      .query({ usuario_id: usuarioId, estado: 'ACTIVA' })
      .expect(200);
    expect(cerradas.body).toMatchObject({ total: 0, alertas: [] });
    await source.query('DELETE FROM usuario WHERE usuario_id = $1', [
      usuarioId,
    ]);
    const historial = await consultar().expect(200);
    const evento = historial.body.alertas.find(
      (a: { alerta_id: number }) => a.alerta_id === activaId,
    );
    expect(evento).toMatchObject({
      usuario_id: null,
      nombre_usuario: null,
      mensaje: '[Contenido eliminado]',
      estado_alerta: 'FINALIZADA',
    });
  });
});
