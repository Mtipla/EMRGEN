import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { FirebaseAuthUser } from '@repo/api-types';
import { verify, type JwtHeader, type JwtPayload } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { requireEnv } from '../../config/env';

const INTEGRATION = 'Firebase Authentication';
/** Claves públicas con las que Firebase firma los ID tokens (rotan cada pocas horas). */
const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

interface FirebaseTokenPayload extends JwtPayload {
  email?: string;
  email_verified?: boolean;
  name?: string;
  firebase?: { sign_in_provider?: string };
}

/**
 * Firebase Authentication del lado del servidor: verifica el ID token (JWT RS256)
 * que el frontend obtiene al iniciar sesión, sin firebase-admin ni cuenta de servicio.
 * Solo requiere el Project ID (FIREBASE_PROJECT_ID).
 */
@Injectable()
export class FirebaseAuthService {
  private readonly jwks = new JwksClient({
    jwksUri: JWKS_URL,
    cache: true,
    rateLimit: true,
  });

  async verifyIdToken(idToken: string): Promise<FirebaseAuthUser> {
    // TODO: INSERT_API_KEY_HERE -> definir FIREBASE_PROJECT_ID en el .env
    const projectId = requireEnv('FIREBASE_PROJECT_ID', INTEGRATION);

    const payload = await new Promise<FirebaseTokenPayload>(
      (resolve, reject) => {
        verify(
          idToken,
          (header: JwtHeader, callback) => {
            this.jwks
              .getSigningKey(header.kid)
              .then((key) => callback(null, key.getPublicKey()))
              .catch((error: Error) => callback(error));
          },
          {
            algorithms: ['RS256'],
            audience: projectId,
            issuer: `https://securetoken.google.com/${projectId}`,
          },
          (error, decoded) =>
            error || !decoded || typeof decoded === 'string'
              ? reject(error ?? new Error('Token inválido'))
              : resolve(decoded as FirebaseTokenPayload),
        );
      },
    ).catch(() => {
      throw new UnauthorizedException(
        'ID token de Firebase inválido o expirado.',
      );
    });

    if (!payload.sub)
      throw new UnauthorizedException('ID token de Firebase sin usuario.');

    return {
      uid: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified ?? false,
      name: payload.name,
      signInProvider: payload.firebase?.sign_in_provider,
    };
  }
}
