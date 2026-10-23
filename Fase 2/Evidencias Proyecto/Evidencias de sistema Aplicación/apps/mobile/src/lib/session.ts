/**
 * Sesión del backend NestJS (mismas claves de localStorage que la web).
 * No importa ./api para no inicializar Firebase en pantallas que no lo usan.
 */
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
/** FastAPI internal-api (alertas SOS y tickets). En un teléfono real usa la IP del PC. */
const INTERNAL_API_URL = import.meta.env.VITE_INTERNAL_API_URL ?? 'http://localhost:8000';

export type SessionUser = {
  usuario_ID: number;
  nombre_usuario: string;
  correo_usuario: string;
  requiere_pin: boolean;
  /** Opcionales: los añadió el backend el 2026-10-21. */
  rol_ID?: number;
  estado_ID?: number;
  usuario_principal_ID?: number | null;
  /** Premium (plan propio o del principal); solo en login y GET /usuarios/me. */
  plan_efectivo?: boolean;
};

export function getUser(): SessionUser | null {
  try {
    return JSON.parse(localStorage.getItem('emergen.user') ?? 'null') as SessionUser | null;
  } catch {
    return null;
  }
}

export function saveSession(user: SessionUser, token?: string) {
  if (token) localStorage.setItem('emergen.token', token);
  localStorage.setItem('emergen.user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('emergen.token');
  localStorage.removeItem('emergen.user');
}

/** fetch al backend con el token de la sesión; lanza Error con el `message` del backend. */
export async function apiFetch<T>(path: string, init: RequestInit = {}, base = API_URL): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('emergen.token') ?? ''}`,
      ...init.headers,
    },
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = data as { message?: string | string[]; detail?: string } | null;
    const message = body?.message ?? body?.detail;
    throw new Error((Array.isArray(message) ? message.join(', ') : message) ?? `Error ${response.status}`);
  }
  return data as T;
}

export const internalFetch = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(`/internal/v1${path}`, init, INTERNAL_API_URL);

export const errorText = (cause: unknown) =>
  cause instanceof TypeError
    ? `No se pudo conectar con el backend (${API_URL}).`
    : cause instanceof Error
      ? cause.message
      : 'Ocurrió un error inesperado';
