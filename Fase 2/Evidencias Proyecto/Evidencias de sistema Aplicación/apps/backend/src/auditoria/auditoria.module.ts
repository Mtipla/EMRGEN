import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JsreportModule } from '../integrations/jsreport/jsreport.module';
import { Aplicacion } from './aplicacion.entity';
import { AuditoriaService } from './auditoria.service';
import { BitacoraSistema } from './bitacora.entity';

// Sin controlador ni LoginModule: así LoginModule y AdminModule pueden importar este
// módulo para auditar sus acciones sin crear una dependencia circular. Las rutas
// /admin/auditoria (AuditoriaController) las registra AdminModule, que ya tiene los guards.
@Module({
  imports: [TypeOrmModule.forFeature([BitacoraSistema, Aplicacion]), JsreportModule],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
