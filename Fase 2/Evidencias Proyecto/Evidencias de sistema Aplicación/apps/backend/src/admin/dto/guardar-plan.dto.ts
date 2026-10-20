import { IsBoolean, IsInt, Max, Min } from 'class-validator';
import { MAX_APADRINADOS } from '../../usuarios/usuarios.service';

/** Body de PUT /admin/usuarios/:id/plan: asigna el plan o reemplaza el existente. */
export class GuardarPlanDto {
  @IsBoolean()
  tiene_acceso_completo!: boolean;

  // Cupos de apadrinados adquiridos (0 los quita). Los utilizados los calcula el backend.
  @IsInt()
  @Min(0)
  @Max(MAX_APADRINADOS)
  cupos_apadrinados_adq!: number;
}
