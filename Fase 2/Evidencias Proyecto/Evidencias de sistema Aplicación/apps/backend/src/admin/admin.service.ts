import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

/** Datos de una cuenta que el panel puede mostrar; nunca incluye el hash de la contraseña. */
export type ResumenUsuario = Pick<
  Usuario,
  'usuario_ID' | 'nombre_usuario' | 'correo_usuario' | 'rol_ID' | 'estado_ID'
>;

/** Todo lo que el backend gestiona de un usuario: su cuenta, su plan y sus apadrinados. */
export interface ExpedienteUsuario {
  usuario: Usuario;
  plan: PlanUsuario | null;
  apadrinados: Pick<Usuario, 'usuario_ID' | 'nombre_usuario' | 'estado_ID'>[];
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
    if (previo !== despues[campo]) {
      cambios[campo] = { antes: previo, despues: despues[campo] };
    }
  }
  return cambios;
}

// Las facultades del administrador dependen solo de su rol (RolesGuard). El estado
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
  async listarUsuarios(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      select: {
        usuario_ID: true,
        nombre_usuario: true,
        correo_usuario: true,
        rol_ID: true,
        estado_ID: true,
        usuario_principal_ID: true,
      },
      order: { usuario_ID: 'ASC' },
    });
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
          select: { usuario_ID: true, nombre_usuario: true, estado_ID: true },
          order: { usuario_ID: 'ASC' },
        });
        return { valor: { usuario, plan, apadrinados } };
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
        // Los apadrinados comparten el correo de su cuenta principal (ver init.sql).
        if (datos.correo_usuario && anterior.usuario_principal_ID !== null) {
          throw new BadRequestException(
            'El correo de un apadrinado es el de su cuenta principal; modifica la cuenta principal',
          );
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

  // UPDATE: Modificar el estado de una cuenta (Soft Delete / Bloqueo).
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
        // Igual que al eliminar: un administrador no puede bloquearse a sí mismo.
        if (idUsuario === actor.sub) {
          throw new BadRequestException('No puedes cambiar el estado de tu propia cuenta');
        }

        const usuarios = manager.getRepository(Usuario);
        const usuario = await usuarios.findOneBy({ usuario_ID: idUsuario });
        if (!usuario) {
          throw new NotFoundException('El usuario no existe en la base de datos');
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
  async guardarPlanUsuario(idUsuario: number, datos: GuardarPlanDto, actor: ActorAuditoria): Promise<PlanUsuario> {
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
          tiene_acceso_completo: datos.tiene_acceso_completo,
          cupos_apadrinados_adq: datos.cupos_apadrinados_adq,
          cupos_apadrinados_utili: utilizados,
        };
        // Se calcula antes de guardar: `merge` modifica `existente`.
        const cambios = diferencias(existente, nuevo, [
          'tiene_acceso_completo',
          'cupos_apadrinados_adq',
          'cupos_apadrinados_utili',
        ]);
        const plan = await planes.save(
          planes.merge(existente ?? planes.create({ usuario_ID: idUsuario }), nuevo),
        );

        return {
          valor: plan,
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
    return this.auditoriaService.auditar(
      {
        actor,
        accion: `Eliminación de usuario apadrinado ${idUsuario}`,
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
        if (usuario.usuario_principal_ID === null) {
          throw new BadRequestException('No se puede eliminar una cuenta principal desde este método');
        }

        try {
          await usuarios.delete(idUsuario);
        } catch (error) {
          // Otras tablas (contactos, alertas, planes...) referencian al apadrinado.
          if (codigoPostgres(error) === PG_FOREIGN_KEY_VIOLATION) {
            throw new ConflictException(
              'El usuario apadrinado tiene registros asociados; bloquéalo en vez de eliminarlo',
            );
          }
          throw error;
        }
        return {
          valor: undefined,
          // El usuario deja de existir: la bitácora conserva quién era y de quién dependía.
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
          // Se fuerza el rol SOPORTE para el personal interno, inicializado como ACTIVO
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

  // READ: Visualización de Planes y Cupos
  async obtenerEstadoPlanUsuario(idUsuarioPrincipal: number): Promise<PlanUsuario> {
    // Extrae el control de cupos adquiridos y utilizados desde la tabla PLAN_USUARIO
    const plan = await this.planUsuarioRepository.findOne({
      where: { usuario_ID: idUsuarioPrincipal }
    });

    if (!plan) {
      throw new NotFoundException(`El usuario principal ${idUsuarioPrincipal} no cuenta con un registro de plan activo.`);
    }

    return plan;
  }

  private resumir({ usuario_ID, nombre_usuario, correo_usuario, rol_ID, estado_ID }: Usuario): ResumenUsuario {
    return { usuario_ID, nombre_usuario, correo_usuario, rol_ID, estado_ID };
  }
}
