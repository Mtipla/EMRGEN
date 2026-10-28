import './load-root-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

const db = process.env.DB_E2E === '1' ? describe : describe.skip;
db(
  'Panel administrativo: permisos, trabajadores, cuentas y planes en PostgreSQL',
  () => {
    jest.setTimeout(60_000);
    let app: INestApplication, source: DataSource, jwt: JwtService;
    let adminId: number,
      soporteId: number,
      cuentaId: number,
      trabajadorId: number;
    let admin: string, soporte: string;
    const creados: number[] = [];
    const alertasCreadas: number[] = [];
    const detallesCreados: number[] = [];
    const sufijo = randomUUID().slice(0, 8);
    const http = () => request(app.getHttpServer());
    const auth = (token: string) => ({ Authorization: 'Bearer ' + token });
    const token = (id: number) =>
      jwt.sign({ sub: id, email: 'prueba@emergen.test' });

    beforeAll(async () => {
      const modulo = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = modulo.createNestApplication({ logger: false });
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();
      source = app.get(DataSource);
      jwt = app.get(JwtService);
      const hash = await bcrypt.hash('PruebaPanel123!', 4);
      const pinHash = await bcrypt.hash('1234', 4);
      for (const [nombre, rol] of [
        ['Admin', 1],
        ['Soporte', 2],
        ['Cuenta', 3],
      ] as const) {
        const [pin] = await source.query(
          'INSERT INTO pin(pin_hash) VALUES ($1) RETURNING pin_id',
          [pinHash],
        );
        const [usuario] = await source.query(
          `INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,rol_id,estado_id,pin_id)
        VALUES ($1,$2,$3,$4,1,$5) RETURNING usuario_id`,
          [
            nombre,
            nombre.toLowerCase() + '.' + sufijo + '@emergen.test',
            hash,
            rol,
            pin.pin_id,
          ],
        );
        creados.push(usuario.usuario_id);
      }
      [adminId, soporteId, cuentaId] = creados;
      await source.query(
        'INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES ($1,2,0)',
        [cuentaId],
      );
      admin = token(adminId);
      soporte = token(soporteId);
    });
    afterAll(async () => {
      if (source?.isInitialized) {
        for (const id of [...creados].reverse())
          await source.query('DELETE FROM usuario WHERE usuario_id=$1', [id]);
        for (const id of alertasCreadas)
          await source.query('DELETE FROM alerta WHERE alerta_id=$1', [id]);
        for (const id of detallesCreados)
          await source.query(
            'DELETE FROM detalle_alerta WHERE detalle_alerta_id=$1',
            [id],
          );
      }
      await app?.close();
    });

    it('soporte solo edita nombre de usuario; administrador solo nombre de usuario y PIN', async () => {
      const soporteDatos = {
        nombre_usuario: 'soporte.editado',
      };
      const r = await http()
        .patch('/usuarios/me')
        .set(auth(soporte))
        .send(soporteDatos)
        .expect(200);
      expect(r.body).toMatchObject(soporteDatos);
      expect(
        (await http().get('/usuarios/me').set(auth(soporte)).expect(200)).body,
      ).toMatchObject(soporteDatos);
      for (const datos of [
        { correo_usuario: 'cambio@emergen.test' },
        { PIN: '5555' },
        { estado_ID: 2 },
      ]) {
        const rechazo = await http()
          .patch('/usuarios/me')
          .set(auth(soporte))
          .send(datos);
        expect([400, 403]).toContain(rechazo.status);
      }
      await http()
        .patch('/usuarios/me/password')
        .set(auth(soporte))
        .send({
          password_actual: 'PruebaPanel123!',
          password_nueva: 'OtroPassword123!',
        })
        .expect(403);
      await http()
        .patch('/usuarios/me')
        .set(auth(admin))
        .send({
          nombre_usuario: 'admin.editado',
          PIN: '0007',
        })
        .expect(200);
      await http()
        .patch('/usuarios/me')
        .set(auth(admin))
        .send({ correo_usuario: 'admin.nuevo@emergen.test' })
        .expect(403);
      await http()
        .patch('/usuarios/me')
        .set(auth(admin))
        .send({ telefono: '+56912345678' })
        .expect(400);
      const [pin] = await source.query(
        'SELECT p.pin_hash FROM usuario u JOIN pin p USING(pin_id) WHERE u.usuario_id=$1',
        [adminId],
      );
      expect(await bcrypt.compare('0007', pin.pin_hash)).toBe(true);
      await http()
        .patch('/admin/usuarios/' + adminId)
        .set(auth(admin))
        .send({ correo_usuario: 'atajo@emergen.test' })
        .expect(400);
    });

    it('rechaza los campos retirados en perfiles y administración y no los devuelve', async () => {
      for (const sesion of [admin, soporte, token(cuentaId)]) {
        const perfil = (await http().get('/usuarios/me').set(auth(sesion)).expect(200)).body;
        for (const campo of ['nombre_completo', 'telefono', 'es_trabajador']) {
          expect(perfil).not.toHaveProperty(campo);
          const datos = { [campo]: campo === 'es_trabajador' ? true : 'Descartado' };
          await http().patch('/usuarios/me').set(auth(sesion)).send(datos).expect(400);
          await http().patch('/admin/usuarios/' + cuentaId).set(auth(admin)).send(datos).expect(400);
        }
      }
    });

    it('el administrador configura correo y PIN del trabajador, cambia su rol y revoca el mismo JWT', async () => {
      const alta = await http()
        .post('/admin/usuarios/soporte')
        .set(auth(admin))
        .send({
          nombre_usuario: 'Trabajador panel',
          correo_usuario: 'trabajador.' + sufijo + '@emergen.test',
          password: 'PruebaPanel123!',
        })
        .expect(201);
      trabajadorId = alta.body.usuario_ID;
      creados.push(trabajadorId);
      await http().get('/admin/usuarios/trabajadores').set(auth(soporte)).expect(403);
      await http().get('/admin/usuarios/trabajadores').set(auth(token(cuentaId))).expect(403);
      const inicial = (await http().get('/admin/usuarios/trabajadores').set(auth(admin)).expect(200)).body;
      expect(inicial.find((u: { usuario_ID: number }) => u.usuario_ID === trabajadorId)).toMatchObject({ rol_ID: 2 });
      await http()
        .patch('/admin/usuarios/trabajadores/' + cuentaId)
        .set(auth(admin))
        .send({ rol_ID: 2 })
        .expect(404);
      for (const datos of [{ PIN: 42 }, { PIN: null }, { rol_ID: null }, { rol_ID: 1 }, { rol_ID: '2' }, { rol_ID: true }, { estado_ID: 1 }]) {
        await http().patch('/admin/usuarios/trabajadores/' + trabajadorId).set(auth(admin)).send(datos).expect(400);
      }
      await http()
        .patch('/admin/usuarios/trabajadores/' + trabajadorId)
        .set(auth(soporte))
        .send({ rol_ID: 3 })
        .expect(403);
      const cambio = await http()
        .patch('/admin/usuarios/trabajadores/' + trabajadorId)
        .set(auth(admin))
        .send({
          PIN: '0042',
          correo_usuario: 'trabajador.editado.' + sufijo + '@emergen.test',
        })
        .expect(200);
      expect(cambio.body.estado_ID).toBe(1);
      expect(JSON.stringify(cambio.body)).not.toMatch(
        /0042|pin_hash|contra_usuario/,
      );
      const [pin] = await source.query(
        'SELECT p.pin_hash FROM usuario u JOIN pin p USING(pin_id) WHERE u.usuario_id=$1',
        [trabajadorId],
      );
      expect(await bcrypt.compare('0042', pin.pin_hash)).toBe(true);
      const sesion = token(trabajadorId);
      await http().get('/admin/usuarios').set(auth(sesion)).expect(200);
      await http()
        .patch('/admin/usuarios/trabajadores/' + trabajadorId)
        .set(auth(admin))
        .send({ rol_ID: 3 })
        .expect(200);
      await http().get('/admin/usuarios').set(auth(sesion)).expect(403);
      const listado = await http()
        .get('/admin/usuarios/trabajadores')
        .set(auth(admin))
        .expect(200);
      expect(
        listado.body.find(
          (u: { usuario_ID: number }) => u.usuario_ID === trabajadorId,
        ),
      ).toMatchObject({ rol_ID: 3, estado_ID: 1 });
      expect(listado.body.some((u: { usuario_ID: number }) => [cuentaId, adminId].includes(u.usuario_ID))).toBe(false);
      const recargado = (await http().get('/admin/usuarios/trabajadores').set(auth(admin)).expect(200)).body;
      expect(recargado.find((u: { usuario_ID: number }) => u.usuario_ID === trabajadorId)).toMatchObject({ rol_ID: 3 });
      const editado = await http()
        .patch('/admin/usuarios/trabajadores/' + trabajadorId)
        .set(auth(admin))
        .send({ correo_usuario: 'otro.' + sufijo + '@emergen.test' })
        .expect(200);
      expect(editado.body).toMatchObject({ rol_ID: 3, estado_ID: 1 });
      await http()
        .patch('/admin/usuarios/trabajadores/' + trabajadorId)
        .set(auth(admin))
        .send({ rol_ID: 2 })
        .expect(200);
      await http().get('/admin/usuarios').set(auth(sesion)).expect(200);
      const logs = await source.query(
        'SELECT cambios FROM bitacora_sistema WHERE usuario_afectado_id=$1',
        [trabajadorId],
      );
      expect(JSON.stringify(logs)).not.toMatch(/0042|pin_hash|contra_usuario/);
    });

    it('listado y expediente desglosan contactos y alertas sin multiplicar conteos ni incluir cuentas ajenas', async () => {
      for (const n of ['+56911111111', '+56922222222'])
        await source.query(
          "INSERT INTO contacto_emergencia(usuario_id,nombre_contacto,num_emergencia) VALUES ($1,'Auxilio',$2)",
          [cuentaId, n],
        );
      await source.query(
        "INSERT INTO contacto_emergencia(usuario_id,nombre_contacto,num_emergencia) VALUES ($1,'Ajeno','+56933333333')",
        [soporteId],
      );
      for (let i = 0; i < 3; i++) {
        const [detalle] = await source.query(
          'INSERT INTO detalle_alerta(texto_mensaje) VALUES ($1) RETURNING detalle_alerta_id',
          ['Panel ' + sufijo],
        );
        detallesCreados.push(detalle.detalle_alerta_id);
        await source.transaction(async (manager) => {
          const [alerta] = await manager.query(
            `INSERT INTO alerta(usuario_id,prioridad_id,detalle_alerta_id,clave_idempotencia,huella_solicitud)
          VALUES ($1,1,$2,$3,$4) RETURNING alerta_id`,
            [cuentaId, detalle.detalle_alerta_id, randomUUID(), 'd'.repeat(64)],
          );
          alertasCreadas.push(alerta.alerta_id);
          await manager.query(
            "UPDATE alerta SET estado_alerta='FINALIZADA',fecha_cierre=clock_timestamp() WHERE alerta_id=$1",
            [alerta.alerta_id],
          );
        });
      }
      const lista = (
        await http().get('/admin/usuarios').set(auth(admin)).expect(200)
      ).body;
      expect(
        lista.find((u: { usuario_ID: number }) => u.usuario_ID === cuentaId),
      ).toMatchObject({ numeros_vinculados: 2, alertas_generadas: 3 });
      const expediente = (
        await http()
          .get('/admin/usuarios/' + cuentaId)
          .set(auth(soporte))
          .expect(200)
      ).body;
      expect(expediente.contactos).toHaveLength(2);
      expect(expediente.alertas).toHaveLength(3);
      expect(
        expediente.contactos.every(
          (c: { nombre_contacto: string }) => c.nombre_contacto === 'Auxilio',
        ),
      ).toBe(true);
      expect(
        expediente.alertas.every(
          (a: { prioridad: string }) => a.prioridad === 'MEDICO',
        ),
      ).toBe(true);
    });

    it('plan y cupos son exclusivos del administrador y no alteran el acceso', async () => {
      await http().get('/admin/usuarios/planes').set(auth(soporte)).expect(403);
      expect(
        (
          await http()
            .get('/admin/usuarios/planes')
            .set(auth(admin))
            .expect(200)
        ).body.length,
      ).toBeGreaterThan(0);
      await http()
        .put('/admin/usuarios/' + cuentaId + '/plan')
        .set(auth(soporte))
        .send({ plan_ID: 2, cupos_apadrinados_adq: 2 })
        .expect(403);
      const guardado = await http()
        .put('/admin/usuarios/' + cuentaId + '/plan')
        .set(auth(admin))
        .send({ plan_ID: 2, cupos_apadrinados_adq: 2 })
        .expect(200);
      expect(guardado.body).toMatchObject({
        cupos_ocupados: 0,
        cupos_disponibles: 2,
      });
      const [cuenta] = await source.query(
        'SELECT estado_id FROM usuario WHERE usuario_id=$1',
        [cuentaId],
      );
      expect(cuenta.estado_id).toBe(1);
    });

    it('elimina completamente al trabajador deshabilitado y su PIN, invalida su sesión y conserva la auditoría', async () => {
      await http()
        .delete('/admin/usuarios/trabajadores/' + cuentaId)
        .set(auth(admin))
        .expect(404);
      await http()
        .delete('/admin/usuarios/trabajadores/' + adminId)
        .set(auth(admin))
        .expect(400);
      const [trabajador] = await source.query(
        'SELECT pin_id FROM usuario WHERE usuario_id=$1',
        [trabajadorId],
      );
      await http()
        .patch('/admin/usuarios/trabajadores/' + trabajadorId)
        .set(auth(admin))
        .send({ rol_ID: 3 })
        .expect(200);
      await http()
        .delete('/admin/usuarios/trabajadores/' + trabajadorId)
        .set(auth(soporte))
        .expect(403);
      await http()
        .delete('/admin/usuarios/trabajadores/' + trabajadorId)
        .set(auth(admin))
        .expect(200);
      expect(
        await source.query('SELECT 1 FROM usuario WHERE usuario_id=$1', [
          trabajadorId,
        ]),
      ).toHaveLength(0);
      expect(
        await source.query('SELECT 1 FROM pin WHERE pin_id=$1', [
          trabajador.pin_id,
        ]),
      ).toHaveLength(0);
      await http()
        .get('/usuarios/me')
        .set(auth(token(trabajadorId)))
        .expect(401);
      expect(
        await source.query(
          "SELECT 1 FROM bitacora_sistema WHERE accion_realizada=$1 AND resultado='EXITOSA'",
          ['Eliminación del trabajador ' + trabajadorId],
        ),
      ).toHaveLength(1);
    });
  },
);
