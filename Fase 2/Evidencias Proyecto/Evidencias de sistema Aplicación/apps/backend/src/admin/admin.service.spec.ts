import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const ID_ADMIN = 1;
  let usuarios: { findOneBy: jest.Mock; save: jest.Mock; delete: jest.Mock };
  let manager: EntityManager;
  let transaction: jest.Mock;
  let registrar: jest.Mock;
  let service: AdminService;

  beforeEach(() => {
    usuarios = {
      findOneBy: jest.fn(),
      save: jest.fn((usuario: Usuario) => Promise.resolve(usuario)),
      delete: jest.fn(),
    };
    manager = { getRepository: () => usuarios } as unknown as EntityManager;
    transaction = jest.fn((trabajo: (m: EntityManager) => Promise<unknown>) =>
      trabajo(manager),
    );
    registrar = jest.fn();
    service = new AdminService(
      { manager: { transaction } } as unknown as Repository<Usuario>,
      {} as Repository<PlanUsuario>,
      { registrar } as unknown as AuditoriaService,
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
        service.cambiarEstadoUsuario(ID_ADMIN, 3, ID_ADMIN),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(transaction).not.toHaveBeenCalled();
    });

    it('guarda el estado y la bitácora con el mismo manager de la transacción', async () => {
      usuarios.findOneBy.mockResolvedValueOnce({ usuario_ID: 7, estado_ID: 1 });

      const usuario = await service.cambiarEstadoUsuario(7, 3, ID_ADMIN);

      expect(usuario).toMatchObject({ usuario_ID: 7, estado_ID: 3 });
      expect(transaction).toHaveBeenCalledTimes(1);
      expect(registrar).toHaveBeenCalledWith(manager, {
        usuario_ID: ID_ADMIN,
        accion: 'Cambio de estado del usuario 7 a 3',
      });
    });

    it('propaga el fallo de la bitácora para que la transacción revierta el cambio', async () => {
      usuarios.findOneBy.mockResolvedValueOnce({ usuario_ID: 7, estado_ID: 1 });
      registrar.mockRejectedValueOnce(new Error('bitácora caída'));

      await expect(service.cambiarEstadoUsuario(7, 3, ID_ADMIN)).rejects.toThrow(
        'bitácora caída',
      );
    });

    it('responde 404 si el usuario no existe y no escribe en la bitácora', async () => {
      usuarios.findOneBy.mockResolvedValueOnce(null);

      await expect(
        service.cambiarEstadoUsuario(99, 3, ID_ADMIN),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(registrar).not.toHaveBeenCalled();
    });
  });

  describe('eliminarUsuarioApadrinado', () => {
    it('elimina al apadrinado y registra la acción', async () => {
      usuarios.findOneBy.mockResolvedValueOnce({ usuario_ID: 8, usuario_principal_ID: 7 });

      await service.eliminarUsuarioApadrinado(8, ID_ADMIN);

      expect(usuarios.delete).toHaveBeenCalledWith(8);
      expect(registrar).toHaveBeenCalledWith(manager, {
        usuario_ID: ID_ADMIN,
        accion: 'Eliminación de usuario apadrinado 8',
      });
    });

    it('responde 409 (no 500) si otras tablas referencian al apadrinado', async () => {
      usuarios.findOneBy.mockResolvedValueOnce({ usuario_ID: 8, usuario_principal_ID: 7 });
      usuarios.delete.mockRejectedValueOnce(errorLlaveForanea());

      await expect(
        service.eliminarUsuarioApadrinado(8, ID_ADMIN),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(registrar).not.toHaveBeenCalled();
    });

    it('no elimina cuentas principales', async () => {
      usuarios.findOneBy.mockResolvedValueOnce({ usuario_ID: 7, usuario_principal_ID: null });

      await expect(
        service.eliminarUsuarioApadrinado(7, ID_ADMIN),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(usuarios.delete).not.toHaveBeenCalled();
    });
  });
});
