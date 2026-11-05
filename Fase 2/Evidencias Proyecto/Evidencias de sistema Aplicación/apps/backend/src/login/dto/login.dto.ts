import { IsEmail, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  correo_usuario!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;


  @IsOptional()
  @IsInt()
  perfil_ID?: number;


  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'El PIN debe tener exactamente 4 dígitos' })
  PIN?: string;

  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'El PIN nuevo debe tener exactamente 4 dígitos' })
  PIN_nuevo?: string;
}
