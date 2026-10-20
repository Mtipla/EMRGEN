import { IsInt, Max, Min } from 'class-validator';
import { MAX_APADRINADOS } from '../compras.constants';

export class CrearOrdenCompraDto {
  /** El límite real (plan y cupos ya comprados) lo valida ComprasService. */
  @IsInt()
  @Min(1)
  @Max(MAX_APADRINADOS)
  cantidad!: number;
}
