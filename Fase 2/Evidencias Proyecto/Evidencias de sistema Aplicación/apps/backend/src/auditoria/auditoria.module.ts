import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JsreportModule } from '../integrations/jsreport/jsreport.module';
import { LoginModule } from '../login/login.module';
import { Aplicacion } from './aplicacion.entity';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { BitacoraSistema } from './bitacora.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BitacoraSistema, Aplicacion]),
    LoginModule, // JwtAuthGuard + RolesGuard
    JsreportModule,
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  // Otros módulos registran sus acciones con AuditoriaService.registrar.
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
