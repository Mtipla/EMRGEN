import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class ActualizarMiUsuarioDto {
  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/\S/, { message: 'El nombre de usuario no puede estar vacío' })
  nombre_usuario?: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsEmail()
  @MaxLength(100)
  correo_usuario?: string;
}

/** PATCH /usuarios/me. Solo aquí (no en /admin): un apadrinado parcial autoriza con el PIN de su principal (HU-10). */
export class ActualizarMiUsuarioPropioDto extends ActualizarMiUsuarioDto {
  @ValidateIf((_obj, valor) => valor !== undefined)
  @Matches(/^\d{4}$/, { message: 'El PIN debe tener exactamente 4 dígitos' })
  PIN?: string;

  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'El PIN de la cuenta principal debe tener exactamente 4 dígitos' })
  PIN_principal?: string;
}
