import { IsString, MaxLength, MinLength } from 'class-validator';

export class SincronizarPasswordDto {
  // Mismas reglas que el registro (CrearUsuarioDto).
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
