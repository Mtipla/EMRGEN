import './load-root-env';
import {
  BadGatewayException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { JsreportService } from '../src/integrations/jsreport/jsreport.service';

const db = process.env.DB_E2E === '1' ? describe : describe.skip;

db('Ventas del panel administrativo (PostgreSQL)', () => {
  jest.setTimeout(60_000);
  let app: INestApplication, source: DataSource, usuarioId: number;
  const correo = `ventas.${randomUUID()}@emergen.test`;
  const ventas: number[] = [];
  const tokens: Record<string, string> = {};
  const renderInline = jest.fn();
  const pdf = {
    content: Buffer.from('%PDF-1.7\nreporte de prueba'),
    contentType: 'application/pdf',
  };
  const excel = {
    content: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  const http = () => request(app.getHttpServer());
  const consulta = (ruta = '/admin/ventas') =>
    http().get(ruta).auth(tokens.admin, { type: 'bearer' });

  beforeAll(async () => {
    renderInline.mockResolvedValue(pdf);
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(JsreportService)
      .useValue({ renderInline })
      .compile();
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
        `INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,estado_id)
        VALUES ('Prueba ventas', $1, 'no-login', 2) RETURNING usuario_id`,
        [correo],
      );
      usuarioId = usuario.usuario_id;
      await manager.query(
        'INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES ($1,2,0)',
        [usuarioId],
      );
      for (let i = 0; i < 22; i++) {
        const [venta] = await manager.query(
          `INSERT INTO venta(usuario_id,metodo_pago_id,estado_pago_id,total_venta,fecha_venta)
          VALUES ($1,1,$2,$3,CASE WHEN $4=0 THEN DATE '2026-10-23'::timestamp AT TIME ZONE 'America/Santiago'
            WHEN $4=1 THEN (DATE '2026-10-24'::timestamp AT TIME ZONE 'America/Santiago') - interval '1 second'
            ELSE DATE '2026-10-24'::timestamp AT TIME ZONE 'America/Santiago' END) RETURNING venta_id`,
          [
            usuarioId,
            i === 0 ? 2 : i === 1 ? 1 : 4,
            i === 0 ? 3000 : i === 1 ? 2000 : 1000,
            i,
          ],
        );
        ventas.push(venta.venta_id);
        if (i === 0) {
          await manager.query(
            `INSERT INTO detalle_venta(venta_id,plan_id,tipo_compra,cantidad,precio_uni,cupos_otorgados)
            VALUES ($1,2,'PLAN',1,1000,0), ($1,2,'CUPOS',2,1000,2)`,
            [venta.venta_id],
          );
        } else {
          await manager.query(
            `INSERT INTO detalle_venta(venta_id,plan_id,tipo_compra,cantidad,precio_uni,cupos_otorgados)
            VALUES ($1,2,'PLAN',1,$2,0)`,
            [venta.venta_id, i === 1 ? 2000 : 1000],
          );
        }
      }
    });
  });

  afterAll(async () => {
    if (source?.isInitialized && usuarioId)
      await source.transaction(async (manager) => {
        await manager.query(
          'DELETE FROM venta WHERE venta_id = ANY($1::int[])',
          [ventas],
        );
        await manager.query('DELETE FROM usuario WHERE usuario_id=$1', [
          usuarioId,
        ]);
      });
    await app?.close();
  });

  it('permite a soporte consultar ventas y reserva los reportes al administrador', async () => {
    for (const ruta of ['/admin/ventas', '/admin/ventas/reporte', '/admin/auditoria/reporte']) {
      await http().get(ruta).expect(401);
      for (const nombre of ['soporte', 'principal'])
        await http()
          .get(ruta)
          .query(ruta === '/admin/ventas' ? {} : { formato: 'xlsx' })
          .auth(tokens[nombre], { type: 'bearer' })
          .expect(ruta === '/admin/ventas' && nombre === 'soporte' ? 200 : 403);
    }
  });

  it('lista ventas reales sin duplicarlas por sus detalles y suma solo las pagadas', async () => {
    const { body } = await consulta()
      .query({ busqueda: correo, limit: 100 })
      .expect(200);
    expect(body.total).toBe(22);
    expect(body.total_pagado_clp).toBe(3000);
    const pagada = body.ventas.find(
      (v: { venta_id: number }) => v.venta_id === ventas[0],
    );
    expect(pagada).toMatchObject({
      usuario_id: usuarioId,
      nombre_usuario: 'Prueba ventas',
      correo_usuario: correo,
      estado: 'PAGADO',
      total_venta: 3000,
      metodo_pago: 'PAYPAL',
    });
    expect(pagada.detalles).toHaveLength(2);
    expect(JSON.stringify(body)).not.toMatch(/contra_usuario|pin_hash/);
  });

  it('pagina conservando totales y aplica fechas inclusivas en Chile', async () => {
    const primera = await consulta().query({ busqueda: correo }).expect(200);
    const segunda = await consulta()
      .query({ busqueda: correo, offset: 20 })
      .expect(200);
    expect(primera.body.ventas).toHaveLength(20);
    expect(segunda.body.ventas).toHaveLength(2);
    expect(segunda.body.total).toBe(22);
    const dia = await consulta()
      .query({ busqueda: correo, desde: '2026-10-23', hasta: '2026-10-23' })
      .expect(200);
    expect(dia.body.total).toBe(2);
    const pagadas = await consulta()
      .query({ busqueda: correo, estado_pago_id: 2 })
      .expect(200);
    expect(pagadas.body).toMatchObject({ total: 1, total_pagado_clp: 3000 });
  });

  it('rechaza filtros inválidos y rangos de fechas invertidos', async () => {
    for (const filtros of [
      { estado_pago_id: 6 },
      { limit: 101 },
      { offset: -1 },
      { desde: '2026-02-30' },
      { desde: '2026-10-24', hasta: '2026-10-23' },
      { html: '<h1>Hola</h1>' },
    ])
      await consulta().query(filtros).expect(400);
    await consulta('/admin/ventas/reporte').query({ limit: 1 }).expect(400);
    for (const ruta of ['/admin/ventas/reporte', '/admin/auditoria/reporte']) {
      for (const formato of ['csv', 'xls', '', ['pdf', 'xlsx']]) {
        await consulta(ruta).query({ formato }).expect(400);
      }
    }
  });

  it('genera el PDF con jsReport para todos los resultados, usando los mismos filtros', async () => {
    const response = await consulta('/admin/ventas/reporte')
      .query({ busqueda: correo })
      .expect(200)
      .expect('Content-Type', /application\/pdf/);
    expect(response.headers['content-disposition']).toMatch(
      /attachment; filename="ventas-.*\.pdf"/,
    );
    expect(response.body.subarray(0, 5).toString()).toBe('%PDF-');
    const [template, data] = renderInline.mock.calls.at(-1)!;
    expect(template.chrome.landscape).toBe(true);
    expect(data.ventas).toHaveLength(22);
    expect(data.total).toBe(22);
    expect(data.total_pagado).toContain('3.000');
    await consulta('/admin/ventas/reporte')
      .query({ busqueda: correo, estado_pago_id: 2 })
      .expect(200);
    expect(renderInline.mock.calls.at(-1)![1].ventas).toHaveLength(1);
  });

  it('un fallo de jsReport o una respuesta que no es PDF no impiden consultar las ventas', async () => {
    renderInline.mockRejectedValueOnce(
      new BadGatewayException('jsReport: sin respuesta'),
    );
    await consulta('/admin/ventas/reporte')
      .query({ busqueda: correo })
      .expect(502);
    renderInline.mockResolvedValueOnce({
      content: Buffer.from('<html>Error</html>'),
      contentType: 'text/html',
    });
    await consulta('/admin/ventas/reporte')
      .query({ busqueda: correo })
      .expect(502);
    await consulta().query({ busqueda: correo }).expect(200);
  });

  it('exporta Excel con todas las ventas filtradas y sus importes numéricos', async () => {
    renderInline.mockResolvedValueOnce(excel);
    const response = await consulta('/admin/ventas/reporte')
      .query({ busqueda: correo, formato: 'xlsx' })
      .expect(200)
      .expect('Content-Type', /spreadsheetml\.sheet/);
    expect(response.headers['content-disposition']).toMatch(/ventas-.*\.xlsx"/);
    const [template, data] = renderInline.mock.calls.at(-1)!;
    expect(template.recipe).toBe('html-to-xlsx');
    expect(template.content.match(/data-sheet-name="([^"]+)"/g)).toEqual([
      'data-sheet-name="Detalle de compras"',
      'data-sheet-name="Ventas"',
      'data-sheet-name="Resumen"',
    ]);
    expect(data.ventas).toHaveLength(22);
    expect(data.total_pagado_clp).toBe(3000);
    const pagada = data.ventas.find((v: { venta_id: number }) => v.venta_id === ventas[0]);
    expect(pagada.total_venta).toBe(3000);
    expect(pagada.usuario).toBe('Prueba ventas');
    expect(pagada.correo).toBe(correo);
    expect(pagada.detalles).toEqual(expect.arrayContaining([
      expect.objectContaining({ descripcion: 'Plan Premium', cantidad: 1, precio_uni: 1000, subtotal: 1000 }),
      expect.objectContaining({ descripcion: 'Cupos adicionales', cantidad: 2, precio_uni: 1000, subtotal: 2000 }),
    ]));
    expect(pagada.detalles.map((d: { subtotal: number }) => d.subtotal).reduce((a: number, b: number) => a + b, 0)).toBe(pagada.total_venta);

    renderInline.mockResolvedValueOnce(excel);
    await consulta('/admin/ventas/reporte')
      .query({ busqueda: correo, estado_pago_id: 2, formato: 'xlsx' }).expect(200);
    expect(renderInline.mock.calls.at(-1)![1].ventas).toHaveLength(1);

    // La respuesta por defecto es PDF: no debe guardarse bajo la extensión Excel.
    await consulta('/admin/ventas/reporte').query({ busqueda: correo, formato: 'xlsx' }).expect(502);
    await consulta().query({ busqueda: correo }).expect(200);
  });

  it.each(['pdf', 'xlsx'])('descarga la bitácora en %s y registra el formato exportado', async (formato) => {
    renderInline.mockResolvedValueOnce(formato === 'xlsx' ? excel : pdf);
    const response = await consulta('/admin/auditoria/reporte')
      .query({ formato, limite: 1 })
      .expect(200);
    expect(response.headers['content-disposition']).toContain(`.${formato}"`);
    expect(response.headers['content-type']).toContain(formato === 'xlsx' ? 'spreadsheetml.sheet' : 'application/pdf');
    const [template, data] = renderInline.mock.calls.at(-1)!;
    if (formato === 'xlsx') expect(template.recipe).toBe('html-to-xlsx');
    expect(data.entradas.length).toBeLessThanOrEqual(1);
    const { body } = await consulta('/admin/auditoria').query({ limite: 1 }).expect(200);
    expect(body[0]).toMatchObject({
      accion_realizada: `Exportación de la bitácora a ${formato === 'xlsx' ? 'Excel' : 'PDF'}`,
      resultado: 'EXITOSA',
    });
  });

  it('conserva el historial de ventas de una cuenta eliminada', async () => {
    await source.query('DELETE FROM usuario WHERE usuario_id=$1', [usuarioId]);
    const { body } = await consulta()
      .query({ busqueda: String(ventas[0]), limit: 100 })
      .expect(200);
    expect(
      body.ventas.find((v: { venta_id: number }) => v.venta_id === ventas[0]),
    ).toMatchObject({
      usuario_id: null,
      nombre_usuario: null,
      total_venta: 3000,
    });
  });
});
