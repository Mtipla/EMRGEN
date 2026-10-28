import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ContactoDto, normalizarTelefono } from './perfil.dto';

describe('CA-03.1: número de contacto normalizado a E.164', () => {
  it.each([true, false, undefined])('acepta el permiso booleano %s', async (permiso) => {
    const dto = plainToInstance(ContactoDto, {
      nombre_contacto: 'Contacto', num_emergencia: '+56912345678', compartir_antecedentes: permiso,
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it.each(['false', 0, null])('rechaza el permiso inválido %s', async (permiso) => {
    const dto = plainToInstance(ContactoDto, {
      nombre_contacto: 'Contacto', num_emergencia: '+56912345678', compartir_antecedentes: permiso,
    });
    expect((await validate(dto)).some((e) => e.property === 'compartir_antecedentes')).toBe(true);
  });

  it.each([
    ['+56912345678'],
    ['+56 9 1234 5678'],
    ['(9) 1234-5678'],
    ['9 1234 5678'],
    ['912345678'],
    ['+56-9-1234-5678'],
  ])('%s → +56912345678', (entrada) => {
    expect(normalizarTelefono(entrada)).toBe('+56912345678');
  });

  it('respeta otros países escritos con +', () => {
    expect(normalizarTelefono('+1 202 555 0123')).toBe('+12025550123');
  });

  it('lo que no reconoce solo pierde los espacios (lo rechaza @Matches)', () => {
    expect(normalizarTelefono('abc 12')).toBe('abc12');
  });

  it('el DTO guarda la forma canónica y rechaza lo inválido', async () => {
    const valido = plainToInstance(ContactoDto, { nombre_contacto: 'Mamá', num_emergencia: '(9) 1234-5678' });
    expect(await validate(valido)).toHaveLength(0);
    expect(valido.num_emergencia).toBe('+56912345678');
    const invalido = plainToInstance(ContactoDto, { nombre_contacto: 'Mamá', num_emergencia: 'abc' });
    expect((await validate(invalido))[0].constraints).toHaveProperty('matches');
  });
});
