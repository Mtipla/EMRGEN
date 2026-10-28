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

import { bloqueo, perfilDe, puede } from '@repo/ui/permisos';

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
  // SOPORTE consulta cuentas y compras, y atiende los tickets de los usuarios.
  for (const accion of ['admin.cuentas.ver', 'admin.compras.ver', 'soporte.gestionarTickets'] as const) {
    expect(puede('SOPORTE', accion)).toBe(true);
  }
  // Exclusivo del administrador.
  for (const accion of ['admin.cuentas.editar', 'admin.cuentas.eliminar', 'admin.compras.editar', 'admin.compras.eliminar', 'admin.trabajadores', 'perfil.pinTrabajador', 'alertas.verTodas'] as const) {
    expect(puede('SOPORTE', accion)).toBe(false);
    expect(puede('ADMINISTRADOR', accion)).toBe(true);
  }
  expect(puede(null, 'perfil.editar')).toBe(false);
});

test('apadrinados: completo, parcial y sin Premium (cuentas de README_BDD)', () => {
  const completo = { rol_ID: 3, estado_ID: 1, usuario_principal_ID: 7, plan_efectivo: true };
  const parcial = { ...completo, estado_ID: 2 };
  const sinPlan = { rol_ID: 3, estado_ID: 1, usuario_principal_ID: null, plan_efectivo: false };

  expect(bloqueo(completo, 'perfil.editar')).toBeNull();
  expect(bloqueo(completo, 'alertas.emitir')).toBeNull();
  expect(bloqueo(completo, 'soporte.solicitar')).toBeNull();
  expect(bloqueo(completo, 'cuentas.apadrinadas')).toBe('permiso');
  expect(bloqueo(completo, 'compras.comprar')).toBe('permiso');

  expect(bloqueo(parcial, 'perfil.editar')).toBe('parcial');
  expect(bloqueo(parcial, 'alertas.emitir')).toBeNull();
  expect(bloqueo(parcial, 'admin.cuentas.ver')).toBe('permiso');

  expect(bloqueo(sinPlan, 'alertas.emitir')).toBe('premium');
  expect(bloqueo(sinPlan, 'cuentas.apadrinadas')).toBe('premium');
  expect(bloqueo(sinPlan, 'perfil.editar')).toBeNull();
  expect(bloqueo(sinPlan, 'soporte.solicitar')).toBeNull();

  // Sesión antigua sin plan_efectivo ni estado_ID: no se bloquea, decide el backend.
  expect(bloqueo({ rol_ID: 3, usuario_principal_ID: null }, 'alertas.emitir')).toBeNull();
  expect(bloqueo({ rol_ID: 3, usuario_principal_ID: 7 }, 'perfil.editar')).toBeNull();
});
