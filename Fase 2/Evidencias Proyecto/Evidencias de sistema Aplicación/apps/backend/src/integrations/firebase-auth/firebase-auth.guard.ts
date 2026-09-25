import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FirebaseAuthUser } from '@repo/api-types';
import { FirebaseAuthService } from './firebase-auth.service';

/** Request con el usuario que deja el guard. */
export interface FirebaseRequest {
  headers: Record<string, string | string[] | undefined>;
  firebaseUser?: FirebaseAuthUser;
}

/**
 * Protege un endpoint exigiendo `Authorization: Bearer <ID token de Firebase>`.
 * Uso: `@UseGuards(FirebaseAuthGuard)` y luego `request.firebaseUser`.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FirebaseRequest>();
    const header = request.headers.authorization;
    const [scheme, token] = typeof header === 'string' ? header.split(' ') : [];
    if (scheme !== 'Bearer' || !token)
      throw new UnauthorizedException('Falta el header Authorization: Bearer.');

    request.firebaseUser = await this.firebaseAuth.verifyIdToken(token);
    return true;
  }
}
