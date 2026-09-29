import { SetMetadata } from '@nestjs/common';

/** IDs fijos de las tablas ROL y ESTADO_USUARIO (sembrados en init.sql). */
export const ROL = {
  ADMINISTRADOR: 1,
  SOPORTE: 2,
  USUARIO: 3,
} as const;

export const ESTADO_BLOQUEADO = 3;

export const ROLES_KEY = 'roles';

/** Restringe una ruta a los roles indicados. Requiere JwtAuthGuard + RolesGuard. */
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
