import { Module } from '@nestjs/common';
import { JsreportService } from './jsreport.service';

@Module({
  // Solo render interno desde reportes de negocio autorizados; sin API genérica de plantillas.
  providers: [JsreportService],
  exports: [JsreportService],
})
export class JsreportModule {}
