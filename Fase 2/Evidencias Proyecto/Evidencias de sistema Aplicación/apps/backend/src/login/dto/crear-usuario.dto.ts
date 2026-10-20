import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  // Largos máximos de USUARIO.nombre_usuario y USUARIO.correo_usuario.
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre_usuario!: string;

  @IsEmail()
  @MaxLength(100)
  correo_usuario!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
