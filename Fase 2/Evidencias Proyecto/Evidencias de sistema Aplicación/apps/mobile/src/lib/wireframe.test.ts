import { validarPin } from '@repo/ui/wireframe';
import { mismaSecuencia } from './alerta';

test('validarPin exige 4 dígitos iguales a la confirmación', () => {
  expect(validarPin('1234', '1234')).toBe('');
  expect(validarPin('123', '123')).not.toBe('');
  expect(validarPin('12a4', '12a4')).not.toBe('');
  expect(validarPin('1234', '4321')).toBe('Los PIN no coinciden.');
});

test('mismaSecuencia compara orden y largo, y rechaza secuencias vacías', () => {
  expect(mismaSecuencia(['a', 'b'], ['a', 'b'])).toBe(true);
  expect(mismaSecuencia(['a', 'b'], ['b', 'a'])).toBe(false);
  expect(mismaSecuencia(['a', 'b'], ['a'])).toBe(false);
  expect(mismaSecuencia([], [])).toBe(false);
});

import { perfilDe, puede, requierePinTrabajador } from '@repo/ui/permisos';

test('matriz de permisos: perfil por rol y cuenta principal', () => {
  expect(perfilDe({ rol_ID: 1 })).toBe('ADMINISTRADOR');
  expect(perfilDe({ rol_ID: 2 })).toBe('SOPORTE');
  expect(perfilDe({ rol_ID: 3, usuario_principal_ID: null })).toBe('USUARIO');
  expect(perfilDe({ rol_ID: 3, usuario_principal_ID: 7 })).toBe('APADRINADO');
  expect(perfilDe({})).toBeNull();
});

test('matriz de permisos: SOPORTE = Trabajador de los mockups, con menos privilegios que ADMINISTRADOR', () => {
  expect(puede('USUARIO', 'admin.cuentas.ver')).toBe(false);
  expect(puede('APADRINADO', 'cuentas.apadrinadas')).toBe(false);
  // Mockup Trabajador: cuentas y compras (buscar, añadir, modificar, eliminar con PIN, descargar).
  for (const accion of ['admin.cuentas.editar', 'admin.cuentas.eliminar', 'admin.compras.editar', 'soporte.gestionarTickets'] as const) {
    expect(puede('SOPORTE', accion)).toBe(true);
  }
  expect(requierePinTrabajador('SOPORTE')).toBe(true);
  expect(requierePinTrabajador('ADMINISTRADOR')).toBe(false);
  // Exclusivo del administrador.
  for (const accion of ['admin.trabajadores', 'perfil.pinTrabajador'] as const) {
    expect(puede('SOPORTE', accion)).toBe(false);
    expect(puede('ADMINISTRADOR', accion)).toBe(true);
  }
  expect(puede(null, 'perfil.editar')).toBe(false);
});
