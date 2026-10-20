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
import { IsNull, Repository } from 'typeorm';
import { APLICACION } from '../auditoria/aplicacion.entity';
import { type ActorAuditoria, AuditoriaService } from '../auditoria/auditoria.service';
import { ENTIDAD_AUDITADA, TIPO_ACCION } from '../auditoria/bitacora.entity';
import {
  codigoPostgres,
  PG_FOREIGN_KEY_VIOLATION,
  PG_UNIQUE_VIOLATION,
} from '../config/postgres-error';
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
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async crear(datos: CrearUsuarioDto): Promise<UsuarioPublico> {
    const cuenta = await this.prepararCuentaPrincipal(datos);
    try {
      // Reglas de cuenta principal (rol USUARIO, estado ACTIVO) de UsuariosService.
      const usuario = await this.usuariosService.crearUsuarioPrincipal(cuenta);
      return this.sinPassword(usuario);
    } catch (error) {
      throw this.traducirCorreoDuplicado(error);
    }
  }

  /**
   * Valida y normaliza los datos de una cuenta principal nueva y hashea su contraseña.
   * La comparten el registro público y la creación de cuentas de SOPORTE (AdminService).
   */
  async prepararCuentaPrincipal(
    datos: CrearUsuarioDto,
  ): Promise<Pick<Usuario, 'nombre_usuario' | 'correo_usuario' | 'contra_usuario'>> {
    if (!this.passwordCabeEnBcrypt(datos.password)) {
      throw new BadRequestException('La contraseña supera el límite de 72 bytes');
    }
    const correo = datos.correo_usuario.trim().toLowerCase();
    if (await this.buscarPrincipalPorCorreo(correo)) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    return {
      nombre_usuario: datos.nombre_usuario.trim(),
      correo_usuario: correo,
      contra_usuario: await bcrypt.hash(datos.password, BCRYPT_COSTO),
    };
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
    try {
      return this.sinPassword(
        await this.aplicarCambiosDePerfil(this.usuarioRepository, id, cambios),
      );
    } catch (error) {
      throw this.traducirCorreoDuplicado(error);
    }
  }

  /**
   * Cambia nombre y/o correo con las reglas de la cuenta (correo único entre principales).
   * Recibe el repositorio para poder ejecutarse dentro de la transacción del llamador
   * (AdminService la usa junto con su entrada de bitácora).
   */
  async aplicarCambiosDePerfil(
    usuarios: Repository<Usuario>,
    id: number,
    cambios: ActualizarMiUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await usuarios.findOneBy({ usuario_ID: id });
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
    return usuarios.save(usuario);
  }

  /** Usuario vigente de una sesión: existe y no está bloqueado. */
  async buscarActivo(id: number): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: id });
    return usuario && usuario.estado_ID !== ESTADO_BLOQUEADO ? usuario : null;
  }

  /** Eliminación hecha por un administrador: el borrado y su bitácora van en una transacción. */
  async eliminar(id: number, actor: ActorAuditoria): Promise<UsuarioPublico> {
    return this.auditoriaService.auditar(
      {
        actor,
        accion: `Eliminación del usuario ${id}`,
        tipo: TIPO_ACCION.ELIMINACION,
        entidad: ENTIDAD_AUDITADA.USUARIO,
        usuario_afectado_ID: id,
        // DELETE /usuarios/:id es la ruta de administración que consume la web.
        aplicacion_ID: APLICACION.WEB,
      },
      async (manager) => {
        const usuarios = manager.getRepository(Usuario);
        const usuario = await usuarios.findOneBy({ usuario_ID: id });
        if (!usuario) {
          throw new NotFoundException('No se encontró el usuario');
        }
        try {
          await usuarios.delete(id);
        } catch (error) {
          // Otras tablas (apadrinados, bitácora, planes...) referencian al usuario.
          if (codigoPostgres(error) === PG_FOREIGN_KEY_VIOLATION) {
            throw new ConflictException(
              'El usuario tiene registros asociados; bloquéalo desde el panel de administración',
            );
          }
          throw error;
        }
        return {
          valor: this.sinPassword(usuario),
          cambios: {
            nombre_usuario: { antes: usuario.nombre_usuario, despues: null },
            correo_usuario: { antes: usuario.correo_usuario, despues: null },
            rol_ID: { antes: usuario.rol_ID, despues: null },
          },
        };
      },
    );
  }

  private buscarPrincipalPorCorreo(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOneBy({
      correo_usuario: correo,
      usuario_principal_ID: IsNull(),
    });
  }

  traducirCorreoDuplicado(error: unknown): unknown {
    // Índice único ux_usuario_correo_principal (dos registros simultáneos).
    return codigoPostgres(error) === PG_UNIQUE_VIOLATION
      ? new ConflictException('Ya existe una cuenta con ese correo')
      : error;
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
