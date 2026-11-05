import { IsInt, Max, Min } from 'class-validator';
import { MAX_APADRINADOS } from '../../usuarios/usuarios.service';

export class GuardarPlanDto {
  @IsInt()
  @Min(1)
  plan_ID!: number;

  @IsInt()
  @Min(0)
  @Max(MAX_APADRINADOS)
  cupos_apadrinados_adq!: number;
}
