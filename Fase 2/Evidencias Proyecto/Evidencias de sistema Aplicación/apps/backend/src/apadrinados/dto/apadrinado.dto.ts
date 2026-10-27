import { IsBoolean, Matches } from 'class-validator';
import { CrearUsuarioDto } from '../../login/dto/crear-usuario.dto';

/** Cuenta apadrinada nueva: correo y contraseña propios (UsuariosService.crearUsuarioApadrinado). */
export class CrearApadrinadoDto extends CrearUsuarioDto {
  @IsBoolean()
  acceso_completo!: boolean;

  // PIN del perfil: temporal con acceso completo (lo cambia al entrar); fijo con acceso parcial.
  @Matches(/^\d{4}$/, { message: 'El PIN debe tener exactamente 4 dígitos' })
  PIN!: string;
}
