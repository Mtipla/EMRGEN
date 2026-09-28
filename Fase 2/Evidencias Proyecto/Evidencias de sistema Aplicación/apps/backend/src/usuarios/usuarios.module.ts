import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { JwtModule } from '@nestjs/jwt';
import { readEnv } from '../config/env';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
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
  controllers: [UsuariosController],
  providers: [UsuariosService, JwtAuthGuard],
})
export class UsuariosModule {}
