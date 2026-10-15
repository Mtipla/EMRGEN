import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Usuario } from '../usuarios/usuarios.entity';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { LoginModule } from '../login/login.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, PlanUsuario]),
    LoginModule, // JwtAuthGuard + RolesGuard
    AuditoriaModule, // Bitácora (y sus rutas /admin/auditoria)
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
