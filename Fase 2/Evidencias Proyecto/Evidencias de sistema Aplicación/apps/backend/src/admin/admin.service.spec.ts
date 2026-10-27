import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import {
  AuditoriaService,
  EventoAuditado,
  ResultadoAuditado,
} from '../auditoria/auditoria.service';
import { LoginService } from '../login/login.service';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const ADMIN = { sub: 1, rol_ID: 1 };
  let usuarios: {
    findOneBy: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    countBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let planes: { findOne: jest.Mock; create: jest.Mock; merge: jest.Mock; save: jest.Mock };
  let manager: EntityManager;
  let auditar: jest.Mock;
  /** Lo que la operación entregó a la bitácora (cambios, tipo, etc.); `null` si falló. */
  let auditado: ResultadoAuditado<unknown> | null;
  let prepararCuentaPrincipal: jest.Mock;
  let aplicarCambiosDePerfil: jest.Mock;
  let service: AdminService;

  const evento = () => (auditar.mock.calls[0] as [EventoAuditado])[0];

  beforeEach(() => {
    usuarios = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      countBy: jest.fn(),
      create: jest.fn((usuario: Usuario) => usuario),
      save: jest.fn((usuario: Usuario) => Promise.resolve(usuario)),
      delete: jest.fn(),
    };
    planes = {
      findOne: jest.fn(),
      create: jest.fn((plan: PlanUsuario) => plan),
      merge: jest.fn((plan: PlanUsuario, datos: Partial<PlanUsuario>) => Object.assign(plan, datos)),
      save: jest.fn((plan: PlanUsuario) => Promise.resolve(plan)),
    };
    manager = {
      query: jest.fn().mockResolvedValue([]),
      getRepository: (entidad: unknown) => (entidad === PlanUsuario ? planes : usuarios),
    } as unknown as EntityManager;
    auditado = null;
    // Doble de AuditoriaService.auditar: ejecuta la operación con el manager de la transacción.
    auditar = jest.fn(
      async (
        _evento: EventoAuditado,
        operacion: (m: EntityManager) => Promise<ResultadoAuditado<unknown>>,
      ) => {
        auditado = await operacion(manager);
        return auditado.valor;
      },
    );
    prepararCuentaPrincipal = jest.fn();
    aplicarCambiosDePerfil = jest.fn();
    service = new AdminService(
      {} as Repository<Usuario>,
      {} as Repository<PlanUsuario>,
      { auditar, registrar: jest.fn() } as unknown as AuditoriaService,
      {
        prepararCuentaPrincipal,
        aplicarCambiosDePerfil,
        traducirCorreoDuplicado: (error: unknown) => error,
      } as unknown as LoginService,
    );
  });

  const errorLlaveForanea = () =>
    new QueryFailedError(
      'DELETE FROM usuario',
      [],
      Object.assign(new Error('violates foreign key constraint'), { code: '23503' }),
    );

  describe('cambiarEstadoUsuario', () => {
    it('rechaza con 400 que el administrador cambie su propio estado', async () => {
      await expect(
        service.cambiarEstadoUsuario(ADMIN.sub, 3, ADMIN),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(usuarios.save).not.toHaveBeenCalled();
    });

    it('guarda el estado y entrega a la bitácora el actor, el afectado y el cambio', async () => {
      usuarios.findOneBy.mockResolvedValueOnce({ usuario_ID: 7, estado_ID: 1 });

      const usuario = await service.cambiarEstadoUsuario(7, 2, ADMIN);

      expect(usuario).toMatchObject({ usuario_ID: 7, estado_ID: 2 });
      expect(evento()).toEqual({
        actor: ADMIN,
        accion: 'Cambio de estado del usuario 7 a 2',
        tipo: 'MODIFICACION',
        entidad: 'USUARIO',
        usuario_afectado_ID: 7,
      });
      expect(auditado?.cambios).toEqual({ estado_ID: { antes: 1, despues: 2 } });
    });

    it('responde 404 si el usuario no existe', async () => {
      usuarios.findOneBy.mockResolvedValueOnce(null);

      await expect(
        service.cambiarEstadoUsuario(99, 3, ADMIN),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(auditado).toBeNull();
    });
  });

  describe('eliminarUsuarioApadrinado', () => {
    it('elimina al apadrinado y conserva en la bitácora quién era', async () => {
      usuarios.findOneBy.mockResolvedValueOnce({
        usuario_ID: 8,
        nombre_usuario: 'Hijo',
        usuario_principal_ID: 7,
      });

      await service.eliminarUsuarioApadrinado(8, ADMIN);

      expect(usuarios.delete).toHaveBeenCalledWith(8);
      expect(evento()).toMatchObject({
        accion: 'Eliminación de usuario apadrinado 8',
        tipo: 'ELIMINACION',
        usuario_afectado_ID: 8,
      });
      expect(auditado?.cambios).toEqual({
        nombre_usuario: { antes: 'Hijo', despues: null },
        usuario_principal_ID: { antes: 7, despues: null },
      });
    });

    it('responde 409 (no 500) si otras tablas referencian al apadrinado', async () => {
      usuarios.findOneBy.mockResolvedValueOnce({ usuario_ID: 8, usuario_principal_ID: 7 });
      usuarios.delete.mockRejectedValueOnce(errorLlaveForanea());

      await expect(
        service.eliminarUsuarioApadrinado(8, ADMIN),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(auditado).toBeNull();
    });

    it('no elimina cuentas principales', async () => {
      usuarios.findOneBy.mockResolvedValueOnce({ usuario_ID: 7, usuario_principal_ID: null });

      await expect(
        service.eliminarUsuarioApadrinado(7, ADMIN),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(usuarios.delete).not.toHaveBeenCalled();
    });
  });

  describe('roles de trabajadores', () => {
    it.each([[2, 3], [3, 2]] as const)('cambia el rol %s a %s sin una marca adicional', async (anterior, nuevo) => {
      usuarios.findOne.mockResolvedValueOnce({
        usuario_ID: 7, nombre_usuario: 'soporte', correo_usuario: 'soporte@emergen.test',
        rol_ID: anterior, estado_ID: 1, usuario_principal_ID: null,
      });
      if (anterior === 3) (manager.query as jest.Mock).mockResolvedValueOnce([{ existe: 1 }]);

      await expect(service.actualizarTrabajador(7, { rol_ID: nuevo }, ADMIN))
        .resolves.toMatchObject({ rol_ID: nuevo, estado_ID: 1 });
      expect(auditado?.cambios).toEqual({ rol_ID: { antes: anterior, despues: nuevo } });
    });

    it.each([
      { rol_ID: 1, usuario_principal_ID: null },
      { rol_ID: 3, usuario_principal_ID: 9 },
    ])('no convierte administradores ni apadrinados en soporte: %j', async (cuenta) => {
      usuarios.findOne.mockResolvedValueOnce({ usuario_ID: 7, ...cuenta });
      await expect(service.actualizarTrabajador(7, { rol_ID: 2 }, ADMIN))
        .rejects.toBeInstanceOf(NotFoundException);
      expect(usuarios.save).not.toHaveBeenCalled();
    });

    it('no edita el correo de un USUARIO sin historial de trabajador', async () => {
      usuarios.findOne.mockResolvedValueOnce({ usuario_ID: 7, rol_ID: 3, usuario_principal_ID: null });
      await expect(service.actualizarTrabajador(7, { correo_usuario: 'cambio@emergen.test' }, ADMIN))
        .rejects.toBeInstanceOf(NotFoundException);
      expect(aplicarCambiosDePerfil).not.toHaveBeenCalled();
    });

    it('no habilita como soporte una cuenta de usuario sin historial de trabajador', async () => {
      usuarios.findOne.mockResolvedValueOnce({ usuario_ID: 7, rol_ID: 3, usuario_principal_ID: null });
      await expect(service.actualizarTrabajador(7, { rol_ID: 2 }, ADMIN))
        .rejects.toBeInstanceOf(NotFoundException);
      expect(usuarios.save).not.toHaveBeenCalled();
    });

    it.each([1, 3])('no elimina cuentas de rol %s desde trabajadores', async (rol_ID) => {
      usuarios.findOne.mockResolvedValueOnce({ usuario_ID: 7, rol_ID });
      await expect(service.eliminarTrabajador(7, ADMIN)).rejects.toBeInstanceOf(NotFoundException);
      expect(usuarios.delete).not.toHaveBeenCalled();
    });
  });

  describe('crearTrabajadorSoporte', () => {
    const datos = {
      nombre_usuario: 'Sofía Soporte',
      correo_usuario: 'soporte@emergen.cl',
      password: 'ClaveSegura123',
    };

    it('fuerza el rol SOPORTE y no expone la contraseña ni su hash', async () => {
      prepararCuentaPrincipal.mockResolvedValueOnce({
        nombre_usuario: datos.nombre_usuario,
        correo_usuario: datos.correo_usuario,
        contra_usuario: '$2b$12$hash',
      });
      usuarios.save.mockImplementationOnce((usuario: Usuario) =>
        Promise.resolve(Object.assign(usuario, { usuario_ID: 9 })),
      );

      const cuenta = await service.crearTrabajadorSoporte(datos, ADMIN);

      expect(cuenta).toEqual({
        usuario_ID: 9,
        nombre_usuario: datos.nombre_usuario,
        correo_usuario: datos.correo_usuario,
        rol_ID: 2,
        estado_ID: 2,
      });
      expect(usuarios.save).toHaveBeenCalledWith(
        expect.objectContaining({ contra_usuario: '$2b$12$hash', usuario_principal_ID: null }),
      );
      expect(evento()).toMatchObject({ actor: ADMIN, tipo: 'CREACION', entidad: 'USUARIO' });
      expect(auditado).toMatchObject({
        usuario_afectado_ID: 9,
        accion: 'Registro de nueva cuenta de SOPORTE: soporte@emergen.cl',
        cambios: { rol_ID: { antes: null, despues: 2 } },
      });
      expect(JSON.stringify(auditado)).not.toMatch(/hash|ClaveSegura|contra_usuario/);
    });

    it('no guarda nada si el correo ya existe', async () => {
      prepararCuentaPrincipal.mockRejectedValueOnce(
        new ConflictException('Ya existe una cuenta con ese correo'),
      );

      await expect(
        service.crearTrabajadorSoporte(datos, ADMIN),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(usuarios.save).not.toHaveBeenCalled();
    });
  });

  describe('actualizarDatosUsuario', () => {
    const juan = (extra: Partial<Usuario> = {}) =>
      ({
        usuario_ID: 7,
        nombre_usuario: 'Juan',
        correo_usuario: 'juan@correo.com',
        rol_ID: 3,
        estado_ID: 1,
        usuario_principal_ID: null,
        ...extra,
      }) as Usuario;

    it('aplica los cambios con las reglas de LoginService y registra antes y después', async () => {
      usuarios.findOneBy.mockResolvedValueOnce(juan());
      aplicarCambiosDePerfil.mockResolvedValueOnce(juan({ nombre_usuario: 'Juan Pérez' }));

      const usuario = await service.actualizarDatosUsuario(7, { nombre_usuario: 'Juan Pérez' }, ADMIN);

      expect(aplicarCambiosDePerfil).toHaveBeenCalledWith(usuarios, 7, { nombre_usuario: 'Juan Pérez' });
      expect(usuario).toEqual({
        usuario_ID: 7,
        nombre_usuario: 'Juan Pérez',
        correo_usuario: 'juan@correo.com',
        rol_ID: 3,
        estado_ID: 1,
      });
      expect(evento()).toMatchObject({ tipo: 'MODIFICACION', entidad: 'USUARIO', usuario_afectado_ID: 7 });
      expect(auditado?.cambios).toEqual({
        nombre_usuario: { antes: 'Juan', despues: 'Juan Pérez' },
      });
    });

    it('el estado del usuario no limita al administrador: también gestiona cuentas de acceso parcial', async () => {
      usuarios.findOneBy.mockResolvedValueOnce(juan({ estado_ID: 2 }));
      aplicarCambiosDePerfil.mockResolvedValueOnce(juan({ estado_ID: 2, nombre_usuario: 'Otro' }));

      await expect(
        service.actualizarDatosUsuario(7, { nombre_usuario: 'Otro' }, ADMIN),
      ).resolves.toMatchObject({ nombre_usuario: 'Otro', estado_ID: 2 });
    });

    it('permite el correo propio de un apadrinado', async () => {
      usuarios.findOneBy.mockResolvedValueOnce(juan({ usuario_principal_ID: 2 }));

      aplicarCambiosDePerfil.mockResolvedValueOnce(juan({ usuario_principal_ID: 2, correo_usuario: 'otro@correo.com' }));
      await expect(service.actualizarDatosUsuario(7, { correo_usuario: 'otro@correo.com' }, ADMIN)).resolves.toMatchObject({ correo_usuario: 'otro@correo.com' });
      expect(aplicarCambiosDePerfil).toHaveBeenCalled();
    });

    it('responde 404 si el usuario no existe', async () => {
      usuarios.findOneBy.mockResolvedValueOnce(null);

      await expect(
        service.actualizarDatosUsuario(99, { nombre_usuario: 'Nadie' }, ADMIN),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('guardarPlanUsuario', () => {
    const datos = { plan_ID: 2, cupos_apadrinados_adq: 3 };

    it('asigna el plan a una cuenta principal y calcula los cupos utilizados', async () => {
      usuarios.findOne.mockResolvedValueOnce({ usuario_ID: 7, usuario_principal_ID: null });
      usuarios.countBy.mockResolvedValueOnce(1);
      planes.findOne.mockResolvedValueOnce(null);

      const plan = await service.guardarPlanUsuario(7, datos, ADMIN);

      expect(plan).toEqual({
        usuario_ID: 7,
        plan_ID: 2,
        cupos_apadrinados_adq: 3,
        cupos_ocupados: 1, cupos_disponibles: 2,
      });
      expect(evento()).toMatchObject({ entidad: 'PLAN_USUARIO', usuario_afectado_ID: 7 });
      expect(auditado).toMatchObject({
        tipo: 'CREACION',
        accion: 'Asignación de plan y cupos al usuario 7',
        cambios: {
          plan_ID: { antes: null, despues: 2 },
          cupos_apadrinados_adq: { antes: null, despues: 3 },
        },
      });
    });

    it('al modificar un plan registra solo los campos que cambiaron', async () => {
      usuarios.findOne.mockResolvedValueOnce({ usuario_ID: 7, usuario_principal_ID: null });
      usuarios.countBy.mockResolvedValueOnce(1);
      planes.findOne.mockResolvedValueOnce({
        plan_usuario_ID: 4,
        usuario_ID: 7,
        plan_ID: 2,
        cupos_apadrinados_adq: 2,
        cupos_ocupados: 1, cupos_disponibles: 2,
      });

      const plan = await service.guardarPlanUsuario(7, datos, ADMIN);

      expect(plan).toMatchObject({ plan_usuario_ID: 4, cupos_apadrinados_adq: 3 });
      expect(auditado).toMatchObject({
        tipo: 'MODIFICACION',
        accion: 'Modificación del plan y cupos del usuario 7',
      });
      expect(auditado?.cambios).toEqual({ cupos_apadrinados_adq: { antes: 2, despues: 3 } });
    });

    it('rechaza con 400 dejar menos cupos que los apadrinados existentes', async () => {
      usuarios.findOne.mockResolvedValueOnce({ usuario_ID: 7, usuario_principal_ID: null });
      usuarios.countBy.mockResolvedValueOnce(4);

      await expect(
        service.guardarPlanUsuario(7, datos, ADMIN),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(planes.save).not.toHaveBeenCalled();
    });

    it('rechaza con 400 asignar un plan a un apadrinado', async () => {
      usuarios.findOne.mockResolvedValueOnce({ usuario_ID: 8, usuario_principal_ID: 7 });

      await expect(
        service.guardarPlanUsuario(8, datos, ADMIN),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('obtenerExpedienteUsuario', () => {
    it('reúne la cuenta, el plan y los apadrinados, y registra la consulta', async () => {
      const usuario = { usuario_ID: 7, nombre_usuario: 'Juan' };
      const apadrinados = [{ usuario_ID: 8, nombre_usuario: 'Hijo', estado_ID: 1 }];
      usuarios.findOneBy.mockResolvedValueOnce(usuario);
      planes.findOne.mockResolvedValueOnce(null);
      usuarios.find.mockResolvedValueOnce(apadrinados);

      const expediente = await service.obtenerExpedienteUsuario(7, ADMIN);

      expect(expediente).toEqual({ usuario, plan: null, apadrinados, contactos: [], alertas: [] });
      expect(evento()).toEqual({
        actor: ADMIN,
        accion: 'Consulta del expediente del usuario 7',
        tipo: 'CONSULTA',
        entidad: 'USUARIO',
        usuario_afectado_ID: 7,
      });
    });

    it('responde 404 si el usuario no existe', async () => {
      usuarios.findOneBy.mockResolvedValueOnce(null);

      await expect(
        service.obtenerExpedienteUsuario(99, ADMIN),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
