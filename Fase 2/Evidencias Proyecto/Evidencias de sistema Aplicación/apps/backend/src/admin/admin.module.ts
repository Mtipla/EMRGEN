import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Usuario } from '../usuarios/usuarios.entity';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { LoginModule } from '../login/login.module';
import { AuditoriaController } from '../auditoria/auditoria.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, PlanUsuario]),
    LoginModule, // JwtAuthGuard + RolesGuard + LoginService (reglas de cuentas)
    AuditoriaModule, // Bitácora
  ],
  // AuditoriaController (/admin/auditoria) vive aquí porque necesita los guards de LoginModule.
  controllers: [AdminController, AuditoriaController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
