import { IsString, MaxLength, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password_actual!: string;

  // Mismas reglas que el registro (CrearUsuarioDto).
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password_nueva!: string;
}
