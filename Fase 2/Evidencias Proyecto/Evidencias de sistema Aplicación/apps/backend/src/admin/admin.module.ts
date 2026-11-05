import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Usuario } from '../usuarios/usuarios.entity';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { LoginModule } from '../login/login.module';
import { AuditoriaController } from '../auditoria/auditoria.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { AdminAlertasController } from './admin-alertas.controller';
import { AdminAlertasService } from './admin-alertas.service';
import { AdminVentasController } from './admin-ventas.controller';
import { AdminVentasService } from './admin-ventas.service';
import { JsreportModule } from '../integrations/jsreport/jsreport.module';
import { AdminTicketsController } from './admin-tickets.controller';
import { AdminTicketsService } from './admin-tickets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, PlanUsuario]),
    LoginModule, 
    AuditoriaModule, 
    JsreportModule,
  ],
  controllers: [AdminController, AuditoriaController, AdminAlertasController, AdminVentasController, AdminTicketsController],
  providers: [AdminService, AdminAlertasService, AdminVentasService, AdminTicketsService],
  exports: [AdminService],
})
export class AdminModule {}
