import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFirebaseAuth, FirebaseAuthError } from './firebase-auth';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const account = {
  localId: 'uid-1',
  email: 'ana@example.com',
  idToken: 'id-token',
  refreshToken: 'refresh-token',
  expiresIn: '3600',
};

describe('createFirebaseAuth', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const auth = createFirebaseAuth('web-key');

  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  const lastCall = () => {
    const [url, init] = fetchMock.mock.calls.at(-1)!;
    return {
      url: String(url),
      body: JSON.parse(init!.body as string) as Record<string, unknown>,
    };
  };

  it('signIn: inicia sesión con email/contraseña y devuelve la sesión', async () => {
    fetchMock.mockResolvedValueOnce(json(account));

    await expect(auth.signIn('ana@example.com', 'secreta')).resolves.toEqual({
      uid: 'uid-1',
      email: 'ana@example.com',
      idToken: 'id-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
    });
    const { url, body } = lastCall();
    expect(url).toBe(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=web-key',
    );
    expect(body).toEqual({
      email: 'ana@example.com',
      password: 'secreta',
      returnSecureToken: true,
    });
  });

  it('signUp: registra al usuario', async () => {
    fetchMock.mockResolvedValueOnce(json(account));
    await auth.signUp('ana@example.com', 'secreta');
    expect(lastCall().url).toContain('/v1/accounts:signUp?key=web-key');
  });

  it('sendPasswordReset: pide el correo de restablecimiento', async () => {
    fetchMock.mockResolvedValueOnce(json({ email: 'ana@example.com' }));
    await auth.sendPasswordReset('ana@example.com');
    expect(lastCall().body).toEqual({
      requestType: 'PASSWORD_RESET',
      email: 'ana@example.com',
    });
  });

  it('refresh: renueva el ID token y traduce el formato snake_case', async () => {
    fetchMock.mockResolvedValueOnce(
      json({
        user_id: 'uid-1',
        id_token: 'nuevo',
        refresh_token: 'r2',
        expires_in: '3600',
      }),
    );
    await expect(auth.refresh('r1')).resolves.toMatchObject({
      uid: 'uid-1',
      idToken: 'nuevo',
      refreshToken: 'r2',
      expiresIn: 3600,
    });
    expect(lastCall().url).toBe('https://securetoken.googleapis.com/v1/token?key=web-key');
    expect(lastCall().body).toEqual({
      grant_type: 'refresh_token',
      refresh_token: 'r1',
    });
  });

  it.each([
    'INVALID_LOGIN_CREDENTIALS',
    'EMAIL_EXISTS',
    'USER_DISABLED',
    'TOO_MANY_ATTEMPTS_TRY_LATER',
  ])('lanza FirebaseAuthError con el código %s', async (code) => {
    fetchMock.mockResolvedValueOnce(json({ error: { code: 400, message: code } }, 400));
    const error = await auth.signIn('ana@example.com', 'mala').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(FirebaseAuthError);
    expect((error as FirebaseAuthError).code).toBe(code);
  });

  it('usa HTTP_<status> si Google responde sin JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>503</html>', { status: 503 }));
    await expect(auth.signIn('a@b.cl', 'x')).rejects.toMatchObject({
      code: 'HTTP_503',
    });
  });

  // Falla con el código actual: Firebase devuelve "WEAK_PASSWORD : Password should be
  // at least 6 characters" y ese texto completo queda como `code`, así que un
  // `if (error.code === 'WEAK_PASSWORD')` en la UI nunca coincide.
  it('separa el código del detalle en errores como WEAK_PASSWORD', async () => {
    fetchMock.mockResolvedValueOnce(
      json(
        {
          error: {
            code: 400,
            message: 'WEAK_PASSWORD : Password should be at least 6 characters',
          },
        },
        400,
      ),
    );
    await expect(auth.signUp('a@b.cl', '123')).rejects.toMatchObject({
      code: 'WEAK_PASSWORD',
    });
  });
});
