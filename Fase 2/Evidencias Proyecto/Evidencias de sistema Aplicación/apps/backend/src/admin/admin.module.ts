import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Usuario } from '../usuarios/usuarios.entity';
import { BitacoraSistema } from '../auditoria/bitacora.entity'; 
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { LoginModule } from '../login/login.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, BitacoraSistema, PlanUsuario]),
    LoginModule, // JwtAuthGuard + RolesGuard
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}