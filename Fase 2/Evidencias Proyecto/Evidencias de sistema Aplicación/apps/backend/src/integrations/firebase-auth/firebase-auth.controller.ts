import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { FirebaseAuthUser } from '@repo/api-types';
import { FirebaseAuthGuard, type FirebaseRequest } from './firebase-auth.guard';

@Controller('auth')
export class FirebaseAuthController {
  /** Devuelve el usuario del ID token; sirve para comprobar la sesión desde el frontend. */
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  me(@Req() request: FirebaseRequest): FirebaseAuthUser {
    return request.firebaseUser!;
  }
}
