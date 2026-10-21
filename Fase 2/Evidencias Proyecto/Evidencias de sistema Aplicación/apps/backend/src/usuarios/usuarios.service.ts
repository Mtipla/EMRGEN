import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { transaction } from '../config/transaction';
import { Pin } from './pin.entity';
import { Usuario } from './usuarios.entity';

/** Límite estricto de cuentas apadrinadas (y de cupos) por cuenta principal. */
export const MAX_APADRINADOS = 5;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  // CREAR USUARIO PRINCIPAL
  async crearUsuarioPrincipal(datosUsuario: Partial<Usuario>): Promise<Usuario> {
    const existe = await this.usuarioRepository.findOneBy({ correo_usuario: datosUsuario.correo_usuario });
    if (existe) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    const nuevoUsuario = this.usuarioRepository.create({
      ...datosUsuario,
      rol_ID: 3, // Rol USUARIO
      estado_ID: 2, // Completa la configuración del PIN antes de habilitar acceso completo
      usuario_principal_ID: null,
    } as Usuario);

    return await this.usuarioRepository.save(nuevoUsuario);
  }

  // CREAR USUARIO APADRINADO
  async crearUsuarioApadrinado(idPadre: number, datos: { nombre_usuario: string; correo_usuario: string; password: string; estado_ID: 1 | 2; pin?: string }): Promise<Usuario> {
    if (!datos.correo_usuario || !datos.password || Buffer.byteLength(datos.password, 'utf8') > 72) throw new BadRequestException('Correo y contraseña propios requeridos; contraseña máximo 72 bytes');
    if (datos.estado_ID === 1 && !/^\d{4}$/.test(datos.pin ?? '')) throw new BadRequestException('El perfil completo requiere PIN propio de cuatro dígitos');
    if (datos.pin !== undefined && !/^\d{4}$/.test(datos.pin)) throw new BadRequestException('PIN inválido');
    const password = await bcrypt.hash(datos.password, 12);
    const pinHash = datos.pin ? await bcrypt.hash(datos.pin, 12) : undefined;
    return transaction(this.usuarioRepository.manager.connection, async (manager) => {
      const usuarios = manager.getRepository(Usuario);
      const padre = await usuarios.findOne({ where: { usuario_ID: idPadre }, lock: { mode: 'pessimistic_write' } });
      if (!padre) throw new NotFoundException('La cuenta principal no existe');
      if (padre.usuario_principal_ID !== null) throw new BadRequestException('Un apadrinado no puede apadrinar');
      const pin = pinHash ? await manager.save(Pin, manager.create(Pin, { pin_hash: pinHash })) : null;
      return usuarios.save(usuarios.create({ nombre_usuario: datos.nombre_usuario.trim(), correo_usuario: datos.correo_usuario.trim().toLowerCase(), contra_usuario: password,
        rol_ID: 3, estado_ID: datos.estado_ID, usuario_principal_ID: idPadre, PIN_ID: pin?.PIN_ID ?? null }));
    });
  }

  // OBTENER PERFIL Y SUS DEPENDIENTES
  async obtenerPerfilCompleto(idUsuario: number): Promise<any> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_ID: idUsuario });
    
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // Tipado explícito de la lista para resolver noImplicitAny
    let dependientes: Partial<Usuario>[] = [];

    if (usuario.usuario_principal_ID === null) {
      dependientes = await this.usuarioRepository.find({
        where: { usuario_principal_ID: idUsuario },
        select: {
          usuario_ID: true,
          nombre_usuario: true,
          prioridad_ID: true,
        },
      });
    }

    return {
      perfil: {
        usuario_ID: usuario.usuario_ID,
        nombre: usuario.nombre_usuario,
        correo: usuario.correo_usuario,
        es_principal: usuario.usuario_principal_ID === null,
      },
      cuentas_apadrinadas: dependientes,
    };
  }
}