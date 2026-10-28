import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { type ActorAuditoria, AuditoriaService } from '../auditoria/auditoria.service';
import {
  type CambiosAuditoria,
  ENTIDAD_AUDITADA,
  TIPO_ACCION,
  type ValorAuditado,
} from '../auditoria/bitacora.entity';
import { codigoPostgres, PG_FOREIGN_KEY_VIOLATION } from '../config/postgres-error';
import { ActualizarMiUsuarioDto } from '../login/dto/actualizar-mi-usuario.dto';
import { CrearUsuarioDto } from '../login/dto/crear-usuario.dto';
import { LoginService } from '../login/login.service';
import { ROL } from '../login/roles.decorator';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import { GuardarPlanDto } from './dto/guardar-plan.dto';
import { ActualizarTrabajadorDto } from './dto/actualizar-trabajador.dto';

export interface ContactoCuenta {
  contacto_emergencia_ID: number;
  nombre_contacto: string;
  num_emergencia: string;
}
export interface AlertaCuenta {
  alerta_id: number;
  estado_alerta: string;
  prioridad: string;
  mensaje: string;
  ubicacion: string | null;
  fecha_creacion: string;
  fecha_cierre: string | null;
}
export type UsuarioListado = Usuario & {
  numeros_vinculados: number;
  alertas_generadas: number;
};

/** Datos de una cuenta que el panel puede mostrar; nunca incluye el hash de la contraseña. */
export type ResumenUsuario = Pick<
  Usuario,
  'usuario_ID' | 'nombre_usuario' | 'correo_usuario' | 'rol_ID' | 'estado_ID'
>;

/** Todo lo que el backend gestiona de un usuario: su cuenta, su plan y sus apadrinados. */
export interface ExpedienteUsuario {
  usuario: Usuario;
  plan: (PlanUsuario & { cupos_ocupados: number; cupos_disponibles: number }) | null;
  apadrinados: Pick<Usuario, 'usuario_ID' | 'nombre_usuario' | 'correo_usuario' | 'estado_ID'>[];
  contactos: ContactoCuenta[];
  alertas: AlertaCuenta[];
}

/** Campos cuyo valor cambió, con su valor anterior y posterior (para la bitácora). */
function diferencias<C extends string>(
  antes: Record<C, ValorAuditado> | null,
  despues: Record<C, ValorAuditado>,
  campos: readonly C[],
): CambiosAuditoria {
  const cambios: CambiosAuditoria = {};
  for (const campo of campos) {
    const previo = antes?.[campo] ?? null;
    const posterior = despues[campo] ?? null;
    if (previo !== posterior) {
      cambios[campo] = { antes: previo, despues: posterior };
    }
  }
  return cambios;
}

// La bitácora existente permite seguir mostrando al trabajador tras quitarle SOPORTE.
// Su habilitación y sus permisos siempre se determinan por el rol vigente.
const FILTRO_TRABAJADOR = `u.usuario_principal_id IS NULL AND (
  u.rol_id = ${ROL.SOPORTE} OR (u.rol_id = ${ROL.USUARIO} AND EXISTS (
    SELECT 1 FROM bitacora_sistema b
    WHERE b.usuario_afectado_id = u.usuario_id
      AND b.entidad_afectada = 'USUARIO' AND b.resultado = 'EXITOSA'
      AND b.rol_actor_id = ${ROL.ADMINISTRADOR}
      AND (b.cambios #>> '{rol_ID,antes}' = '${ROL.SOPORTE}'
        OR b.cambios #>> '{rol_ID,despues}' = '${ROL.SOPORTE}')
  ))
)`;

