import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readEnv } from '../config/env';
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
            expiresIn: '1h',
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
