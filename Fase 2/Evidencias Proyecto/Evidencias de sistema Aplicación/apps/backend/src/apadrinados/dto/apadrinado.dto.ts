import { IsBoolean, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** Cuenta apadrinada nueva: solo nombre, acceso y PIN; entra con el correo y la contraseña de la principal. */
export class CrearApadrinadoDto {
  // Largo máximo de USUARIO.nombre_usuario.
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre_usuario!: string;

  @IsBoolean()
  acceso_completo!: boolean;

  // PIN del perfil: temporal con acceso completo (lo cambia al entrar); fijo con acceso parcial.
  @Matches(/^\d{4}$/, { message: 'El PIN debe tener exactamente 4 dígitos' })
  PIN!: string;
}
