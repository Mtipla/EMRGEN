import { IsIn } from 'class-validator';
import type { FormatoReporte } from '../../integrations/jsreport/formato-reporte';

export class InformePersonalDto {
  @IsIn(['pdf', 'xlsx'])
  formato: FormatoReporte = 'pdf';
}
