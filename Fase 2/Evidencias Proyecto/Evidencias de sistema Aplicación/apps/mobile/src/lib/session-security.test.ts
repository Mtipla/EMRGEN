import { afterEach, expect, test, vi } from 'vitest';
const native = vi.hoisted(() => ({ syncSession: vi.fn().mockResolvedValue({}), clearSession: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: () => 'android' }, registerPlugin: () => native }));
import { clearSession, saveSession, type SessionUser } from './session';
const user: SessionUser = { usuario_ID: 7, nombre_usuario: 'Synthetic', correo_usuario: null, requiere_pin: false };
afterEach(() => { localStorage.clear(); vi.clearAllMocks(); });

test('otra identidad sin token nuevo no hereda JWT y solicita limpiar sesión nativa', () => {
  saveSession(user, 'synthetic-token-A');
  saveSession({ ...user, usuario_ID: 8 });
  expect(localStorage.getItem('emergen.token')).toBeNull();
  expect(native.clearSession).toHaveBeenCalledTimes(1);
});
test('actualización del mismo perfil conserva token y sincroniza con el puente', () => {
  saveSession(user, 'synthetic-token-A');
  saveSession({ ...user, nombre_usuario: 'Synthetic updated' });
  expect(localStorage.getItem('emergen.token')).toBe('synthetic-token-A');
  expect(native.syncSession).toHaveBeenLastCalledWith(expect.objectContaining({ userId: 7, token: 'synthetic-token-A' }));
});
test('logout elimina ambas claves JS y solicita el borrado nativo', () => {
  saveSession(user, 'synthetic-token-A');
  clearSession();
  expect(localStorage.getItem('emergen.token')).toBeNull();
  expect(localStorage.getItem('emergen.user')).toBeNull();
  expect(native.clearSession).toHaveBeenCalledTimes(1);
});
