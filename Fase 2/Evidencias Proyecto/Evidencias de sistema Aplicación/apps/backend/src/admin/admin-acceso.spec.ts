import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { LoginService } from '../login/login.service';
import { JwtAuthGuard } from '../login/jwt-auth.guard';
import { RolesGuard } from '../login/roles.guard';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminVentasController } from './admin-ventas.controller';
import { AdminVentasService } from './admin-ventas.service';

describe('Permisos HTTP del personal administrativo', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const usuarios = {
    listarUsuarios: jest.fn().mockResolvedValue([]),
    listarTrabajadores: jest.fn().mockResolvedValue([]),
    obtenerExpedienteUsuario: jest
      .fn()
      .mockResolvedValue({ usuario: { usuario_ID: 9 } }),
    actualizarDatosUsuario: jest.fn().mockResolvedValue({ usuario_ID: 9 }),
    cambiarEstadoUsuario: jest.fn(),
    guardarPlanUsuario: jest.fn(),
    eliminarUsuarioApadrinado: jest.fn(),
    crearTrabajadorSoporte: jest.fn(),
  };
  const ventas = {
    listar: jest
      .fn()
      .mockResolvedValue({ ventas: [], total: 0, total_pagado_clp: 0 }),
    generarReporte: jest.fn(),
  };
  let rol = 2;
  let estado = 1;
  const token = () =>
    jwt.sign(
      { sub: 42, email: 'personal@emergen.test' },
      { issuer: 'emergen-api', audience: 'emergen-web', expiresIn: '1h' },
    );

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [
        JwtModule.register({ secret: 'prueba-permisos-personal-emergen' }),
      ],
      controllers: [AdminController, AdminVentasController],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        {
          provide: LoginService,
          useValue: {
            buscarActivo: async () => ({
              usuario_ID: 42,
              correo_usuario: 'personal@emergen.test',
              rol_ID: rol,
              estado_ID: estado,
            }),
          },
        },
        { provide: AdminService, useValue: usuarios },
        { provide: AdminVentasService, useValue: ventas },
      ],
    }).compile();
    app = modulo.createNestApplication({ logger: false });
    await app.init();
    jwt = modulo.get(JwtService);
  });
  beforeEach(() => {
    rol = 2;
    estado = 1;
    jest.clearAllMocks();
  });
  afterAll(async () => {
    await app.close();
  });

  it('SOPORTE puede consultar cuentas, expedientes y compras', async () => {
    for (const ruta of [
      '/admin/usuarios',
      '/admin/usuarios/9',
      '/admin/ventas',
    ]) {
      await request(app.getHttpServer())
        .get(ruta)
        .auth(token(), { type: 'bearer' })
        .expect(200);
    }
  });

  it('SOPORTE no puede crear, editar, cambiar acceso o plan, eliminar ni generar reportes', async () => {
    const http = () => request(app.getHttpServer());
    const solicitudes = [
      ['post', '/admin/usuarios/soporte'],
      ['get', '/admin/usuarios/trabajadores'],
      ['patch', '/admin/usuarios/9'],
      ['put', '/admin/usuarios/9/estado'],
      ['put', '/admin/usuarios/9/plan'],
      ['delete', '/admin/usuarios/apadrinado/9'],
      ['get', '/admin/ventas/reporte'],
    ] as const;
    for (const [metodo, ruta] of solicitudes)
      await http()
        [metodo](ruta)
        .auth(token(), { type: 'bearer' })
        .send({ rol_ID: 1, estado_ID: 1 })
        .expect(403);
    expect(usuarios.actualizarDatosUsuario).not.toHaveBeenCalled();
    expect(usuarios.cambiarEstadoUsuario).not.toHaveBeenCalled();
    expect(usuarios.guardarPlanUsuario).not.toHaveBeenCalled();
    expect(usuarios.eliminarUsuarioApadrinado).not.toHaveBeenCalled();
    expect(usuarios.crearTrabajadorSoporte).not.toHaveBeenCalled();
    expect(usuarios.listarTrabajadores).not.toHaveBeenCalled();
    expect(ventas.generarReporte).not.toHaveBeenCalled();
  });

  it('solo el administrador consulta el listado de trabajadores', async () => {
    await request(app.getHttpServer()).get('/admin/usuarios/trabajadores').expect(401);
    rol = 1;
    await request(app.getHttpServer()).get('/admin/usuarios/trabajadores')
      .auth(token(), { type: 'bearer' }).expect(200);
    expect(usuarios.listarTrabajadores).toHaveBeenCalledTimes(1);
  });

  it('exige sesión y deniega la consulta a usuarios comunes y personal parcial', async () => {
    for (const ruta of [
      '/admin/usuarios',
      '/admin/usuarios/9',
      '/admin/ventas',
    ]) {
      await request(app.getHttpServer()).get(ruta).expect(401);
      rol = 3;
      await request(app.getHttpServer())
        .get(ruta)
        .auth(token(), { type: 'bearer' })
        .expect(403);
      rol = 2;
      estado = 2;
      await request(app.getHttpServer())
        .get(ruta)
        .auth(token(), { type: 'bearer' })
        .expect(403);
      estado = 1;
    }
  });

  it('relee el rol en cada petición y conserva las modificaciones del administrador', async () => {
    const sesion = token();
    await request(app.getHttpServer())
      .patch('/admin/usuarios/9')
      .auth(sesion, { type: 'bearer' })
      .send({ nombre_usuario: 'Cambio' })
      .expect(403);
    rol = 1;
    await request(app.getHttpServer())
      .patch('/admin/usuarios/9')
      .auth(sesion, { type: 'bearer' })
      .send({ nombre_usuario: 'Cambio' })
      .expect(200);
    expect(usuarios.actualizarDatosUsuario).toHaveBeenCalledWith(
      9,
      { nombre_usuario: 'Cambio' },
      expect.objectContaining({ rol_ID: 1 }),
    );
  });
});
