import { ConflictException, ForbiddenException, HttpException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import type { UsuarioSesion } from '../login/jwt-auth.guard';
import type { JsreportService } from '../integrations/jsreport/jsreport.service';
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
  let eliminarUsuarioApadrinado: jest.Mock;
  let query: jest.Mock;
  let obtenerPropio: jest.Mock;
  let renderInline: jest.Mock;
  let credencial: { pin_id: number; pin_hash: string; intentos_fallidos: number; bloqueado_hasta: Date | null; bloqueado: boolean };
  let service: ApadrinadosService;
  let hash1234: string;

  beforeAll(async () => {
    hash1234 = await bcrypt.hash('1234', 4);
  });

  beforeEach(() => {
    usuarios = {
      findOneBy: jest.fn(({ usuario_ID, correo_usuario }: Partial<Usuario>) =>
        Promise.resolve(correo_usuario ? null : (filas[usuario_ID!] ?? null)),
      ),
      find: jest.fn().mockResolvedValue([]),
    };
    crearUsuarioApadrinado = jest.fn();
    cambiarEstadoUsuario = jest.fn();
    eliminarUsuarioApadrinado = jest.fn();
    credencial = { pin_id: 5, pin_hash: hash1234, intentos_fallidos: 0, bloqueado_hasta: null, bloqueado: false };
    // Fila PIN del principal para verificarPinPrincipal (SELECT ... FOR UPDATE y UPDATE).
    query = jest.fn((sql: string) => Promise.resolve(sql.trimStart().startsWith('SELECT') ? [credencial] : []));
    obtenerPropio = jest.fn();
    renderInline = jest.fn().mockResolvedValue({ content: Buffer.from('%PDF-1.7'), contentType: 'application/pdf' });
    service = new ApadrinadosService(
      { query, transaction: (op: (m: unknown) => unknown) => op({ query }) } as unknown as DataSource,
      usuarios as unknown as Repository<Usuario>,
      { crearUsuarioApadrinado } as unknown as UsuariosService,
      { cambiarEstadoUsuario, eliminarUsuarioApadrinado } as unknown as AdminService,
      { traducirCorreoDuplicado: (e: unknown) => e, obtenerPropio } as unknown as LoginService,
      { renderInline } as unknown as JsreportService,
    );
  });

  describe('HU-19: informe personal', () => {
    it('el principal recibe su cuenta y la de sus apadrinados', async () => {
      obtenerPropio.mockResolvedValue({ usuario_ID: 10, nombre_usuario: 'P', correo_usuario: 'p@x', estado_ID: 1, usuario_principal_ID: null, plan_efectivo: true });
      usuarios.find.mockResolvedValue([{ usuario_ID: 11, nombre_usuario: 'H', correo_usuario: 'h@x', estado_ID: 2, PIN_ID: null }]);
      await service.informe(PRINCIPAL);
      expect(renderInline.mock.calls[0][1]).toMatchObject({
        principal: true,
        usuario: { nombre: 'P', acceso: 'Completo', premium: 'Sí' },
        apadrinados: [{ nombre: 'H', correo: 'h@x', acceso: 'Parcial', pin: 'Sin PIN' }],
      });
    });

    it('un apadrinado solo recibe su propia cuenta, nunca la de su principal', async () => {
      obtenerPropio.mockResolvedValue({ usuario_ID: 11, nombre_usuario: 'H', correo_usuario: 'h@x', estado_ID: 2, usuario_principal_ID: 10 });
      await service.informe({ ...PRINCIPAL, sub: 11 });
      expect(usuarios.find).not.toHaveBeenCalled();
      expect(renderInline.mock.calls[0][1]).toMatchObject({ principal: false, apadrinados: [] });
    });
  });

  it('no permite cambiar el acceso de un apadrinado de otro principal', async () => {
    await expect(service.cambiarAcceso(PRINCIPAL, 21, 1, '1234')).rejects.toBeInstanceOf(NotFoundException);
    expect(cambiarEstadoUsuario).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled(); // un ID ajeno no gasta intentos de PIN
  });

  it('cambia el acceso de su propio apadrinado con el principal como actor', async () => {
    await service.cambiarAcceso(PRINCIPAL, 11, 2, '1234');
    expect(cambiarEstadoUsuario).toHaveBeenCalledWith(11, 2, PRINCIPAL);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('intentos_fallidos = 0'), [5]);
    // Pasa a parcial: su PIN queda fijo (no temporal).
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('pin_temporal'), [11, false]);
  });

  describe('HU-10 / CA-10.1: PIN del principal', () => {
    it('PIN incorrecto: 403 con intentos restantes, cuenta el fallo y no desvincula', async () => {
      const error = await service.eliminar(PRINCIPAL, 11, '9999').catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as Error).message).toBe('PIN incorrecto. Te quedan 2 intentos.');
      expect(query).toHaveBeenLastCalledWith(expect.stringContaining('bloqueado_hasta = CASE'), [5, 1, 3]);
      expect(eliminarUsuarioApadrinado).not.toHaveBeenCalled();
    });

    it('tercer fallo: 429 con el mensaje de CA-10.1', async () => {
      credencial.intentos_fallidos = 2;
      const error = await service.cambiarAcceso(PRINCIPAL, 11, 1, '9999').catch((e: unknown) => e);
      expect((error as HttpException).getStatus()).toBe(429);
      expect((error as Error).message).toMatch(/bloqueado el intento de acceso por 5 minutos/);
      expect(query).toHaveBeenLastCalledWith(expect.any(String), [5, 3, 3]);
      expect(cambiarEstadoUsuario).not.toHaveBeenCalled();
    });

    it('bloqueado: 429 incluso con el PIN correcto, sin tocar el contador', async () => {
      Object.assign(credencial, { intentos_fallidos: 3, bloqueado_hasta: new Date(), bloqueado: true });
      const error = await service.eliminar(PRINCIPAL, 11, '1234').catch((e: unknown) => e);
      expect((error as HttpException).getStatus()).toBe(429);
      expect(query).toHaveBeenCalledTimes(1);
      expect(eliminarUsuarioApadrinado).not.toHaveBeenCalled();
    });

    it('bloqueo vencido: el siguiente fallo vuelve a contar desde 1', async () => {
      Object.assign(credencial, { intentos_fallidos: 3, bloqueado_hasta: new Date(0), bloqueado: false });
      await expect(service.eliminar(PRINCIPAL, 11, '9999')).rejects.toBeInstanceOf(ForbiddenException);
      expect(query).toHaveBeenLastCalledWith(expect.any(String), [5, 1, 3]);
    });

    it('PIN correcto: desvincula con el principal como actor', async () => {
      await service.eliminar(PRINCIPAL, 11, '1234');
      expect(eliminarUsuarioApadrinado).toHaveBeenCalledWith(11, PRINCIPAL);
    });
  });

  it('rechaza a un principal con acceso parcial', async () => {
    await expect(service.cambiarAcceso({ ...PRINCIPAL, estado_ID: 2 }, 11, 1, '1234')).rejects.toBeInstanceOf(
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
        PIN: '1234',
      }),
    ).rejects.toThrow(new ConflictException('No tienes cupos libres: compra un cupo de cuenta apadrinada para añadir otra cuenta'));
  });
});
