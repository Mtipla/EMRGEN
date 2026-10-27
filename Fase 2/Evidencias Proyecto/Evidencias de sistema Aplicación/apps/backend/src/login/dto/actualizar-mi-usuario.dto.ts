import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ActualizarMiUsuarioDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre_usuario?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  correo_usuario?: string;
}

/** PATCH /usuarios/me. Solo aquí (no en /admin): un apadrinado parcial autoriza con el PIN de su principal (HU-10). */
export class ActualizarMiUsuarioPropioDto extends ActualizarMiUsuarioDto {
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'El PIN de la cuenta principal debe tener exactamente 4 dígitos' })
  PIN_principal?: string;
}
