import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @MinLength(2)
  nombre_usuario!: string;

  @IsEmail()
  correo_usuario!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
