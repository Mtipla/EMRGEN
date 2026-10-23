import { IsBoolean, IsOptional, Matches } from 'class-validator';
import { CrearUsuarioDto } from '../../login/dto/crear-usuario.dto';

/** Cuenta apadrinada nueva: correo y contraseña propios (UsuariosService.crearUsuarioApadrinado). */
export class CrearApadrinadoDto extends CrearUsuarioDto {
  @IsBoolean()
  acceso_completo!: boolean;

  // Obligatorio con acceso completo; con acceso parcial el apadrinado usa el PIN de su principal.
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'El PIN debe tener exactamente 4 dígitos' })
  PIN?: string;
}
