import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import type { TipoCompra } from '@repo/api-types';
import { MAX_APADRINADOS } from '../compras.constants';

export class CrearOrdenCompraDto {
  @IsOptional()
  @IsIn(['PLAN', 'CUPOS'])
  tipo?: TipoCompra;

  /** El límite real (plan y cupos ya comprados) lo valida ComprasService. */
  @IsInt()
  @Min(1)
  @Max(MAX_APADRINADOS)
  cantidad!: number;
}
