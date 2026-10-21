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
import type { FirebaseAuthUser } from '@repo/api-types';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { transaction } from '../config/transaction';
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
    private readonly dataSource: DataSource,
  ) {}

  async crear(
    datos: CrearUsuarioDto,
    firebaseUser: FirebaseAuthUser,
  ): Promise<UsuarioPublico> {
    const correo = datos.correo_usuario.trim().toLowerCase();
    // El ID token debe pertenecer a la cuenta de Firebase de ese mismo correo.
    if (firebaseUser.email?.toLowerCase() !== correo) {
      throw new ForbiddenException(
        'El correo no coincide con la cuenta de Firebase Authentication',
      );
    }
    // Solo se guarda en la BD cuando el usuario confirmó su correo con el enlace de Firebase.
    if (!firebaseUser.emailVerified) {
      throw new ForbiddenException('Debes confirmar tu correo antes de crear la cuenta');
    }
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
    if (await this.buscarPorCorreo(correo)) {
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
      .getOne();
    const passwordValida = await bcrypt.compare(
      datos.password,
      usuario?.contra_usuario ?? HASH_FICTICIO,
    );
    if (!usuario || !passwordValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const access_token = await this.jwtService.signAsync({
      sub: usuario.usuario_ID,
      email: usuario.correo_usuario,
    });
    return { access_token, usuario: this.sinPassword(usuario) };
  }

  async crearPinInicial(usuarioId: number, pinIngresado: string) {
    return transaction(this.dataSource, async (manager) => {
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

      const pin = pinRepository.create({ pin_hash: await bcrypt.hash(pinIngresado, BCRYPT_COSTO) });
      const pinGuardado = await pinRepository.save(pin);
      usuario.PIN_ID = pinGuardado.PIN_ID;
      usuario.estado_ID = 1;
      await usuarioRepository.save(usuario);

      return { mensaje: 'PIN creado correctamente', requiere_pin: false };
    });
  }

  async obtenerPropio(usuarioId: number): Promise<UsuarioPublico> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: usuarioId });
    if (!usuario) {
      throw new NotFoundException('No se encontró la cuenta');
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
        usuario_principal_ID: true,
      },
      order: { usuario_ID: 'ASC' },
    }).then((usuarios) => usuarios.map((usuario) => this.sinPassword(usuario)));
  }

  async actualizarPropio(
    id: number,
    cambios: ActualizarMiUsuarioDto,
  ): Promise<UsuarioPublico> {
    try {
      const user = await this.usuarioRepository.findOneBy({ usuario_ID: id });
      if (user?.estado_ID !== 1) throw new ForbiddenException('El acceso parcial no permite editar el perfil');
      return this.sinPassword(
        await this.aplicarCambiosDePerfil(this.usuarioRepository, id, cambios),
      );
    } catch (error) {
      throw this.traducirCorreoDuplicado(error);
    }
  }

  /**
   * Cambia nombre y/o correo con las reglas de la cuenta (correo único entre todas las cuentas).
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
      const otro = await this.buscarPorCorreo(nuevoCorreo);
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

  /** Usuario vigente de una sesión: existe y conserva sus permisos actuales. */
  async buscarActivo(id: number): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: id });
    return usuario ?? null;
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
          await this.auditoriaService.registrar(manager, { actor, accion: `Eliminación del usuario ${id}`, tipo: TIPO_ACCION.ELIMINACION, entidad: ENTIDAD_AUDITADA.USUARIO, usuario_afectado_ID: id, aplicacion_ID: APLICACION.WEB });
          await usuarios.delete(id);
        } catch (error) {
          // Otras tablas (apadrinados, bitácora, planes...) referencian al usuario.
          if (codigoPostgres(error) === PG_FOREIGN_KEY_VIOLATION) {
            throw new ConflictException(
              'Resuelve los dependientes o compras pendientes antes de eliminar la cuenta',
            );
          }
          throw error;
        }
        return {
          valor: this.sinPassword(usuario),
          auditoriaRegistrada: true,
          cambios: {
            nombre_usuario: { antes: usuario.nombre_usuario, despues: null },
            correo_usuario: { antes: usuario.correo_usuario, despues: null },
            rol_ID: { antes: usuario.rol_ID, despues: null },
          },
        };
      },
    );
  }

  private buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOneBy({
      correo_usuario: correo,
    });
  }

  traducirCorreoDuplicado(error: unknown): unknown {
    // Índice único ux_usuario_correo (dos registros simultáneos).
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
      requiere_pin: usuario.PIN_ID === null && usuario.usuario_principal_ID === null,
    };
  }

  private passwordCabeEnBcrypt(password: string): boolean {
    return Buffer.byteLength(password, 'utf8') <= 72;
  }
}
