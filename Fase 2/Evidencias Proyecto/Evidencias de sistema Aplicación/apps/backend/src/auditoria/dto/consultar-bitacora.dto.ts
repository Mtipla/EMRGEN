import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, Matches, Max, Min } from 'class-validator';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const MENSAJE_FECHA = 'debe ser una fecha AAAA-MM-DD (UTC)';

/** Filtros de GET /admin/auditoria y /admin/auditoria/reporte (query string). */
export class ConsultarBitacoraDto {
  @IsOptional()
  @Matches(FECHA, { message: `desde ${MENSAJE_FECHA}` })
  @IsISO8601({ strict: true }, { message: `desde ${MENSAJE_FECHA}` })
  desde?: string;

  /** Inclusivo: abarca todo el día indicado. */
  @IsOptional()
  @Matches(FECHA, { message: `hasta ${MENSAJE_FECHA}` })
  @IsISO8601({ strict: true }, { message: `hasta ${MENSAJE_FECHA}` })
  hasta?: string;

  /** Usuario que realizó la acción (el administrador en las acciones del panel). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuario_ID?: number;

  // IDs de APLICACION: 1 web, 2 móvil, 3 escritorio.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2, 3])
  aplicacion_ID?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limite?: number;
}