// El actor requiere rol administrador y acceso completo (RolesGuard). El estado
// (ESTADO_USUARIO) del usuario gestionado nunca decide si una operación está permitida.
// Toda operación sobre un usuario pasa por AuditoriaService.auditar: se aplica junto con
// su entrada de bitácora o no se aplica.
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(PlanUsuario)
    private planUsuarioRepository: Repository<PlanUsuario>,

    private readonly auditoriaService: AuditoriaService,

    private readonly loginService: LoginService,
  ) {}

  // READ: Obtener todos los usuarios del sistema para la tabla del panel Electron
  async listarUsuarios(): Promise<UsuarioListado[]> {
    return this.usuarioRepository.query(`
      SELECT u.usuario_id AS "usuario_ID", u.nombre_usuario,
        u.correo_usuario, u.rol_id AS "rol_ID", u.estado_id AS "estado_ID",
        u.usuario_principal_id AS "usuario_principal_ID",
        (SELECT count(*)::int FROM contacto_emergencia c WHERE c.usuario_id=u.usuario_id) AS numeros_vinculados,
        (SELECT count(*)::int FROM alerta a WHERE a.usuario_id=u.usuario_id) AS alertas_generadas
      FROM usuario u ORDER BY u.usuario_id
    `);
  }

  async listarPlanes(): Promise<{ plan_ID: number; nombre_plan: string }[]> {
    return this.usuarioRepository.query('SELECT plan_id AS "plan_ID", nombre_plan FROM plan ORDER BY plan_id');
  }

  async listarTrabajadores(): Promise<ResumenUsuario[]> {
    return this.usuarioRepository.query(`
      SELECT u.usuario_id AS "usuario_ID", u.nombre_usuario, u.correo_usuario,
        u.rol_id AS "rol_ID", u.estado_id AS "estado_ID"
      FROM usuario u WHERE ${FILTRO_TRABAJADOR} ORDER BY u.usuario_id
    `);
  }

  private async esTrabajadorRegistrado(usuario: Usuario, manager: EntityManager): Promise<boolean> {
    if (usuario.usuario_principal_ID !== null) return false;
    if (usuario.rol_ID === ROL.SOPORTE) return true;
    if (usuario.rol_ID !== ROL.USUARIO) return false;
    const filas: unknown[] = await manager.query(`
      SELECT 1 FROM usuario u WHERE u.usuario_id = $1 AND ${FILTRO_TRABAJADOR}
    `, [usuario.usuario_ID]);
    return filas.length > 0;
  }

  // READ: Expediente de un usuario (cuenta, plan y apadrinados). La consulta queda registrada.
  async obtenerExpedienteUsuario(idUsuario: number, actor: ActorAuditoria): Promise<ExpedienteUsuario> {
    return this.auditoriaService.auditar(
      {
        actor,
        accion: `Consulta del expediente del usuario ${idUsuario}`,
        tipo: TIPO_ACCION.CONSULTA,
        entidad: ENTIDAD_AUDITADA.USUARIO,
        usuario_afectado_ID: idUsuario,
      },
      async (manager) => {
        const usuarios = manager.getRepository(Usuario);
        // contra_usuario tiene select: false, así que el hash no sale de la BD.
        const usuario = await usuarios.findOneBy({ usuario_ID: idUsuario });
        if (!usuario) {
          throw new NotFoundException('El usuario no existe en la base de datos');
        }

        const plan = await manager
          .getRepository(PlanUsuario)
          .findOne({ where: { usuario_ID: idUsuario } });
        const apadrinados = await usuarios.find({
          where: { usuario_principal_ID: idUsuario },
          select: { usuario_ID: true, nombre_usuario: true, correo_usuario: true, estado_ID: true },
          order: { usuario_ID: 'ASC' },
        });
        const contactos: ContactoCuenta[] = await manager.query(`
          SELECT contacto_emergencia_id AS "contacto_emergencia_ID", nombre_contacto, num_emergencia
          FROM contacto_emergencia WHERE usuario_id=$1 ORDER BY contacto_emergencia_id
        `, [idUsuario]);
        const alertas: AlertaCuenta[] = await manager.query(`
          SELECT a.alerta_id, a.estado_alerta, p.tipo_prioridad AS prioridad, d.texto_mensaje AS mensaje,
            l.ubicacion, a.fecha_creacion, a.fecha_cierre
          FROM alerta a JOIN prioridad p USING(prioridad_id)
          JOIN detalle_alerta d USING(detalle_alerta_id)
          LEFT JOIN ubicacion_alerta l USING(ubicacion_alerta_id)
          WHERE a.usuario_id=$1 ORDER BY a.fecha_creacion DESC, a.alerta_id DESC
        `, [idUsuario]);
        return { valor: { usuario, plan: plan && { ...plan, cupos_ocupados: apadrinados.length, cupos_disponibles: plan.cupos_apadrinados_adq - apadrinados.length }, apadrinados, contactos, alertas } };
      },
    );
  }

  // UPDATE: Datos personales y de contacto (nombre y correo), con las mismas reglas que
  // aplica LoginService cuando el usuario edita su propio perfil.
  async actualizarDatosUsuario(
    idUsuario: number,
    datos: ActualizarMiUsuarioDto,
    actor: ActorAuditoria,
  ): Promise<ResumenUsuario> {
    return this.auditoriaService.auditar(
      {
        actor,
        accion: `Modificación de los datos del usuario ${idUsuario}`,
        tipo: TIPO_ACCION.MODIFICACION,
        entidad: ENTIDAD_AUDITADA.USUARIO,
        usuario_afectado_ID: idUsuario,
      },
      async (manager) => {
        const usuarios = manager.getRepository(Usuario);
        const anterior = await usuarios.findOneBy({ usuario_ID: idUsuario });
        if (!anterior) {
          throw new NotFoundException('El usuario no existe en la base de datos');
        }
        if (idUsuario === actor.sub) {
          throw new BadRequestException('Modifica tu propia cuenta desde Modificar usuario');
        }
        if (anterior.rol_ID === ROL.ADMINISTRADOR) {
          throw new BadRequestException('El administrador modifica sus datos desde su propio perfil');
        }

        let actualizado: Usuario;
        try {
          actualizado = await this.loginService.aplicarCambiosDePerfil(usuarios, idUsuario, datos);
        } catch (error) {
          throw this.loginService.traducirCorreoDuplicado(error);
        }
        return {
          valor: this.resumir(actualizado),
          cambios: diferencias(anterior, actualizado, ['nombre_usuario', 'correo_usuario']),
        };
      },
    );
  }

  // UPDATE: Modificar el estado de una cuenta (Acceso completo / parcial).
  async cambiarEstadoUsuario(idUsuario: number, nuevoEstadoId: number, actor: ActorAuditoria): Promise<Usuario> {
    return this.auditoriaService.auditar(
      {
        actor,
        accion: `Cambio de estado del usuario ${idUsuario} a ${nuevoEstadoId}`,
        tipo: TIPO_ACCION.MODIFICACION,
        entidad: ENTIDAD_AUDITADA.USUARIO,
        usuario_afectado_ID: idUsuario,
      },
      async (manager) => {
        // Igual que al eliminar: un administrador no puede cambiar su propio nivel de acceso.
        if (idUsuario === actor.sub) {
          throw new BadRequestException('No puedes cambiar el estado de tu propia cuenta');
        }

        const usuarios = manager.getRepository(Usuario);
        const usuario = await usuarios.findOneBy({ usuario_ID: idUsuario });
        if (!usuario) {
          throw new NotFoundException('El usuario no existe en la base de datos');
        }

        // Solo las cuentas de usuario usan PIN; administradores y trabajadores no.
        if (nuevoEstadoId === 1 && usuario.rol_ID === ROL.USUARIO && usuario.PIN_ID === null) {
          throw new BadRequestException('Configura el PIN propio antes de habilitar acceso completo');
        }
        const estadoAnterior = usuario.estado_ID;
        usuario.estado_ID = nuevoEstadoId;
        return {
          valor: await usuarios.save(usuario),
          cambios: diferencias({ estado_ID: estadoAnterior }, usuario, ['estado_ID']),
        };
      },
    );
  }

  // CREATE/UPDATE: Asignar el plan de una cuenta principal o modificar el que tiene,
  // incluidos sus cupos de apadrinados (0 los quita).
  async guardarPlanUsuario(idUsuario: number, datos: GuardarPlanDto, actor: ActorAuditoria): Promise<PlanUsuario & { cupos_ocupados: number; cupos_disponibles: number }> {
    return this.auditoriaService.auditar(
      {
        actor,
        accion: `Plan y cupos del usuario ${idUsuario}`,
        tipo: TIPO_ACCION.MODIFICACION,
        entidad: ENTIDAD_AUDITADA.PLAN_USUARIO,
        usuario_afectado_ID: idUsuario,
      },
      async (manager) => {
        const usuarios = manager.getRepository(Usuario);
        // Bloqueo de fila: dos administradores no asignan el plan del mismo usuario a la vez.
        const usuario = await usuarios.findOne({
          where: { usuario_ID: idUsuario },
          lock: { mode: 'pessimistic_write' },
        });
        if (!usuario) {
          throw new NotFoundException('El usuario no existe en la base de datos');
        }
        if (usuario.usuario_principal_ID !== null) {
          throw new BadRequestException(
            'Los planes y cupos pertenecen a la cuenta principal, no al apadrinado',
          );
        }

        // Los cupos utilizados no se digitan: son los apadrinados que ya existen.
        const utilizados = await usuarios.countBy({ usuario_principal_ID: idUsuario });
        if (datos.cupos_apadrinados_adq < utilizados) {
          throw new BadRequestException(
            `El usuario ya utiliza ${utilizados} cupos; elimina apadrinados antes de reducirlos`,
          );
        }

        const planes = manager.getRepository(PlanUsuario);
        const existente = await planes.findOne({ where: { usuario_ID: idUsuario } });
        const nuevo = {
          plan_ID: datos.plan_ID,
          cupos_apadrinados_adq: datos.cupos_apadrinados_adq,
        };
        // Se calcula antes de guardar: `merge` modifica `existente`.
        const cambios = diferencias(existente, nuevo, [
          'plan_ID',
          'cupos_apadrinados_adq',
        ]);
        const plan = await planes.save(
          planes.merge(existente ?? planes.create({ usuario_ID: idUsuario }), nuevo),
        );

        return {
          valor: { ...plan, cupos_ocupados: utilizados, cupos_disponibles: plan.cupos_apadrinados_adq - utilizados },
          cambios,
          tipo: existente ? TIPO_ACCION.MODIFICACION : TIPO_ACCION.CREACION,
          accion: existente
            ? `Modificación del plan y cupos del usuario ${idUsuario}`
            : `Asignación de plan y cupos al usuario ${idUsuario}`,
        };
      },
    );
  }

  // DELETE: Eliminar un usuario apadrinado
  async eliminarUsuarioApadrinado(idUsuario: number, actor: ActorAuditoria): Promise<void> {
    return this.eliminarCuenta(idUsuario, actor, 'usuario apadrinado', (usuario) => {
      if (usuario.usuario_principal_ID === null) {
        throw new BadRequestException('No se puede eliminar una cuenta principal desde este método');
      }
    });
  }

  // DELETE: Eliminar un trabajador (rol SOPORTE)
  async eliminarTrabajadorSoporte(idUsuario: number, actor: ActorAuditoria): Promise<void> {
    return this.eliminarCuenta(idUsuario, actor, 'trabajador', (usuario) => {
      if (usuario.rol_ID !== ROL.SOPORTE) {
        throw new BadRequestException('La cuenta indicada no es un trabajador');
      }
    });
  }

  private async eliminarCuenta(
    idUsuario: number,
    actor: ActorAuditoria,
    tipoCuenta: string,
    validar: (usuario: Usuario) => void,
  ): Promise<void> {
    const accion = `Eliminación de ${tipoCuenta} ${idUsuario}`;
    return this.auditoriaService.auditar(
      {
        actor,
        accion,
        tipo: TIPO_ACCION.ELIMINACION,
        entidad: ENTIDAD_AUDITADA.USUARIO,
        usuario_afectado_ID: idUsuario,
      },
      async (manager) => {
        const usuarios = manager.getRepository(Usuario);
        const usuario = await usuarios.findOneBy({ usuario_ID: idUsuario });

        if (!usuario) {
          throw new NotFoundException('El usuario no existe en la base de datos');
        }
        validar(usuario);

        try {
          await this.auditoriaService.registrar(manager, { actor, accion, tipo: TIPO_ACCION.ELIMINACION, entidad: ENTIDAD_AUDITADA.USUARIO, usuario_afectado_ID: idUsuario });
          await usuarios.delete(idUsuario);
        } catch (error) {
          // Otras tablas (contactos, alertas, tickets...) referencian a la cuenta.
          if (codigoPostgres(error) === PG_FOREIGN_KEY_VIOLATION) {
            throw new ConflictException(
              `Resuelve los registros pendientes antes de eliminar el ${tipoCuenta}`,
            );
          }
          throw error;
        }
        return {
          valor: undefined,
          auditoriaRegistrada: true,
          // La cuenta deja de existir: la bitácora conserva quién era y de quién dependía.
          cambios: {
            nombre_usuario: { antes: usuario.nombre_usuario, despues: null },
            usuario_principal_ID: { antes: usuario.usuario_principal_ID, despues: null },
          },
        };
      },
    );
  }

  // CREATE: Creación y Asignación de Trabajadores (Gestión de Roles).
  // La contraseña se valida y hashea con las reglas del registro público (LoginService);
  // ni la respuesta ni la bitácora incluyen la contraseña o su hash.
  async crearTrabajadorSoporte(datosSoporte: CrearUsuarioDto, actor: ActorAuditoria): Promise<ResumenUsuario> {
    return this.auditoriaService.auditar(
      {
        actor,
        accion: 'Registro de nueva cuenta de SOPORTE',
        tipo: TIPO_ACCION.CREACION,
        entidad: ENTIDAD_AUDITADA.USUARIO,
      },
      async (manager) => {
        const cuenta = await this.loginService.prepararCuentaPrincipal(datosSoporte);
        const usuarios = manager.getRepository(Usuario);

        let usuarioGuardado: Usuario;
        try {
          // Se fuerza el rol SOPORTE; el personal no usa PIN, así que nace habilitado.
          usuarioGuardado = await usuarios.save(
            usuarios.create({ ...cuenta, rol_ID: ROL.SOPORTE, estado_ID: 1, usuario_principal_ID: null }),
          );
        } catch (error) {
          throw this.loginService.traducirCorreoDuplicado(error);
        }

        const resumen = this.resumir(usuarioGuardado);
        return {
          valor: resumen,
          usuario_afectado_ID: resumen.usuario_ID,
          accion: `Registro de nueva cuenta de SOPORTE: ${resumen.correo_usuario}`,
          cambios: diferencias(null, resumen, ['nombre_usuario', 'correo_usuario', 'rol_ID', 'estado_ID']),
        };
      },
    );
  }

  async actualizarTrabajador(id: number, datos: ActualizarTrabajadorDto, actor: ActorAuditoria): Promise<ResumenUsuario> {
    return this.auditoriaService.auditar({
      actor, accion: `Modificación del trabajador ${id}`, tipo: TIPO_ACCION.MODIFICACION,
      entidad: ENTIDAD_AUDITADA.USUARIO, usuario_afectado_ID: id,
    }, async (manager) => {
      if (id === actor.sub) throw new BadRequestException('No puedes modificar tu propia cuenta desde trabajadores');
      if (Object.values(datos).every((valor) => valor === undefined)) throw new BadRequestException('Indica los cambios del trabajador');
      const usuarios = manager.getRepository(Usuario);
      let usuario = await usuarios.findOne({ where: { usuario_ID: id }, lock: { mode: 'pessimistic_write' } });
      if (!usuario || !(await this.esTrabajadorRegistrado(usuario, manager))) {
        throw new NotFoundException('El trabajador no existe');
      }
      const anterior = { correo_usuario: usuario.correo_usuario, rol_ID: usuario.rol_ID, estado_ID: usuario.estado_ID };
      if (datos.correo_usuario !== undefined) {
        try {
          usuario = await this.loginService.aplicarCambiosDePerfil(usuarios, id, { correo_usuario: datos.correo_usuario });
        } catch (error) { throw this.loginService.traducirCorreoDuplicado(error); }
      }
      if (datos.PIN !== undefined) await this.loginService.guardarPin(manager, usuario, datos.PIN);
      if (datos.rol_ID !== undefined) usuario.rol_ID = datos.rol_ID;
      await usuarios.save(usuario);
      return {
        valor: this.resumir(usuario),
        cambios: diferencias(anterior, usuario, ['correo_usuario', 'rol_ID', 'estado_ID']),
      };
    });
  }

  async eliminarTrabajador(id: number, actor: ActorAuditoria): Promise<void> {
    return this.auditoriaService.auditar({
      actor, accion: `Eliminación del trabajador ${id}`, tipo: TIPO_ACCION.ELIMINACION,
      entidad: ENTIDAD_AUDITADA.USUARIO, usuario_afectado_ID: id,
    }, async (manager) => {
      if (id === actor.sub) throw new BadRequestException('No puedes eliminar tu propia cuenta');
      const usuarios = manager.getRepository(Usuario);
      const usuario = await usuarios.findOne({ where: { usuario_ID: id }, lock: { mode: 'pessimistic_write' } });
      if (!usuario || !(await this.esTrabajadorRegistrado(usuario, manager))) {
        throw new NotFoundException('El trabajador no existe');
      }
      await this.auditoriaService.registrar(manager, {
        actor, accion: `Eliminación del trabajador ${id}`, tipo: TIPO_ACCION.ELIMINACION,
        entidad: ENTIDAD_AUDITADA.USUARIO, usuario_afectado_ID: id,
        cambios: diferencias({ nombre_usuario: usuario.nombre_usuario, rol_ID: usuario.rol_ID },
          { nombre_usuario: null, rol_ID: null }, ['nombre_usuario', 'rol_ID']),
      });
      try { await usuarios.delete(id); }
      catch (error) {
        if (codigoPostgres(error) === PG_FOREIGN_KEY_VIOLATION) {
          throw new ConflictException('Resuelve las cuentas apadrinadas o compras pendientes antes de eliminar al trabajador');
        }
        throw error;
      }
      return { valor: undefined, auditoriaRegistrada: true };
    });
  }

  // READ: Visualización de Planes y Cupos
  async obtenerEstadoPlanUsuario(idUsuarioPrincipal: number): Promise<PlanUsuario & { cupos_ocupados: number; cupos_disponibles: number }> {
    // Extrae el control de cupos adquiridos y utilizados desde la tabla PLAN_USUARIO
    const plan = await this.planUsuarioRepository.findOne({
      where: { usuario_ID: idUsuarioPrincipal }
    });

    if (!plan) {
      throw new NotFoundException(`El usuario principal ${idUsuarioPrincipal} no cuenta con un registro de plan activo.`);
    }

    const ocupados = await this.usuarioRepository.countBy({ usuario_principal_ID: idUsuarioPrincipal });
    return { ...plan, cupos_ocupados: ocupados, cupos_disponibles: plan.cupos_apadrinados_adq - ocupados };
  }

  private resumir({ usuario_ID, nombre_usuario, correo_usuario, rol_ID, estado_ID }: Usuario): ResumenUsuario {
    return { usuario_ID, nombre_usuario, correo_usuario, rol_ID, estado_ID };
  }
}
