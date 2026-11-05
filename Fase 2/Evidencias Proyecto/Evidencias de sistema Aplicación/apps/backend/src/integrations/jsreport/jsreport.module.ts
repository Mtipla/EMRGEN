import { Module } from '@nestjs/common';
import { JsreportService } from './jsreport.service';

@Module({
  providers: [JsreportService],
  exports: [JsreportService],
})
export class JsreportModule {}
