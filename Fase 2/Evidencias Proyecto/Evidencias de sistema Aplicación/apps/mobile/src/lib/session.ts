/**
 * Sesión del backend NestJS (mismas claves de localStorage que la web).
 * No importa ./api para no inicializar Firebase en pantallas que no lo usan.
 */
import { sincronizarSesionNativa } from "./volumen-nativo";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
/** FastAPI internal-api (alertas SOS y tickets). En un teléfono real usa la IP del PC. */
const INTERNAL_API_URL =
  import.meta.env.VITE_INTERNAL_API_URL ?? "http://localhost:8000";

export type SessionUser = {
  usuario_ID: number;
  nombre_usuario: string;
  /** null en cuentas apadrinadas (entran con la cuenta principal). */
  correo_usuario: string | null;
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
    return JSON.parse(
      localStorage.getItem("emergen.user") ?? "null",
    ) as SessionUser | null;
  } catch {
    return null;
  }
}

export function saveSession(user: SessionUser, token?: string) {
  // A profile refresh may preserve its token; a different identity must never inherit it.
  if (!token && getUser()?.usuario_ID !== user.usuario_ID) localStorage.removeItem("emergen.token");
  if (token) localStorage.setItem("emergen.token", token);
  localStorage.setItem("emergen.user", JSON.stringify(user));
  void sincronizarSesionNativa(
    user,
    localStorage.getItem("emergen.token"),
  ).catch(() => {});
}

export function clearSession() {
  localStorage.removeItem("emergen.token");
  localStorage.removeItem("emergen.user");
  void sincronizarSesionNativa(null).catch(() => {});
}

export function restaurarSesionNativa() {
  return sincronizarSesionNativa(
    getUser(),
    localStorage.getItem("emergen.token"),
  );
}

/** fetch al backend con el token de la sesión; lanza Error con el `message` y el `status` del backend. */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  base = API_URL,
): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("emergen.token") ?? ""}`,
      ...init.headers,
    },
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = data as {
      message?: string | string[];
      detail?: string;
    } | null;
    const message = body?.message ?? body?.detail;
    const sessionExpired =
      response.status === 401 &&
      path !== "/usuarios/login" &&
      path !== "/usuarios/password/firebase";
    throw Object.assign(
      new Error(
        sessionExpired
          ? "La sesión expiró o dejó de ser válida. Cierra sesión desde el menú y vuelve a iniciar sesión."
          : ((Array.isArray(message) ? message.join(", ") : message) ??
              `Error ${response.status}`),
      ),
      { status: response.status },
    );
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
      : "Ocurrió un error inesperado";
