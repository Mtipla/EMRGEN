import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { LoginModule } from '../login/login.module';
import { Usuario } from '../usuarios/usuarios.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ApadrinadosController } from './apadrinados.controller';
import { ApadrinadosService } from './apadrinados.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    LoginModule, // JwtAuthGuard + LoginService
    UsuariosModule, // crearUsuarioApadrinado
    AdminModule, // cambio de acceso y eliminación con bitácora
  ],
  controllers: [ApadrinadosController],
  providers: [ApadrinadosService],
})
export class ApadrinadosModule {}
