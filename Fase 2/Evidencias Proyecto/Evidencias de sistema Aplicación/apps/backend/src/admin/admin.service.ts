import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuarios.entity';
// Entidades adicionales basadas en el modelo de base de datos de 30 tablas
import { BitacoraSistema } from '../auditoria/bitacora.entity';
import { PlanUsuario } from '../planes/plan-usuario.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    
    @InjectRepository(BitacoraSistema)
    private bitacoraRepository: Repository<BitacoraSistema>,

    @InjectRepository(PlanUsuario)
    private planUsuarioRepository: Repository<PlanUsuario>,
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

  // UPDATE: Modificar el estado de una cuenta (Soft Delete / Bloqueo)
  async cambiarEstadoUsuario(idUsuario: number, nuevoEstadoId: number, idAdmin: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: idUsuario });
    
    if (!usuario) {
      throw new NotFoundException('El usuario no existe en la base de datos');
    }

    usuario.estado_ID = nuevoEstadoId;
    const usuarioActualizado = await this.usuarioRepository.save(usuario);

    await this.registrarBitacora(idAdmin, `Cambio de estado del usuario ${idUsuario} a ${nuevoEstadoId}`);

    return usuarioActualizado;
  }

  // DELETE: Eliminar un usuario apadrinado (Ejemplo de función destructiva)
  async eliminarUsuarioApadrinado(idUsuario: number, idAdmin: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: idUsuario });
    
    if (usuario && usuario.usuario_principal_ID !== null) {
      await this.usuarioRepository.delete(idUsuario);
      await this.registrarBitacora(idAdmin, `Eliminación de usuario apadrinado ${idUsuario}`);
    } else {
      throw new Error('No se puede eliminar una cuenta principal desde este método');
    }
  }

  // ------------------------------------------------------------------
  // NUEVAS FUNCIONES INTEGRADAS
  // ------------------------------------------------------------------

  // CREATE: Creación y Asignación de Trabajadores (Gestión de Roles)
  async crearTrabajadorSoporte(datosSoporte: Partial<Usuario>, idAdmin: number): Promise<Usuario> {
    // Se fuerza la asignación del rol_ID 2 (SOPORTE) para el personal interno
    const nuevoTrabajador = this.usuarioRepository.create({
      ...datosSoporte,
      rol_ID: 2, 
      estado_ID: 1, // Se inicializa como ACTIVO[cite: 2]
    });

    const usuarioGuardado = await this.usuarioRepository.save(nuevoTrabajador);

    await this.registrarBitacora(idAdmin, `Registro de nueva cuenta de SOPORTE: ${usuarioGuardado.correo_usuario}`);
    return usuarioGuardado;
  }

  // READ: Lectura de la Bitácora de Auditoría
  async listarAuditoria(): Promise<BitacoraSistema[]> {
    // Retorna el historial de acciones críticas para el panel del Administrador
    return this.bitacoraRepository.find({
      order: { fecha_accion: 'DESC' }
    });
  }

  // READ: Visualización de Planes y Cupos
  async obtenerEstadoPlanUsuario(idUsuarioPrincipal: number): Promise<PlanUsuario> {
    // Extrae el control de cupos adquiridos y utilizados desde la tabla PLAN_USUARIO[cite: 2]
    const plan = await this.planUsuarioRepository.findOne({
      where: { usuario_ID: idUsuarioPrincipal }
    });

    if (!plan) {
      throw new NotFoundException(`El usuario principal ${idUsuarioPrincipal} no cuenta con un registro de plan activo.`);
    }

    return plan;
  }

  // ------------------------------------------------------------------

  private async registrarBitacora(idAdmin: number, accion: string) {
    // Inserción real en la tabla BITACORA_SISTEMA
    const nuevoRegistro = this.bitacoraRepository.create({
      usuario_ID: idAdmin,
      aplicacion_ID: 3, // Se asume 3 para la aplicación de escritorio Electron[cite: 1, 2]
      accion_realizada: accion,
      fecha_accion: new Date()
    });
    
    await this.bitacoraRepository.save(nuevoRegistro);
    console.log(`Auditoría Guardada: Admin ${idAdmin} - ${accion}`);
  }
}