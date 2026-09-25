import type { FirebaseSession } from '@repo/api-types';

/*
 * Firebase Authentication desde el navegador mediante la API REST de Identity Toolkit.
 * No requiere instalar el SDK `firebase`; si más adelante se necesita (Google Sign-In,
 * persistencia automática), instalarlo y reemplazar este módulo.
 */
const IDENTITY_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';
const TOKEN_URL = 'https://securetoken.googleapis.com/v1/token';

export class FirebaseAuthError extends Error {
  /** Código de Firebase, ej. "EMAIL_EXISTS", "INVALID_LOGIN_CREDENTIALS". */
  readonly code: string;

  constructor(code: string) {
    super(`Firebase Auth: ${code}`);
    this.name = 'FirebaseAuthError';
    this.code = code;
  }
}

async function post<T>(url: string, apiKey: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!response.ok) throw new FirebaseAuthError(data.error?.message ?? `HTTP_${response.status}`);
  return data;
}

interface AccountResponse {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

const toSession = (data: AccountResponse): FirebaseSession => ({
  uid: data.localId,
  email: data.email,
  idToken: data.idToken,
  refreshToken: data.refreshToken,
  expiresIn: Number(data.expiresIn),
});

/**
 * @param apiKey Web API key del proyecto Firebase, normalmente `import.meta.env.VITE_FIREBASE_API_KEY`.
 */
export function createFirebaseAuth(apiKey: string) {
  return {
    signUp: async (email: string, password: string) =>
      toSession(
        await post<AccountResponse>(`${IDENTITY_URL}:signUp`, apiKey, {
          email,
          password,
          returnSecureToken: true,
        }),
      ),

    signIn: async (email: string, password: string) =>
      toSession(
        await post<AccountResponse>(`${IDENTITY_URL}:signInWithPassword`, apiKey, {
          email,
          password,
          returnSecureToken: true,
        }),
      ),

    /** Envía el correo de restablecimiento de contraseña. */
    sendPasswordReset: async (email: string) => {
      await post(`${IDENTITY_URL}:sendOobCode`, apiKey, { requestType: 'PASSWORD_RESET', email });
    },

    /** Obtiene un ID token nuevo cuando el anterior expira (1 hora). */
    refresh: async (refreshToken: string): Promise<FirebaseSession> => {
      const data = await post<{
        user_id: string;
        id_token: string;
        refresh_token: string;
        expires_in: string;
      }>(TOKEN_URL, apiKey, { grant_type: 'refresh_token', refresh_token: refreshToken });
      return {
        uid: data.user_id,
        email: '',
        idToken: data.id_token,
        refreshToken: data.refresh_token,
        expiresIn: Number(data.expires_in),
      };
    },
  };
}

export type FirebaseAuth = ReturnType<typeof createFirebaseAuth>;
