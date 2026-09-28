import {
  ConflictException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarMiUsuarioDto } from './dto/actualizar-mi-usuario.dto';
import { LoginDto } from './dto/login.dto';

type UsuarioEnMemoria = {
  usuario_ID: number;
  nombre_usuario: string;
  correo_usuario: string;
  passwordHash: string;
};

export type UsuarioPublico = Omit<UsuarioEnMemoria, 'passwordHash'>;

@Injectable()
export class UsuariosService {
  // Este array se reinicia cada vez que se detiene el backend.
  private readonly usuarios: UsuarioEnMemoria[] = [];
  private siguienteId = 1;

  constructor(private readonly jwtService: JwtService) {}

  async crear(datos: CrearUsuarioDto): Promise<UsuarioPublico> {
    if (!this.passwordCabeEnBcrypt(datos.password)) {
      throw new BadRequestException('La contraseña supera el límite de 72 bytes');
    }
    const correo = datos.correo_usuario.trim().toLowerCase();
    if (this.usuarios.some((usuario) => usuario.correo_usuario === correo)) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    const usuario: UsuarioEnMemoria = {
      usuario_ID: this.siguienteId++,
      nombre_usuario: datos.nombre_usuario.trim(),
      correo_usuario: correo,
      passwordHash: await bcrypt.hash(datos.password, 12),
    };
    // Revisa de nuevo después del hash para evitar duplicados en registros simultáneos.
    if (this.usuarios.some((item) => item.correo_usuario === correo)) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    this.usuarios.push(usuario);
    console.log('Usuarios creados en memoria:', this.listar());
    return this.sinPassword(usuario);
  }

  listar(): UsuarioPublico[] {
    return this.usuarios.map((usuario) => this.sinPassword(usuario));
  }

  async actualizarPropio(
    id: number,
    cambios: ActualizarMiUsuarioDto,
  ): Promise<UsuarioPublico> {
    const usuario = this.usuarios.find((item) => item.usuario_ID === id);
    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario de la sesión');
    }
    if (!cambios.nombre_usuario && !cambios.correo_usuario) {
      throw new BadRequestException('Debes indicar el nombre o el correo a modificar');
    }

    const nuevoCorreo = cambios.correo_usuario?.trim().toLowerCase();
    if (
      nuevoCorreo &&
      this.usuarios.some(
        (item) => item.usuario_ID !== id && item.correo_usuario === nuevoCorreo,
      )
    ) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    if (cambios.nombre_usuario !== undefined) {
      usuario.nombre_usuario = cambios.nombre_usuario.trim();
    }
    if (nuevoCorreo) {
      usuario.correo_usuario = nuevoCorreo;
    }
    return this.sinPassword(usuario);
  }

  existe(id: number): boolean {
    return this.usuarios.some((usuario) => usuario.usuario_ID === id);
  }

  eliminar(id: number): UsuarioPublico {
    const indice = this.usuarios.findIndex((usuario) => usuario.usuario_ID === id);
    if (indice === -1) {
      throw new NotFoundException('No se encontró el usuario');
    }

    const [eliminado] = this.usuarios.splice(indice, 1);
    return this.sinPassword(eliminado);
  }

  async iniciarSesion(datos: LoginDto) {
    this.validarLongitudPassword(datos.password);
    const correo = datos.correo_usuario.trim().toLowerCase();
    const usuario = this.usuarios.find((item) => item.correo_usuario === correo);
    if (!usuario || !(await bcrypt.compare(datos.password, usuario.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const access_token = await this.jwtService.signAsync({
      sub: usuario.usuario_ID,
      email: usuario.correo_usuario,
    });
    return { access_token, usuario: this.sinPassword(usuario) };
  }

  private sinPassword(usuario: UsuarioEnMemoria): UsuarioPublico {
    const { passwordHash: _passwordHash, ...publico } = usuario;
    return publico;
  }

  private validarLongitudPassword(password: string): void {
    // bcrypt solo considera los primeros 72 bytes; rechazar más evita contraseñas ambiguas.
    if (!this.passwordCabeEnBcrypt(password)) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
  }

  private passwordCabeEnBcrypt(password: string): boolean {
    return Buffer.byteLength(password, 'utf8') <= 72;
  }
}
