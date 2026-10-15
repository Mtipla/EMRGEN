import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { codigoPostgres, PG_FOREIGN_KEY_VIOLATION } from '../config/postgres-error';
import { ROL } from '../login/roles.decorator';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { Usuario } from '../usuarios/usuarios.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(PlanUsuario)
    private planUsuarioRepository: Repository<PlanUsuario>,

    private readonly auditoriaService: AuditoriaService,
  ) {}

  // READ: Obtener todos los usuarios del sistema para la tabla del panel Electron
  async listarUsuarios(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      select: {
        usuario_ID: true,
        nombre_usuario: true,
        correo_usuario: true,
        rol_ID: true,
        estado_ID: true
      }
    });
  }

  // UPDATE: Modificar el estado de una cuenta (Soft Delete / Bloqueo).
  // El cambio y su registro en la bitácora se guardan en una sola transacción.
  async cambiarEstadoUsuario(idUsuario: number, nuevoEstadoId: number, idAdmin: number): Promise<Usuario> {
    // Igual que al eliminar: un administrador no puede bloquearse a sí mismo.
    if (idUsuario === idAdmin) {
      throw new BadRequestException('No puedes cambiar el estado de tu propia cuenta');
    }

    return this.usuarioRepository.manager.transaction(async (manager) => {
      const usuarios = manager.getRepository(Usuario);
      const usuario = await usuarios.findOneBy({ usuario_ID: idUsuario });

      if (!usuario) {
        throw new NotFoundException('El usuario no existe en la base de datos');
      }

      usuario.estado_ID = nuevoEstadoId;
      const usuarioActualizado = await usuarios.save(usuario);

      await this.auditoriaService.registrar(manager, {
        usuario_ID: idAdmin,
        accion: `Cambio de estado del usuario ${idUsuario} a ${nuevoEstadoId}`,
      });

      return usuarioActualizado;
    });
  }

  // DELETE: Eliminar un usuario apadrinado (borrado y bitácora en una sola transacción)
  async eliminarUsuarioApadrinado(idUsuario: number, idAdmin: number): Promise<void> {
    try {
      await this.usuarioRepository.manager.transaction(async (manager) => {
        const usuarios = manager.getRepository(Usuario);
        const usuario = await usuarios.findOneBy({ usuario_ID: idUsuario });

        if (!usuario) {
          throw new NotFoundException('El usuario no existe en la base de datos');
        }
        if (usuario.usuario_principal_ID === null) {
          throw new BadRequestException('No se puede eliminar una cuenta principal desde este método');
        }

        await usuarios.delete(idUsuario);
        await this.auditoriaService.registrar(manager, {
          usuario_ID: idAdmin,
          accion: `Eliminación de usuario apadrinado ${idUsuario}`,
        });
      });
    } catch (error) {
      // Otras tablas (contactos, alertas, planes...) referencian al apadrinado.
      if (codigoPostgres(error) === PG_FOREIGN_KEY_VIOLATION) {
        throw new ConflictException(
          'El usuario apadrinado tiene registros asociados; bloquéalo en vez de eliminarlo',
        );
      }
      throw error;
    }
  }

  // CREATE: Creación y Asignación de Trabajadores (Gestión de Roles).
  // Sin ruta HTTP todavía: `contra_usuario` debe llegar ya hasheada con bcrypt.
  async crearTrabajadorSoporte(datosSoporte: Partial<Usuario>, idAdmin: number): Promise<Usuario> {
    return this.usuarioRepository.manager.transaction(async (manager) => {
      const usuarios = manager.getRepository(Usuario);
      // Se fuerza el rol SOPORTE para el personal interno, inicializado como ACTIVO
      const usuarioGuardado = await usuarios.save(
        usuarios.create({ ...datosSoporte, rol_ID: ROL.SOPORTE, estado_ID: 1 }),
      );

      await this.auditoriaService.registrar(manager, {
        usuario_ID: idAdmin,
        accion: `Registro de nueva cuenta de SOPORTE: ${usuarioGuardado.correo_usuario}`,
      });
      return usuarioGuardado;
    });
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
}
