import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { LoginService } from '../login/login.service';
import { JwtAuthGuard } from '../login/jwt-auth.guard';
import { RolesGuard } from '../login/roles.guard';
import { AdminTicketsController } from './admin-tickets.controller';
import { AdminTicketsService } from './admin-tickets.service';

describe('Permisos HTTP de informes de tickets', () => {
  let app: INestApplication;
  let jwt: JwtService;
  let rol = 1;
  let estado = 1;
  const generarReporte = jest.fn();
  const token = () => jwt.sign({ sub: 42, email: 'admin@emergen.test' }, {
    issuer: 'emergen-api', audience: 'emergen-web', expiresIn: '1h',
  });

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'prueba-informes-tickets-emergen' })],
      controllers: [AdminTicketsController],
      providers: [JwtAuthGuard, RolesGuard,
        { provide: LoginService, useValue: { buscarActivo: async () => ({
          usuario_ID: 42, correo_usuario: 'admin@emergen.test', rol_ID: rol, estado_ID: estado,
        }) } },
        { provide: AdminTicketsService, useValue: { generarReporte } },
      ],
    }).compile();
    app = modulo.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    jwt = modulo.get(JwtService);
  });
  beforeEach(() => { rol = 1; estado = 1; generarReporte.mockReset(); });
  afterAll(async () => { await app.close(); });

  it('exige autenticación', async () => {
    await request(app.getHttpServer()).get('/admin/tickets/reporte').expect(401);
    expect(generarReporte).not.toHaveBeenCalled();
  });

  it.each([2, 3])('deniega al rol %s aunque invoque directamente PDF o Excel', async (otroRol) => {
    rol = otroRol;
    for (const formato of ['pdf', 'xlsx']) {
      await request(app.getHttpServer()).get(`/admin/tickets/reporte?formato=${formato}`)
        .auth(token(), { type: 'bearer' }).expect(403);
    }
    expect(generarReporte).not.toHaveBeenCalled();
  });

  it('relee permisos y deniega al administrador con acceso parcial', async () => {
    const sesion = token();
    estado = 2;
    await request(app.getHttpServer()).get('/admin/tickets/reporte').auth(sesion, { type: 'bearer' }).expect(403);
    estado = 1;
    rol = 2;
    await request(app.getHttpServer()).get('/admin/tickets/reporte').auth(sesion, { type: 'bearer' }).expect(403);
    expect(generarReporte).not.toHaveBeenCalled();
  });

  it.each(['pdf', 'xlsx'] as const)('entrega el archivo %s al administrador sin almacenarlo en caché', async (formato) => {
    const contentType = formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    generarReporte.mockResolvedValue({ content: Buffer.from('archivo-prueba'), contentType });
    const respuesta = await request(app.getHttpServer()).get(`/admin/tickets/reporte?formato=${formato}`)
      .auth(token(), { type: 'bearer' }).expect(200);
    expect(generarReporte).toHaveBeenCalledWith(formato);
    expect(respuesta.headers['content-type']).toBe(contentType);
    expect(respuesta.headers['content-disposition']).toMatch(new RegExp(`attachment; filename="tickets-cerrados-.*\\.${formato}"`));
    expect(respuesta.headers['cache-control']).toBe('no-store');
  });

  it('usa PDF por defecto y rechaza formatos o filtros que pretendan incluir tickets abiertos', async () => {
    generarReporte.mockResolvedValue({ content: Buffer.from('%PDF-1.7'), contentType: 'application/pdf' });
    await request(app.getHttpServer()).get('/admin/tickets/reporte').auth(token(), { type: 'bearer' }).expect(200);
    expect(generarReporte).toHaveBeenCalledWith('pdf');
    generarReporte.mockClear();
    for (const consulta of ['formato=csv', 'formato=pdf&estado=ABIERTO', 'formato=xlsx&limit=20']) {
      await request(app.getHttpServer()).get(`/admin/tickets/reporte?${consulta}`).auth(token(), { type: 'bearer' }).expect(400);
    }
    expect(generarReporte).not.toHaveBeenCalled();
  });
});
