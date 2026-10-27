import { IsEmail, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  correo_usuario!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  // Perfil elegido tras la contraseña de la principal (ella misma o un apadrinado).
  @IsOptional()
  @IsInt()
  perfil_ID?: number;

  // PIN del perfil elegido (temporal o propio).
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'El PIN debe tener exactamente 4 dígitos' })
  PIN?: string;

  // Reemplaza el PIN temporal en el mismo ingreso.
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'El PIN nuevo debe tener exactamente 4 dígitos' })
  PIN_nuevo?: string;
}
