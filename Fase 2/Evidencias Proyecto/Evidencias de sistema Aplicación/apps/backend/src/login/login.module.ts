import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { readEnv } from '../config/env';
import { sessionDurationSeconds } from '../config/session';
import { FirebaseAuthModule } from '../integrations/firebase-auth/firebase-auth.module';
import { Usuario } from '../usuarios/usuarios.entity';
import { Pin } from '../usuarios/pin.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Pin]),
    UsuariosModule,
    AuditoriaModule, // Bitácora de las acciones de administrador (DELETE /usuarios/:id)
    FirebaseAuthModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = readEnv('JWT_SECRET');
        if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
          throw new Error(
            'JWT_SECRET es obligatorio y debe tener al menos 32 bytes. Genéralo y agrégalo al .env.',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: sessionDurationSeconds(readEnv('JWT_SESSION_HOURS')),
            issuer: 'emergen-api',
            audience: 'emergen-web',
            algorithm: 'HS256',
          },
        };
      },
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtAuthGuard, RolesGuard],
  // Otros módulos (Admin) protegen sus rutas con los mismos guards.
  exports: [JwtModule, LoginService, JwtAuthGuard, RolesGuard],
})
export class LoginModule {}
