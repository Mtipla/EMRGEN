import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, IsNull, QueryFailedError, Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuarios.entity';
import { Pin } from '../usuarios/pin.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ActualizarMiUsuarioDto } from './dto/actualizar-mi-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { ESTADO_BLOQUEADO } from './roles.decorator';

export type UsuarioPublico = Pick<
  Usuario,
  'usuario_ID' | 'nombre_usuario' | 'correo_usuario'
> & { requiere_pin: boolean };

const BCRYPT_COSTO = 12;
// Hash de relleno: si el correo no existe se compara igual, para que el tiempo de
// respuesta no revele qué correos están registrados.
const HASH_FICTICIO = bcrypt.hashSync('usuario-inexistente', BCRYPT_COSTO);

@Injectable()
export class LoginService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  async crear(datos: CrearUsuarioDto): Promise<UsuarioPublico> {
    if (!this.passwordCabeEnBcrypt(datos.password)) {
      throw new BadRequestException('La contraseña supera el límite de 72 bytes');
    }
    const correo = datos.correo_usuario.trim().toLowerCase();
    if (await this.buscarPrincipalPorCorreo(correo)) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    try {
      // Reglas de cuenta principal (rol USUARIO, estado ACTIVO) de UsuariosService.
      const usuario = await this.usuariosService.crearUsuarioPrincipal({
        nombre_usuario: datos.nombre_usuario.trim(),
        correo_usuario: correo,
        contra_usuario: await bcrypt.hash(datos.password, BCRYPT_COSTO),
      });
      return this.sinPassword(usuario);
    } catch (error) {
      throw this.traducirCorreoDuplicado(error);
    }
  }

  async iniciarSesion(datos: LoginDto) {
    if (!this.passwordCabeEnBcrypt(datos.password)) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    const correo = datos.correo_usuario.trim().toLowerCase();
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.contra_usuario')
      .where('usuario.correo_usuario = :correo', { correo })
      .andWhere('usuario.usuario_principal_ID IS NULL')
      .getOne();
    const passwordValida = await bcrypt.compare(
      datos.password,
      usuario?.contra_usuario ?? HASH_FICTICIO,
    );
    if (!usuario || !passwordValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    if (usuario.estado_ID === ESTADO_BLOQUEADO) {
      throw new ForbiddenException('La cuenta está bloqueada');
    }

    const access_token = await this.jwtService.signAsync({
      sub: usuario.usuario_ID,
      email: usuario.correo_usuario,
    });
    return { access_token, usuario: this.sinPassword(usuario) };
  }

  async crearPinInicial(usuarioId: number, pinIngresado: string) {
    return this.dataSource.transaction(async (manager) => {
      const usuarioRepository = manager.getRepository(Usuario);
      const pinRepository = manager.getRepository(Pin);
      const usuario = await usuarioRepository.findOne({
        where: { usuario_ID: usuarioId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!usuario || usuario.usuario_principal_ID !== null) {
        throw new NotFoundException('No se encontró la cuenta principal');
      }
      if (usuario.PIN_ID !== null) {
        throw new ConflictException('Esta cuenta ya tiene un PIN configurado');
      }

      const pin = pinRepository.create({ PIN: pinIngresado });
      const pinGuardado = await pinRepository.save(pin);
      usuario.PIN_ID = pinGuardado.PIN_ID;
      await usuarioRepository.save(usuario);

      return { mensaje: 'PIN creado correctamente', requiere_pin: false };
    });
  }

  async obtenerPropio(usuarioId: number): Promise<UsuarioPublico> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: usuarioId });
    if (!usuario) {
      throw new NotFoundException('No se encontró la cuenta');
    }
    if (usuario.estado_ID === ESTADO_BLOQUEADO) {
      throw new ForbiddenException('La cuenta está bloqueada');
    }
    return this.sinPassword(usuario);
  }

  async listar(): Promise<UsuarioPublico[]> {
    return this.usuarioRepository.find({
      select: {
        usuario_ID: true,
        nombre_usuario: true,
        correo_usuario: true,
        PIN_ID: true,
      },
      order: { usuario_ID: 'ASC' },
    }).then((usuarios) => usuarios.map((usuario) => this.sinPassword(usuario)));
  }

  async actualizarPropio(
    id: number,
    cambios: ActualizarMiUsuarioDto,
  ): Promise<UsuarioPublico> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: id });
    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario de la sesión');
    }
    if (!cambios.nombre_usuario && !cambios.correo_usuario) {
      throw new BadRequestException('Debes indicar el nombre o el correo a modificar');
    }

    const nuevoCorreo = cambios.correo_usuario?.trim().toLowerCase();
    if (nuevoCorreo && nuevoCorreo !== usuario.correo_usuario) {
      const otro = await this.buscarPrincipalPorCorreo(nuevoCorreo);
      if (otro && otro.usuario_ID !== id) {
        throw new ConflictException('Ya existe una cuenta con ese correo');
      }
    }
    if (cambios.nombre_usuario !== undefined) {
      usuario.nombre_usuario = cambios.nombre_usuario.trim();
    }
    if (nuevoCorreo) {
      usuario.correo_usuario = nuevoCorreo;
    }
    try {
      return this.sinPassword(await this.usuarioRepository.save(usuario));
    } catch (error) {
      throw this.traducirCorreoDuplicado(error);
    }
  }

  /** Usuario vigente de una sesión: existe y no está bloqueado. */
  async buscarActivo(id: number): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: id });
    return usuario && usuario.estado_ID !== ESTADO_BLOQUEADO ? usuario : null;
  }

  async eliminar(id: number): Promise<UsuarioPublico> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: id });
    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario');
    }
    try {
      await this.usuarioRepository.delete(id);
    } catch (error) {
      // 23503: otras tablas (apadrinados, bitácora, planes...) referencian al usuario.
      if (this.codigoPostgres(error) === '23503') {
        throw new ConflictException(
          'El usuario tiene registros asociados; bloquéalo desde el panel de administración',
        );
      }
      throw error;
    }
    return this.sinPassword(usuario);
  }

  private buscarPrincipalPorCorreo(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOneBy({
      correo_usuario: correo,
      usuario_principal_ID: IsNull(),
    });
  }

  private traducirCorreoDuplicado(error: unknown): unknown {
    // 23505: índice único ux_usuario_correo_principal (dos registros simultáneos).
    return this.codigoPostgres(error) === '23505'
      ? new ConflictException('Ya existe una cuenta con ese correo')
      : error;
  }

  private codigoPostgres(error: unknown): string | undefined {
    return error instanceof QueryFailedError
      ? (error.driverError as { code?: string }).code
      : undefined;
  }

  private sinPassword(usuario: Usuario): UsuarioPublico {
    const { usuario_ID, nombre_usuario, correo_usuario } = usuario;
    return {
      usuario_ID,
      nombre_usuario,
      correo_usuario,
      requiere_pin: usuario.PIN_ID === null,
    };
  }

  private passwordCabeEnBcrypt(password: string): boolean {
    return Buffer.byteLength(password, 'utf8') <= 72;
  }
}
