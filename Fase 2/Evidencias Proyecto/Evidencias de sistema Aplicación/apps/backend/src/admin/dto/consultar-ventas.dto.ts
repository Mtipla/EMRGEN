import { Transform, Type } from 'class-transformer';
import type { FormatoReporte } from '../../integrations/jsreport/formato-reporte';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class FiltrosVentasDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  busqueda?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2, 3, 4, 5])
  estado_pago_id?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsISO8601({ strict: true })
  desde?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsISO8601({ strict: true })
  hasta?: string;
}

export class ConsultarVentasDto extends FiltrosVentasDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}

export class ReporteVentasDto extends FiltrosVentasDto {
  @IsIn(['pdf', 'xlsx'])
  formato: FormatoReporte = 'pdf';
}
