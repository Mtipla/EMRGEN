import { IsIn, IsInt } from 'class-validator';

export class ActualizarEstadoDto {
  // IDs de ESTADO_USUARIO: 1 acceso completo, 2 acceso parcial, 3 bloqueado/inactivo.
  @IsInt()
  @IsIn([1, 2, 3])
  estado_ID!: number;
}
