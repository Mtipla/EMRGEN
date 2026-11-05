import {
  IsIn,
  IsEmail,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ROL } from '../../login/roles.decorator';

export class ActualizarTrabajadorDto {
  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsEmail()
  @MaxLength(100)
  correo_usuario?: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  @Matches(/^\d{4}$/, { message: 'El PIN debe tener exactamente 4 dígitos' })
  PIN?: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsIn([ROL.SOPORTE, ROL.USUARIO])
  rol_ID?: typeof ROL.SOPORTE | typeof ROL.USUARIO;
}
