import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Usuario } from '../usuarios/usuarios.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]), // Provee UsuarioRepository al AdminService
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
