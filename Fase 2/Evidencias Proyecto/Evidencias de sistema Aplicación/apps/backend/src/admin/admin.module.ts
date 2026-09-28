import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Usuario } from '../usuarios/usuarios.entity';
import { BitacoraSistema } from '../auditoria/bitacora.entity'; 
import { PlanUsuario } from '../planes/plan-usuario.entity';     

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, BitacoraSistema, PlanUsuario]), 
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}