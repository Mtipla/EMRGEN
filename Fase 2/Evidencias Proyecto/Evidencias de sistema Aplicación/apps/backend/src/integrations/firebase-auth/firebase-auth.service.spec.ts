import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { generateKeyPairSync } from 'node:crypto';
import { sign, type SignOptions } from 'jsonwebtoken';
import { FirebaseAuthService } from './firebase-auth.service';

const PROJECT_ID = 'emergen-test';

/** Par de claves RSA propio: simula las claves con las que Google firma los ID tokens. */
const keyPair = () =>
  generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

const google = keyPair();
const attacker = keyPair();

const firebaseToken = (
  options: SignOptions = {},
  privateKey = google.privateKey,
  payload: Record<string, unknown> = {},
) =>
  sign(
    {
      email: 'ana@example.com',
      email_verified: true,
      name: 'Ana',
      firebase: { sign_in_provider: 'password' },
      ...payload,
    },
    privateKey,
    {
      algorithm: 'RS256',
      keyid: 'kid-1',
      audience: PROJECT_ID,
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      subject: 'uid-123',
      expiresIn: '1h',
      ...options,
    },
  );

describe('FirebaseAuthService', () => {
  const originalEnv = { ...process.env };
  let service: FirebaseAuthService;
  let getSigningKey: jest.SpyInstance;

  beforeEach(() => {
    process.env.FIREBASE_PROJECT_ID = PROJECT_ID;
    service = new FirebaseAuthService();
    // Reemplaza la descarga del JWKS de Google por la clave pública de prueba.
    getSigningKey = jest
      .spyOn(
        (
          service as unknown as {
            jwks: { getSigningKey: () => Promise<unknown> };
          }
        ).jwks,
        'getSigningKey',
      )
      .mockResolvedValue({ getPublicKey: () => google.publicKey });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('verifica un ID token válido y devuelve el usuario', async () => {
    await expect(service.verifyIdToken(firebaseToken())).resolves.toEqual({
      uid: 'uid-123',
      email: 'ana@example.com',
      emailVerified: true,
      name: 'Ana',
      signInProvider: 'password',
    });
    expect(getSigningKey).toHaveBeenCalledWith('kid-1');
  });

  it.each<[string, () => string]>([
    ['expirado', () => firebaseToken({ expiresIn: -10 })],
    ['de otro proyecto (audience)', () => firebaseToken({ audience: 'otro' })],
    [
      'con issuer falso',
      () => firebaseToken({ issuer: 'https://evil.example.com' }),
    ],
    ['firmado con otra clave', () => firebaseToken({}, attacker.privateKey)],
    [
      'con algoritmo HS256 (confusión de algoritmo)',
      () =>
        sign({ sub: 'uid-123' }, 'secreto', {
          algorithm: 'HS256',
          audience: PROJECT_ID,
          issuer: `https://securetoken.google.com/${PROJECT_ID}`,
        }),
    ],
    ['malformado', () => 'no-es-un-jwt'],
  ])('rechaza con 401 un token %s', async (_caso, token) => {
    await expect(service.verifyIdToken(token())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rechaza con 401 un token sin sub', async () => {
    const token = sign({ email: 'x@example.com' }, google.privateKey, {
      algorithm: 'RS256',
      keyid: 'kid-1',
      audience: PROJECT_ID,
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      expiresIn: '1h',
    });
    await expect(service.verifyIdToken(token)).rejects.toThrow(
      'ID token de Firebase sin usuario.',
    );
  });

  it('responde 503 sin tocar Google si falta FIREBASE_PROJECT_ID', async () => {
    delete process.env.FIREBASE_PROJECT_ID;
    await expect(service.verifyIdToken(firebaseToken())).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(getSigningKey).not.toHaveBeenCalled();
  });
});
