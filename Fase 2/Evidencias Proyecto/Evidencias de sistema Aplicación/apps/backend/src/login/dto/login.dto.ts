import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  correo_usuario!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
