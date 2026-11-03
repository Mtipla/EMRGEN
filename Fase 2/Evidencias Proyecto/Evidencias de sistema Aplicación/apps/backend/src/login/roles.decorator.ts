import { SetMetadata } from '@nestjs/common';


export const ROL = {
  ADMINISTRADOR: 1,
  SOPORTE: 2,
  USUARIO: 3,
} as const;

export const ACCESO = { COMPLETO: 1, PARCIAL: 2 } as const;

export const ROLES_KEY = 'roles';


export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
