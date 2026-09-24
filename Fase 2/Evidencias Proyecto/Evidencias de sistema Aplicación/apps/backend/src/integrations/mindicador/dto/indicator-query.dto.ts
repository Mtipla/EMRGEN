import type { IndicatorCode } from '@repo/api-types';
import { IsIn, IsOptional, Matches } from 'class-validator';

export const INDICATOR_CODES: IndicatorCode[] = [
  'uf',
  'ivp',
  'dolar',
  'dolar_intercambio',
  'euro',
  'ipc',
  'utm',
  'imacec',
  'tpm',
  'libra_cobre',
  'tasa_desempleo',
  'bitcoin',
];

export class IndicatorParamDto {
  @IsIn(INDICATOR_CODES)
  code: IndicatorCode;
}

export class IndicatorQueryDto {
  /** Fecha en formato dd-mm-yyyy (el formato que exige mindicador.cl). */
  @IsOptional()
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
    message: 'date debe tener formato dd-mm-yyyy',
  })
  date?: string;
}
