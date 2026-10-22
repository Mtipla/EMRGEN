import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import type { UsuarioSesion } from '../login/jwt-auth.guard';
import { LoginService } from '../login/login.service';
import { Usuario } from '../usuarios/usuarios.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ApadrinadosService } from './apadrinados.service';

describe('ApadrinadosService', () => {
  const PRINCIPAL: UsuarioSesion = { sub: 10, email: 'p@emergen.test', rol_ID: 3, estado_ID: 1 };
  const filas: Record<number, Partial<Usuario>> = {
    10: { usuario_ID: 10, usuario_principal_ID: null },
    11: { usuario_ID: 11, usuario_principal_ID: 10 },
    21: { usuario_ID: 21, usuario_principal_ID: 20 }, // apadrinado de otro principal
  };
  let usuarios: { findOneBy: jest.Mock; find: jest.Mock };
  let crearUsuarioApadrinado: jest.Mock;
  let cambiarEstadoUsuario: jest.Mock;
  let service: ApadrinadosService;

  beforeEach(() => {
    usuarios = {
      findOneBy: jest.fn(({ usuario_ID, correo_usuario }: Partial<Usuario>) =>
        Promise.resolve(correo_usuario ? null : (filas[usuario_ID!] ?? null)),
      ),
      find: jest.fn().mockResolvedValue([]),
    };
    crearUsuarioApadrinado = jest.fn();
    cambiarEstadoUsuario = jest.fn();
    service = new ApadrinadosService(
      {} as DataSource,
      usuarios as unknown as Repository<Usuario>,
      { crearUsuarioApadrinado } as unknown as UsuariosService,
      { cambiarEstadoUsuario } as unknown as AdminService,
      { traducirCorreoDuplicado: (e: unknown) => e } as unknown as LoginService,
    );
  });

  it('no permite cambiar el acceso de un apadrinado de otro principal', async () => {
    await expect(service.cambiarAcceso(PRINCIPAL, 21, 1)).rejects.toBeInstanceOf(NotFoundException);
    expect(cambiarEstadoUsuario).not.toHaveBeenCalled();
  });

  it('cambia el acceso de su propio apadrinado con el principal como actor', async () => {
    await service.cambiarAcceso(PRINCIPAL, 11, 2);
    expect(cambiarEstadoUsuario).toHaveBeenCalledWith(11, 2, PRINCIPAL);
  });

  it('rechaza a un principal con acceso parcial', async () => {
    await expect(service.cambiarAcceso({ ...PRINCIPAL, estado_ID: 2 }, 11, 1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('traduce el rechazo del trigger de cupos a un 409 legible', async () => {
    crearUsuarioApadrinado.mockRejectedValue(
      new QueryFailedError('INSERT', [], Object.assign(new Error('Sin cupos'), { code: '23514' })),
    );
    await expect(
      service.crear(PRINCIPAL, {
        nombre_usuario: 'Hija',
        correo_usuario: 'hija@emergen.test',
        password: 'segura1234',
        acceso_completo: false,
      }),
    ).rejects.toThrow(new ConflictException('No tienes cupos libres: compra un cupo de cuenta apadrinada para añadir otra cuenta'));
  });
});
