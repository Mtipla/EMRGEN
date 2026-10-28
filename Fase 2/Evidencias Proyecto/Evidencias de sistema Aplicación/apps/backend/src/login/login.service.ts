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
import { ActualizarMiUsuarioDto, ActualizarMiUsuarioPropioDto } from './dto/actualizar-mi-usuario.dto';
import { verificarPinPrincipal } from './pin-principal';
import { registrarActividadUsuario } from '../auditoria/actividad-usuario';
import { ROL } from './roles.decorator';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { LoginDto } from './dto/login.dto';

// rol_ID, estado_ID y usuario_principal_ID solo deciden la navegación del frontend;
// la autorización sigue en JwtAuthGuard + RolesGuard, que releen la BD en cada petición.
export type UsuarioPublico = Pick<
  Usuario,
  'usuario_ID' | 'nombre_usuario' | 'correo_usuario' | 'rol_ID' | 'estado_ID' | 'usuario_principal_ID'
> & {
  requiere_pin: boolean;
  /** Premium: plan propio o del principal. Solo en las respuestas de la propia sesión (login y /usuarios/me). */
  plan_efectivo?: boolean;
};

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

  /**
   * Revisa los datos del registro antes de crear la cuenta de Firebase, para no dejar cuentas
   * sueltas en Firebase cuando el backend las rechazaría. `crear` vuelve a validar todo.
   */
  async validarRegistro(datos: CrearUsuarioDto): Promise<{ valido: true }> {
    if (!this.passwordCabeEnBcrypt(datos.password)) {
      throw new BadRequestException('La contraseña supera el límite de 72 bytes');
    }
    // Mismo mensaje que `crear`: el registro ya informa duplicados (CA-01.1).
    if (await this.buscarPorCorreo(datos.correo_usuario.trim().toLowerCase())) {
      throw new ConflictException('El correo ingresado es inválido o ya se encuentra registrado');
    }
    return { valido: true };
  }

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
    // CA-01.1: el duplicado se informa antes de exigir la confirmación, para que la web lo
    // detecte apenas crea la cuenta de Firebase (las cuentas de apadrinados y soporte solo
    // existen en la BD). prepararCuentaPrincipal y el índice único lo vuelven a cubrir.
    if (await this.buscarPorCorreo(correo)) {
      throw new ConflictException('El correo ingresado es inválido o ya se encuentra registrado');
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
    // Modelo de perfiles: los apadrinados entran desde la sesión de su principal.
    if (usuario.usuario_principal_ID !== null) {
      throw new ForbiddenException('Ingresa con el correo de la cuenta principal y elige tu perfil');
    }
    let sesion = usuario;
    if (usuario.rol_ID === ROL.USUARIO && usuario.PIN_ID !== null) {
      const paso = await this.elegirPerfil(usuario, datos);
      if (!('usuario_ID' in paso)) return paso;
      sesion = paso;
    }

    const access_token = await this.jwtService.signAsync({
      sub: sesion.usuario_ID,
      email: sesion.correo_usuario,
    });
    const publico = await this.conPlan(sesion);
    await this.dataSource.query(
      'INSERT INTO acceso_aplicacion (usuario_id, aplicacion_id) VALUES ($1, $2)',
      [sesion.usuario_ID, APLICACION.WEB],
    );
    return { access_token, usuario: publico };
  }

  /**
   * Cuenta tipo Netflix: tras la contraseña de la principal se elige un perfil (la principal o
   * uno de sus apadrinados) y se abre solo con el PIN de ese perfil. Mismo contador y bloqueo de
   * 5 minutos que verificarPinPrincipal, en la fila PIN del perfil. Un PIN temporal (apadrinado con
   * acceso completo) solo deja entrar cambiándolo; el del parcial no es temporal y no se cambia.
   */
  private async elegirPerfil(principal: Usuario, datos: LoginDto) {
    const perfiles = await this.usuarioRepository.find({
      where: [{ usuario_ID: principal.usuario_ID }, { usuario_principal_ID: principal.usuario_ID }],
      order: { usuario_ID: 'ASC' },
    });
    if (datos.perfil_ID === undefined) {
      return {
        perfiles: perfiles.map((p) => ({
          usuario_ID: p.usuario_ID,
          nombre_usuario: p.nombre_usuario,
          tipo: p.usuario_principal_ID === null ? 'PRINCIPAL' : 'APADRINADO',
          tiene_pin: p.PIN_ID !== null,
        })),
      };
    }
    const perfil = perfiles.find((p) => p.usuario_ID === datos.perfil_ID);
    if (!perfil) throw new NotFoundException('No se encontró el perfil');
    if (perfil.PIN_ID === null) {
      throw new ConflictException('La cuenta principal aún no genera el PIN de este perfil');
    }
    if (!datos.PIN) throw new BadRequestException('Ingresa el PIN del perfil');
    await verificarPinPrincipal(this.dataSource, perfil.usuario_ID, datos.PIN);
    const pin = await this.dataSource.getRepository(Pin).findOneByOrFail({ PIN_ID: perfil.PIN_ID });
    if (!pin.pin_temporal) return perfil;
    if (!datos.PIN_nuevo) return { cambio_pin_requerido: true as const };
    if (datos.PIN_nuevo === datos.PIN) {
      throw new BadRequestException('El PIN nuevo debe ser distinto del PIN temporal');
    }
    const pinHash = await bcrypt.hash(datos.PIN_nuevo, BCRYPT_COSTO);
    await transaction(this.dataSource, async (manager) => {
      await manager.getRepository(Pin).update(pin.PIN_ID, { pin_hash: pinHash, pin_temporal: false });
      await registrarActividadUsuario(manager, { sub: perfil.usuario_ID, rol_ID: perfil.rol_ID }, 'Cambió su PIN de primer ingreso');
    });
    return perfil;
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
      await registrarActividadUsuario(manager, { sub: usuarioId, rol_ID: usuario.rol_ID }, 'Configuró su PIN de ingreso', 'CREACION');

      return { mensaje: 'PIN creado correctamente', requiere_pin: false };
    });
  }

  async obtenerPropio(usuarioId: number): Promise<UsuarioPublico> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: usuarioId });
    if (!usuario) {
      throw new NotFoundException('No se encontró la cuenta');
    }
    return this.conPlan(usuario);
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
    cambios: ActualizarMiUsuarioPropioDto,
  ): Promise<UsuarioPublico> {
    try {
      const user = await this.usuarioRepository.findOneBy({ usuario_ID: id });
      if (!user) throw new NotFoundException('No se encontró la cuenta');
      if (user.rol_ID === ROL.SOPORTE || user.rol_ID === ROL.ADMINISTRADOR) {
        const permitidos = user.rol_ID === ROL.SOPORTE
          ? ['nombre_usuario']
          : ['nombre_usuario', 'PIN'];
        if (Object.entries(cambios).some(([campo, valor]) => valor !== undefined && !permitidos.includes(campo))) {
          throw new ForbiddenException('El perfil del personal solo permite modificar sus campos autorizados');
        }
        if (user.estado_ID !== 1) throw new ForbiddenException('El acceso parcial no permite editar el perfil');
        return await transaction(this.dataSource, async (manager) => {
          const usuarios = manager.getRepository(Usuario);
          await usuarios.findOne({ where: { usuario_ID: id }, lock: { mode: 'pessimistic_write' } });
          const actualizado = await this.aplicarCambiosDePerfil(usuarios, id, cambios);
          if (cambios.PIN !== undefined) {
            await this.guardarPin(manager, actualizado, cambios.PIN);
          }
          await registrarActividadUsuario(manager, { sub: id, rol_ID: user.rol_ID }, 'Actualizó sus datos personales');
          return this.conPlan(actualizado);
        });
      }
      if (cambios.PIN !== undefined) throw new ForbiddenException('Esta ruta solo permite cambiar el PIN del administrador');
      if (user?.estado_ID !== 1) {
        // HU-10: un apadrinado parcial cambia sus datos solo con el PIN de su principal.
        if (!user?.usuario_principal_ID) throw new ForbiddenException('El acceso parcial no permite editar el perfil');
        if (!cambios.PIN_principal) {
          throw new ForbiddenException('Para modificar esta cuenta se necesita el PIN de la cuenta principal');
        }
        await verificarPinPrincipal(this.dataSource, user.usuario_principal_ID, cambios.PIN_principal);
      }
      return await transaction(this.dataSource, async (manager) => {
        const actualizado = await this.aplicarCambiosDePerfil(manager.getRepository(Usuario), id, cambios);
        await registrarActividadUsuario(manager, { sub: id, rol_ID: user.rol_ID }, 'Actualizó sus datos personales');
        return this.conPlan(actualizado);
      });
    } catch (error) {
      throw this.traducirCorreoDuplicado(error);
    }
  }

  /**
   * Recuperación de contraseña: Firebase envía el enlace y guarda la contraseña nueva; aquí se
   * copia a la BD, que es la que valida el login. Solo cuentas principales con acceso completo.
   */
  async sincronizarPasswordFirebase(firebaseUser: FirebaseAuthUser, password: string) {
    if (!this.passwordCabeEnBcrypt(password)) {
      throw new BadRequestException('La contraseña supera el límite de 72 bytes');
    }
    // Un token refrescado conserva auth_time: exigir un ingreso reciente evita reutilizar uno viejo.
    const ingresoReciente = Date.now() / 1000 - (firebaseUser.authTime ?? 0) < 5 * 60;
    if (!firebaseUser.emailVerified || !ingresoReciente || !firebaseUser.email) {
      throw new UnauthorizedException('Vuelve a iniciar sesión con tu nueva contraseña');
    }
    const usuario = await this.buscarPorCorreo(firebaseUser.email.trim().toLowerCase());
    if (!usuario || usuario.usuario_principal_ID !== null || usuario.estado_ID !== 1) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    const hash = await bcrypt.hash(password, BCRYPT_COSTO);
    await transaction(this.dataSource, async (manager) => {
      await manager.getRepository(Usuario).update(usuario.usuario_ID, { contra_usuario: hash });
      await registrarActividadUsuario(manager, { sub: usuario.usuario_ID, rol_ID: usuario.rol_ID }, 'Restableció su contraseña');
    });
    return { mensaje: 'Contraseña actualizada' };
  }

  /** Mismo criterio que actualizarPropio: el acceso parcial no cambia sus credenciales. */
  async cambiarPassword(id: number, actual: string, nueva: string) {
    if (!this.passwordCabeEnBcrypt(nueva)) {
      throw new BadRequestException('La contraseña supera el límite de 72 bytes');
    }
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.contra_usuario')
      .where('usuario.usuario_ID = :id', { id })
      .getOne();
    if (!usuario) throw new NotFoundException('No se encontró la cuenta');
    if (usuario.rol_ID === ROL.SOPORTE || usuario.rol_ID === ROL.ADMINISTRADOR) {
      throw new ForbiddenException('El perfil del personal no permite cambiar la contraseña');
    }
    if (!usuario.contra_usuario) {
      throw new ForbiddenException('Las cuentas apadrinadas usan la contraseña de la cuenta principal');
    }
    if (usuario.estado_ID !== 1) throw new ForbiddenException('El acceso parcial no permite cambiar la contraseña');
    if (!(await bcrypt.compare(actual, usuario.contra_usuario))) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }
    const hash = await bcrypt.hash(nueva, BCRYPT_COSTO);
    await transaction(this.dataSource, async (manager) => {
      await manager.getRepository(Usuario).update(id, { contra_usuario: hash });
      await registrarActividadUsuario(manager, { sub: id, rol_ID: usuario.rol_ID }, 'Cambió su contraseña');
    });
    return { mensaje: 'Contraseña actualizada' };
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
    if (!cambios.nombre_usuario && !cambios.correo_usuario && !(cambios as ActualizarMiUsuarioPropioDto).PIN) {
      throw new BadRequestException('Debes indicar los datos a modificar');
    }
    if (cambios.correo_usuario && usuario.usuario_principal_ID !== null) {
      throw new BadRequestException('Las cuentas apadrinadas no tienen correo propio');
    }

    const nuevoCorreo = cambios.correo_usuario?.trim().toLowerCase();
    if (nuevoCorreo && nuevoCorreo !== usuario.correo_usuario) {
      const otro = await this.buscarPorCorreo(nuevoCorreo);
      if (otro && otro.usuario_ID !== id) {
        throw new ConflictException('Ya existe una cuenta con ese correo');
      }
    }
    const campos: Partial<Usuario> = {};
    if (cambios.nombre_usuario !== undefined) {
      campos.nombre_usuario = cambios.nombre_usuario.trim();
    }
    if (nuevoCorreo) {
      campos.correo_usuario = nuevoCorreo;
    }
    // Actualiza solo el perfil: una edición concurrente nunca restaura un rol revocado.
    if (Object.keys(campos).length) await usuarios.update(id, campos);
    return usuarios.findOneByOrFail({ usuario_ID: id });
  }

  /** El PIN nunca se devuelve ni se incluye en los cambios de auditoría. */
  async guardarPin(manager: import('typeorm').EntityManager, usuario: Usuario, valor: string): Promise<void> {
    const repositorio = manager.getRepository(Pin);
    const pin = await repositorio.save(repositorio.create({
      ...(usuario.PIN_ID !== null && { PIN_ID: usuario.PIN_ID }),
      pin_hash: await bcrypt.hash(valor, BCRYPT_COSTO),
    }));
    // Un PIN nuevo completa la configuración inicial; renovar uno no cambia el acceso.
    if (usuario.PIN_ID === null) usuario.estado_ID = 1;
    usuario.PIN_ID = pin.PIN_ID;
    await manager.getRepository(Usuario).save(usuario);
    await manager.query('UPDATE pin SET intentos_fallidos=0, bloqueado_hasta=NULL WHERE pin_id=$1', [pin.PIN_ID]);
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
    const { usuario_ID, nombre_usuario, correo_usuario, rol_ID, estado_ID, usuario_principal_ID } = usuario;
    return {
      usuario_ID,
      nombre_usuario,
      correo_usuario,
      rol_ID,
      estado_ID,
      usuario_principal_ID,
      // Administradores y trabajadores no usan PIN.
      requiere_pin: usuario.rol_ID === ROL.USUARIO && usuario.PIN_ID === null && usuario.usuario_principal_ID === null,
    };
  }

  /** Misma regla que el SOS de internal-api: el apadrinado usa el plan de su principal. */
  private async conPlan(usuario: Usuario): Promise<UsuarioPublico> {
    const titular = usuario.usuario_principal_ID ?? usuario.usuario_ID;
    const filas: unknown[] = await this.dataSource.query(
      'SELECT 1 FROM plan_usuario WHERE usuario_id = $1',
      [titular],
    );
    return { ...this.sinPassword(usuario), plan_efectivo: filas.length > 0 };
  }

  private passwordCabeEnBcrypt(password: string): boolean {
    return Buffer.byteLength(password, 'utf8') <= 72;
  }
}
