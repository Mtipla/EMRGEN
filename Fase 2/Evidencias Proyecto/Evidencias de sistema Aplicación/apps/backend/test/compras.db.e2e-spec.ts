import './load-root-env';
import {
  BadGatewayException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { CapturePaypalOrderResponse } from '@repo/api-types';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { MindicadorService } from './../src/integrations/mindicador/mindicador.service';
import { PaypalService } from './../src/integrations/paypal/paypal.service';

/**
 * Compra de cuentas apadrinadas contra la PostgreSQL REAL de docker-compose, con PayPal y
 * mindicador reemplazados por dobles (no se contacta a PayPal ni se cobra dinero).
 * Requiere la BD con migraciones/001_compras_paypal.sql aplicada. En PowerShell:
 *   $env:DB_E2E=1; npm run test:e2e --workspace=backend -- compras.db
 * Crea sus propios usuarios y borra todo lo que generó al terminar.
 */
const db = process.env.DB_E2E === '1' ? describe : describe.skip;

const DOLAR = 950;

db('Compra de cuentas apadrinadas con PayPal (Docker)', () => {
  jest.setTimeout(60_000);

  const sufijo = randomUUID().slice(0, 8);
  const password = 'ClaveSegura123';
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let http: () => ReturnType<typeof request>;
  const ids: number[] = [];
  let token: string;
  let tokenOtro: string;
  let siguienteOrden = 0;

  const paypal = {
    createOrder: jest.fn(async () => ({
      id: `E2E${sufijo.toUpperCase()}${++siguienteOrden}`,
      status: 'CREATED',
    })),
    captureOrder: jest.fn(),
  };
  const capturaOk = (
    orderId: string,
    value: string,
    captureStatus = 'COMPLETED',
  ): CapturePaypalOrderResponse => ({
    orderId,
    status: captureStatus === 'COMPLETED' ? 'COMPLETED' : 'APPROVED',
    captureId: `CAP${orderId}`,
    captureStatus,
    amount: { value, currency: 'USD' },
  });

  const auth = (t = token) => ({ Authorization: `Bearer ${t}` });
  const crearOrden = (cantidad: number, t = token) =>
    http().post('/compras/apadrinados/ordenes').set(auth(t)).send({ cantidad });
  const capturar = (orderId: string, t = token) =>
    http().post(`/compras/apadrinados/ordenes/${orderId}/captura`).set(auth(t));
  const estadoVenta = async (ventaId: number) =>
    (
      await dataSource.query<{ estado_pago_id: number }[]>(
        'SELECT estado_pago_id FROM venta WHERE venta_id = $1',
        [ventaId],
      )
    )[0].estado_pago_id;
  const cupos = async () =>
    (await http().get('/compras/apadrinados').set(auth()).expect(200)).body
      .cuposAdquiridos as number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PaypalService)
      .useValue(paypal)
      .overrideProvider(MindicadorService)
      .useValue({
        get: async () => ({ series: [{ date: '', value: DOLAR }] }),
      })
      .compile();
    app = moduleFixture.createNestApplication({ logger: false });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    dataSource = app.get(DataSource);
    http = () => request(app.getHttpServer());

    for (const nombre of ['comprador', 'otro']) {
      const correo_usuario = `${nombre}.${sufijo}@e2e.test`;
      const { body } = await http()
        .post('/usuarios/registro')
        .send({ nombre_usuario: `Usuario Test ${nombre}`, correo_usuario, password })
        .expect(201);
      ids.push(body.usuario_ID);
    }
    token = (
      await http()
        .post('/usuarios/login')
        .send({ correo_usuario: `comprador.${sufijo}@e2e.test`, password })
    ).body.access_token;
    tokenOtro = (
      await http()
        .post('/usuarios/login')
        .send({ correo_usuario: `otro.${sufijo}@e2e.test`, password })
    ).body.access_token;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized && ids.length) {
      await dataSource.query(
        'DELETE FROM detalle_venta WHERE venta_id IN (SELECT venta_id FROM venta WHERE usuario_id = ANY($1))',
        [ids],
      );
      await dataSource.query('DELETE FROM venta WHERE usuario_id = ANY($1)', [ids]);
      await dataSource.query('DELETE FROM plan_usuario WHERE usuario_id = ANY($1)', [ids]);
      await dataSource.query('DELETE FROM usuario WHERE usuario_id = ANY($1)', [ids]);
    }
    await app?.close();
  });

  beforeEach(() => paypal.captureOrder.mockReset());

  it('exige sesión', async () => {
    await http().get('/compras/apadrinados').expect(401);
    await http().post('/compras/apadrinados/ordenes').send({ cantidad: 1 }).expect(401);
  });

  it('muestra el resumen con el usuario de la sesión y el precio de la tabla PLAN', async () => {
    const { body } = await http().get('/compras/apadrinados').set(auth()).expect(200);
    expect(body).toEqual({
      usuario: 'Usuario Test comprador',
      plan: expect.any(String),
      precioUnitario: expect.any(Number),
      cuposAdquiridos: 0,
      maxCantidad: 5,
    });
  });

  it('valida la cantidad y no acepta precio ni usuario desde el navegador', async () => {
    await crearOrden(0).expect(400);
    await crearOrden(6).expect(400);
    await http()
      .post('/compras/apadrinados/ordenes')
      .set(auth())
      .send({ cantidad: 1, amount: '0.01' })
      .expect(400);
    expect(paypal.createOrder).not.toHaveBeenCalled();
  });

  it('crea la orden con el monto calculado en el servidor y la venta PENDIENTE', async () => {
    const { body: resumen } = await http().get('/compras/apadrinados').set(auth());
    const { body } = await crearOrden(2).expect(201);
    const esperado = (Math.ceil(((resumen.precioUnitario * 2) / DOLAR) * 100) / 100).toFixed(2);

    expect(body).toEqual({
      ventaId: expect.any(Number),
      orderId: expect.any(String),
      totalClp: resumen.precioUnitario * 2,
      montoCobrado: esperado,
      monedaCobrada: 'USD',
    });
    expect(paypal.createOrder).toHaveBeenLastCalledWith(
      expect.objectContaining({ amount: esperado, currency: 'USD', referenceId: String(body.ventaId) }),
    );
    expect(await estadoVenta(body.ventaId)).toBe(1);
  });

  it('cobra, habilita los cupos una sola vez y no deja capturar órdenes ajenas', async () => {
    const { body: orden } = await crearOrden(2).expect(201);
    paypal.captureOrder.mockImplementation(async (id: string) => capturaOk(id, orden.montoCobrado));

    await capturar(orden.orderId, tokenOtro).expect(404);
    expect(paypal.captureOrder).not.toHaveBeenCalled();

    const antes = await cupos();
    const { body } = await capturar(orden.orderId).expect(200);
    expect(body).toEqual({ ventaId: orden.ventaId, estado: 'PAGADO', cuposAdquiridos: antes + 2 });
    expect(paypal.captureOrder).toHaveBeenCalledWith(
      orden.orderId,
      `findme-venta-${orden.ventaId}-captura`,
    );

    // Reintento (ej. se cortó la conexión): mismo resultado, sin cobrar ni sumar de nuevo.
    const { body: otraVez } = await capturar(orden.orderId).expect(200);
    expect(otraVez).toEqual(body);
    expect(paypal.captureOrder).toHaveBeenCalledTimes(1);
    expect(await cupos()).toBe(antes + 2);
  });

  it('dos capturas simultáneas de la misma orden suman los cupos una sola vez', async () => {
    const { body: orden } = await crearOrden(1).expect(201);
    paypal.captureOrder.mockImplementation(async (id: string) => capturaOk(id, orden.montoCobrado));
    const antes = await cupos();

    const respuestas = await Promise.all([capturar(orden.orderId), capturar(orden.orderId)]);
    expect(respuestas.map((r) => r.body.estado)).toEqual(['PAGADO', 'PAGADO']);
    expect(await cupos()).toBe(antes + 1);
  });

  it('un pago rechazado queda RECHAZADO y no suma cupos', async () => {
    const { body: orden } = await crearOrden(1).expect(201);
    paypal.captureOrder.mockImplementation(async (id: string) =>
      capturaOk(id, orden.montoCobrado, 'DECLINED'),
    );
    const antes = await cupos();

    const { body } = await capturar(orden.orderId).expect(200);
    expect(body).toEqual({ ventaId: orden.ventaId, estado: 'RECHAZADO' });
    expect(await estadoVenta(orden.ventaId)).toBe(3);
    expect(await cupos()).toBe(antes);
  });

  it('un error de PayPal deja la venta PENDIENTE para reintentar', async () => {
    const { body: orden } = await crearOrden(1).expect(201);
    paypal.captureOrder.mockRejectedValue(new BadGatewayException('PayPal rechazó la solicitud'));

    await capturar(orden.orderId).expect(502);
    expect(await estadoVenta(orden.ventaId)).toBe(1);

    // Cancelada por el usuario: ya no se puede cobrar.
    const { body } = await http()
      .post(`/compras/apadrinados/ordenes/${orden.orderId}/cancelar`)
      .set(auth())
      .expect(200);
    expect(body.estado).toBe('CANCELADO');
    await capturar(orden.orderId).expect(409);
  });

  it('un cobro PENDING en PayPal no se presenta como éxito ni se puede cancelar', async () => {
    const { body: orden } = await crearOrden(1).expect(201);
    paypal.captureOrder.mockImplementation(async (id: string) =>
      capturaOk(id, orden.montoCobrado, 'PENDING'),
    );
    const antes = await cupos();

    const { body } = await capturar(orden.orderId).expect(200);
    expect(body.estado).toBe('PENDIENTE');
    const { body: cancelada } = await http()
      .post(`/compras/apadrinados/ordenes/${orden.orderId}/cancelar`)
      .set(auth())
      .expect(200);
    expect(cancelada.estado).toBe('PENDIENTE');
    expect(await cupos()).toBe(antes);
  });

  it('si PayPal cobra un monto distinto no habilita y deja la venta para revisión', async () => {
    const { body: orden } = await crearOrden(1).expect(201);
    paypal.captureOrder.mockImplementation(async (id: string) => capturaOk(id, '0.01'));
    const antes = await cupos();

    const { body } = await capturar(orden.orderId).expect(500);
    expect(body.message).toContain(`boleta ${orden.ventaId}`);
    expect(await estadoVenta(orden.ventaId)).toBe(5);
    expect(await cupos()).toBe(antes);
  });

  it('no permite superar el máximo de 5 cuentas apadrinadas', async () => {
    const { body: resumen } = await http().get('/compras/apadrinados').set(auth()).expect(200);
    expect(resumen.cuposAdquiridos).toBe(3);
    expect(resumen.maxCantidad).toBe(2);
    await crearOrden(3).expect(400);
  });
});
