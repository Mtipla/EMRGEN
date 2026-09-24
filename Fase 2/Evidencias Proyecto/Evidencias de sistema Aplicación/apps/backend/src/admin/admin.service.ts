import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuarios.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
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

    // Aquí se debe insertar el registro en BITACORA_SISTEMA para cumplir con la auditoría
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

  private async registrarBitacora(idAdmin: number, accion: string) {
    // Lógica para insertar en la tabla BITACORA_SISTEMA conectando con idAdmin y aplicacion_ID = 3 (Escritorio)[cite: 1]
    console.log(`Auditoría Guardada: Admin ${idAdmin} - ${accion}`);
  }
}