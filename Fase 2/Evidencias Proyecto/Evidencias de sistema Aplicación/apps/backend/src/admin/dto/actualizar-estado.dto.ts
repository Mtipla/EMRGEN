import { IsIn, IsInt } from 'class-validator';

export class ActualizarEstadoDto {
  @IsInt()
  @IsIn([1, 2])
  estado_ID!: number;
}
