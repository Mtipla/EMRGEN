import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { SolicitudAutenticada } from './jwt-auth.guard';
import { ROLES_KEY } from './roles.decorator';

/** Compara el rol leído de la BD por JwtAuthGuard con los permitidos por @Roles. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permitidos = this.reflector.getAllAndOverride<number[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!permitidos?.length) return true;

    const { user } = context.switchToHttp().getRequest<SolicitudAutenticada>();
    if (!user || !permitidos.includes(user.rol_ID)) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }
    return true;
  }
}
