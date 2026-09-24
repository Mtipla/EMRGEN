import {
  Body,
  Controller,
  HttpCode,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { GenerateReportDto } from './dto/generate-report.dto';
import { JsreportService } from './jsreport.service';

@Controller('reports')
export class JsreportController {
  constructor(private readonly jsreportService: JsreportService) {}

  /** Devuelve el archivo generado (normalmente PDF) como descarga. */
  @Post()
  @HttpCode(200)
  async generate(@Body() dto: GenerateReportDto): Promise<StreamableFile> {
    const report = await this.jsreportService.renderTemplate(
      dto.templateName,
      dto.data,
    );
    const extension = report.contentType.includes('pdf') ? 'pdf' : 'bin';
    return new StreamableFile(report.content, {
      type: report.contentType,
      disposition: `attachment; filename="${dto.fileName ?? 'reporte'}.${extension}"`,
    });
  }
}
