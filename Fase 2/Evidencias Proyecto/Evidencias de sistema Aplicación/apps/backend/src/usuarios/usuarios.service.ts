import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuarios.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  // CREAR USUARIO PRINCIPAL
  async crearUsuarioPrincipal(datosUsuario: Partial<Usuario>): Promise<Usuario> {
    const existe = await this.usuarioRepository.findOneBy({ correo_usuario: datosUsuario.correo_usuario });
    if (existe && existe.usuario_principal_ID === null) {
      throw new BadRequestException('El correo ya está registrado como cuenta principal.');
    }

    const nuevoUsuario = this.usuarioRepository.create({
      ...datosUsuario,
      rol_ID: 3, // Rol USUARIO
      estado_ID: 1, // ACTIVO
      usuario_principal_ID: null,
    } as Usuario);

    return await this.usuarioRepository.save(nuevoUsuario);
  }

  // CREAR USUARIO APADRINADO
  async crearUsuarioApadrinado(idPadre: number, datosApadrinado: Partial<Usuario>): Promise<Usuario> {
    const padre = await this.usuarioRepository.findOneBy({ usuario_ID: idPadre });
    
    if (!padre) {
      throw new NotFoundException('La cuenta principal no existe.');
    }
    
    if (padre.usuario_principal_ID !== null) {
      throw new BadRequestException('Un usuario apadrinado no puede apadrinar a otras cuentas.');
    }

    // Validar límite estricto de 5 cuentas apadrinadas
    const cantidadApadrinados = await this.usuarioRepository.count({
      where: { usuario_principal_ID: idPadre }
    });

    if (cantidadApadrinados >= 5) {
      throw new BadRequestException('Ha alcanzado el límite máximo de 5 cuentas apadrinadas.');
    }

    // Crear el apadrinado vinculando el correo y la cuenta gestora
    const nuevoApadrinado = this.usuarioRepository.create({
      ...datosApadrinado,
      correo_usuario: padre.correo_usuario,
      suscripcion_ID: padre.suscripcion_ID,
      rol_ID: 3,
      estado_ID: 1,
      usuario_principal_ID: padre.usuario_ID,
    } as Usuario);

    return await this.usuarioRepository.save(nuevoApadrinado);
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