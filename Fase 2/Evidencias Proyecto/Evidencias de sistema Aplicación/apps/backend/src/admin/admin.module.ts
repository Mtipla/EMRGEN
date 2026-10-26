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

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, PlanUsuario]),
    LoginModule, // JwtAuthGuard + RolesGuard + LoginService (reglas de cuentas)
    AuditoriaModule, // Bitácora
    JsreportModule,
  ],
  // AuditoriaController (/admin/auditoria) vive aquí porque necesita los guards de LoginModule.
  controllers: [AdminController, AuditoriaController, AdminAlertasController, AdminVentasController],
  providers: [AdminService, AdminAlertasService, AdminVentasService],
  exports: [AdminService],
})
export class AdminModule {}
