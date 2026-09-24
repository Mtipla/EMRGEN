import { Module } from '@nestjs/common';
import { JsreportController } from './jsreport.controller';
import { JsreportService } from './jsreport.service';

@Module({
  controllers: [JsreportController],
  providers: [JsreportService],
  exports: [JsreportService],
})
export class JsreportModule {}
