import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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
