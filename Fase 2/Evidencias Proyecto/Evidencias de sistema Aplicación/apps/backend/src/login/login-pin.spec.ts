import { ConflictException, ForbiddenException, HttpException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { DataSource, Repository } from 'typeorm';
import type { AuditoriaService } from '../auditoria/auditoria.service';
import type { Usuario } from '../usuarios/usuarios.entity';
import type { UsuariosService } from '../usuarios/usuarios.service';
import { LoginService } from './login.service';

describe('LoginService.iniciarSesion: perfiles con PIN (modelo tipo Netflix)', () => {
  let ingresa: Partial<Usuario>;
  let perfiles: Partial<Usuario>[];
  let credencial: { pin_id: number; pin_hash: string; intentos_fallidos: number; bloqueado_hasta: Date | null; bloqueado: boolean };
  let temporales: Set<number>;
  let update: jest.Mock;
  let query: jest.Mock;
  let firmados: number[];
  let service: LoginService;
  let hashPassword: string;
  let hash1234: string;

  const login = (extra: object = {}) =>
    service.iniciarSesion({ correo_usuario: 'p@emergen.test', password: 'EmergenDev123!', ...extra });

  beforeAll(async () => {
    hashPassword = await bcrypt.hash('EmergenDev123!', 4);
    hash1234 = await bcrypt.hash('1234', 4);
  });

  beforeEach(() => {
    const base = { contra_usuario: hashPassword, rol_ID: 3 };
    perfiles = [
      { ...base, usuario_ID: 10, nombre_usuario: 'Principal', usuario_principal_ID: null, PIN_ID: 3, estado_ID: 1 },
      { ...base, usuario_ID: 11, nombre_usuario: 'Completo', usuario_principal_ID: 10, PIN_ID: 5, estado_ID: 1 },
      { ...base, usuario_ID: 12, nombre_usuario: 'Parcial', usuario_principal_ID: 10, PIN_ID: 6, estado_ID: 2 },
      { ...base, usuario_ID: 13, nombre_usuario: 'Sin PIN', usuario_principal_ID: 10, PIN_ID: null, estado_ID: 2 },
    ];
    ingresa = perfiles[0];
    credencial = { pin_id: 0, pin_hash: hash1234, intentos_fallidos: 0, bloqueado_hasta: null, bloqueado: false };
    temporales = new Set([5]);
    update = jest.fn();
    firmados = [];
    query = jest.fn((sql: string) => Promise.resolve(sql.includes('FOR UPDATE') ? [credencial] : []));
    const qb = { addSelect: () => qb, where: () => qb, getOne: () => Promise.resolve(ingresa) };
    service = new LoginService(
      { signAsync: ({ sub }: { sub: number }) => (firmados.push(sub), Promise.resolve('token')) } as unknown as JwtService,
      {} as UsuariosService,
      { createQueryBuilder: () => qb, find: () => Promise.resolve(perfiles) } as unknown as Repository<Usuario>,
      {} as AuditoriaService,
      {
        query,
        transaction: (op: (m: unknown) => unknown) => op({ query, getRepository: () => ({ update }) }),
        getRepository: () => ({
          findOneByOrFail: ({ PIN_ID }: { PIN_ID: number }) => Promise.resolve({ PIN_ID, pin_temporal: temporales.has(PIN_ID) }),
          update,
        }),
      } as unknown as DataSource,
    );
  });

  it('tras la contraseña de la principal devuelve los perfiles y ninguna sesión', async () => {
    const r = await login();
    expect(r).toEqual({ perfiles: expect.arrayContaining([expect.objectContaining({ usuario_ID: 13, tiene_pin: false })]) });
    expect((r as { perfiles: unknown[] }).perfiles).toHaveLength(4);
    expect(firmados).toEqual([]);
    expect(query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO acceso_aplicacion'), expect.anything());
  });

  it('el perfil principal también exige su PIN', async () => {
    await expect(login({ perfil_ID: 10, PIN: '9999' })).rejects.toBeInstanceOf(ForbiddenException);
    await expect(login({ perfil_ID: 10, PIN: '1234' })).resolves.toMatchObject({ access_token: 'token' });
    expect(firmados).toEqual([10]);
  });

  it('apadrinado completo: con el PIN temporal solo entra cambiándolo, y la sesión es la suya', async () => {
    await expect(login({ perfil_ID: 11, PIN: '1234' })).resolves.toEqual({ cambio_pin_requerido: true });
    await expect(login({ perfil_ID: 11, PIN: '1234', PIN_nuevo: '1234' })).rejects.toThrow('distinto');
    await login({ perfil_ID: 11, PIN: '1234', PIN_nuevo: '4321' });
    expect(update).toHaveBeenCalledWith(5, expect.objectContaining({ pin_temporal: false }));
    expect(firmados).toEqual([11]);
  });

  it('apadrinado parcial: entra con su PIN fijo y nunca se le pide cambiarlo', async () => {
    await expect(login({ perfil_ID: 12, PIN: '1234', PIN_nuevo: '4321' })).resolves.toMatchObject({ access_token: 'token' });
    expect(update).not.toHaveBeenCalled();
    expect(firmados).toEqual([12]);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO acceso_aplicacion'), [12, 1]);
  });

  it('perfil sin PIN generado no entra', async () => {
    await expect(login({ perfil_ID: 13, PIN: '1234' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('un perfil ajeno no se puede elegir', async () => {
    await expect(login({ perfil_ID: 99, PIN: '1234' })).rejects.toThrow('No se encontró el perfil');
  });

  it('el tercer fallo bloquea 5 minutos', async () => {
    credencial.intentos_fallidos = 2;
    await expect(login({ perfil_ID: 11, PIN: '9999' })).rejects.toMatchObject({ status: 429 });
    credencial.bloqueado = true;
    await expect(login({ perfil_ID: 11, PIN: '1234' })).rejects.toBeInstanceOf(HttpException);
  });

  it('el apadrinado no inicia sesión con su propio correo', async () => {
    ingresa = perfiles[1];
    await expect(login()).rejects.toThrow('cuenta principal');
  });

  it('administración y soporte entran sin selector', async () => {
    ingresa = { ...perfiles[0], rol_ID: 2 };
    await expect(login()).resolves.toMatchObject({ access_token: 'token' });
  });
});
