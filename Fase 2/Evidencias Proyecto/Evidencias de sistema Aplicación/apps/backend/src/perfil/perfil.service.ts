import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { codigoPostgres } from '../config/postgres-error';
import { transaction } from '../config/transaction';
import { registrarActividadUsuario } from '../auditoria/actividad-usuario';
import type { UsuarioSesion } from '../login/jwt-auth.guard';
import { ACCESO } from '../login/roles.decorator';
import { cifrarFicha, descifrarFicha } from './cifrado-medico';
import { ActualizarPerfilDto, ContactoDto, FichaMedicaDto } from './dto/perfil.dto';

const PG_CHECK_VIOLATION = '23514';
const PG_UNIQUE_VIOLATION = '23505';
/** CA-03.1: c_contacto_emergencia_03 UNIQUE (usuario_id, num_emergencia). */
const NUMERO_DUPLICADO = 'Ese número ya está en tu lista de contactos de emergencia';

export type PerfilEmergencia = {
  prioridad_ID: number | null;
  mensaje: string | null;
  contactos: { contacto_emergencia_ID: number; nombre_contacto: string; num_emergencia: string; compartir_antecedentes: boolean }[];
  ficha_medica: FichaMedicaDto | null;
};

/**
 * Datos de emergencia de la propia cuenta (principal o apadrinado). Cada perfil tiene los suyos (RF7, RF9).
 * Los límites de 1 a 5 contactos los impone el trigger emergen_contactos; aquí solo se traduce su error.
 */
@Injectable()
export class PerfilService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async obtener(usuarioId: number, manager: EntityManager = this.dataSource.manager): Promise<PerfilEmergencia> {
    const [usuario] = await manager.query(
      `SELECT u.prioridad_id AS "prioridad_ID", m.mensaje
         FROM usuario u LEFT JOIN usuario_mensaje_personalizado m USING (msj_personalizado_id)
        WHERE u.usuario_id = $1`,
      [usuarioId],
    );
    if (!usuario) throw new NotFoundException('No se encontró la cuenta');
    const contactos = await manager.query(
      `SELECT contacto_emergencia_id AS "contacto_emergencia_ID", nombre_contacto, num_emergencia, compartir_antecedentes
         FROM contacto_emergencia WHERE usuario_id = $1 ORDER BY contacto_emergencia_id`,
      [usuarioId],
    );
    const [ficha] = await manager.query(
      `SELECT tipo_sangre, alergias, enfermedades_cronicas, medicamentos_actuales, discapacidad_presente, donante_organos
         FROM antecedente_medico WHERE usuario_id = $1`,
      [usuarioId],
    );
    return { ...usuario, contactos, ficha_medica: ficha ? descifrarFicha(usuarioId, ficha) : null };
  }

  async actualizar(usuario: UsuarioSesion, cambios: ActualizarPerfilDto): Promise<PerfilEmergencia> {
    this.exigirAccesoCompleto(usuario);
    const id = usuario.sub;
    return transaction(this.dataSource, async (manager) => {
      const [actual] = await manager.query(
        'SELECT msj_personalizado_id FROM usuario WHERE usuario_id = $1 FOR UPDATE',
        [id],
      );
      if (cambios.prioridad_ID !== undefined) {
        await manager.query('UPDATE usuario SET prioridad_id = $2 WHERE usuario_id = $1', [id, cambios.prioridad_ID]);
      }
      if (cambios.mensaje !== undefined) {
        // Fila nueva en vez de editar: las alertas ya emitidas siguen apuntando al mensaje que usaron.
        const texto = cambios.mensaje || null;
        const [nuevo] = texto
          ? await manager.query(
              'INSERT INTO usuario_mensaje_personalizado (mensaje) VALUES ($1) RETURNING msj_personalizado_id',
              [texto],
            )
          : [];
        await manager.query('UPDATE usuario SET msj_personalizado_id = $2 WHERE usuario_id = $1', [
          id,
          nuevo?.msj_personalizado_id ?? null,
        ]);
        if (actual.msj_personalizado_id) {
          // Misma limpieza que emergen_limpiar_credenciales_huerfanas.
          await manager.query(
            `DELETE FROM usuario_mensaje_personalizado WHERE msj_personalizado_id = $1
               AND NOT EXISTS (SELECT 1 FROM usuario WHERE msj_personalizado_id = $1)
               AND NOT EXISTS (SELECT 1 FROM detalle_alerta WHERE msj_personalizado_id = $1)`,
            [actual.msj_personalizado_id],
          );
        }
      }
      if (cambios.ficha_medica === null) {
        await manager.query('DELETE FROM antecedente_medico WHERE usuario_id = $1', [id]);
      } else if (cambios.ficha_medica) {
        // Cifrado dentro de la transacción: si falla, no se guarda nada (CA-11.1).
        const cifrada = cifrarFicha(id, cambios.ficha_medica);
        await manager.query(
          `INSERT INTO antecedente_medico (usuario_id, tipo_sangre, alergias, enfermedades_cronicas,
                                           medicamentos_actuales, discapacidad_presente, donante_organos)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (usuario_id) DO UPDATE SET tipo_sangre = EXCLUDED.tipo_sangre, alergias = EXCLUDED.alergias,
             enfermedades_cronicas = EXCLUDED.enfermedades_cronicas, medicamentos_actuales = EXCLUDED.medicamentos_actuales,
             discapacidad_presente = EXCLUDED.discapacidad_presente, donante_organos = EXCLUDED.donante_organos`,
          [id, ...cifrada],
        );
      }
      await registrarActividadUsuario(manager, usuario, 'Actualizó su perfil de emergencia');
      return this.obtener(id, manager);
    });
  }

  async crearContacto(usuario: UsuarioSesion, datos: ContactoDto): Promise<PerfilEmergencia> {
    this.exigirAccesoCompleto(usuario);
    return transaction(this.dataSource, async (manager) => {
      await this.conLimite(
        manager.query(
          'INSERT INTO contacto_emergencia (usuario_id, nombre_contacto, num_emergencia, compartir_antecedentes) VALUES ($1, $2, $3, $4)',
          [usuario.sub, datos.nombre_contacto, datos.num_emergencia, datos.compartir_antecedentes ?? true],
        ),
        'Máximo 5 contactos de emergencia por perfil',
      );
      await registrarActividadUsuario(manager, usuario, 'Agregó un contacto de emergencia', 'CREACION');
      return this.obtener(usuario.sub, manager);
    });
  }

  async actualizarContacto(usuario: UsuarioSesion, contactoId: number, datos: ContactoDto): Promise<PerfilEmergencia> {
    this.exigirAccesoCompleto(usuario);
    // CTE: TypeORM devuelve filas solo para SELECT, así se sabe si el contacto era de este usuario.
    return transaction(this.dataSource, async (manager) => {
      const [{ n }] = await this.conLimite(
        manager.query(
          `WITH c AS (UPDATE contacto_emergencia SET nombre_contacto = $3, num_emergencia = $4,
                     compartir_antecedentes = COALESCE($5, compartir_antecedentes)
                     WHERE contacto_emergencia_id = $1 AND usuario_id = $2 RETURNING 1)
         SELECT count(*)::int AS n FROM c`,
          [contactoId, usuario.sub, datos.nombre_contacto, datos.num_emergencia, datos.compartir_antecedentes ?? null],
        ),
        'Los datos del contacto no son válidos',
      );
      if (!n) throw new NotFoundException('No se encontró el contacto');
      await registrarActividadUsuario(manager, usuario, 'Actualizó un contacto de emergencia y sus permisos');
      return this.obtener(usuario.sub, manager);
    });
  }

  async eliminarContacto(usuario: UsuarioSesion, contactoId: number): Promise<PerfilEmergencia> {
    this.exigirAccesoCompleto(usuario);
    return transaction(this.dataSource, async (manager) => {
      const [{ n }] = await this.conLimite(
        manager.query(
          `WITH c AS (DELETE FROM contacto_emergencia WHERE contacto_emergencia_id = $1 AND usuario_id = $2 RETURNING 1)
         SELECT count(*)::int AS n FROM c`,
          [contactoId, usuario.sub],
        ),
        // Texto de CA-04.1.
        'Debe mantener al menos un contacto activo en su red de auxilio. Se recomienda editar el contacto activo',
      );
      if (!n) throw new NotFoundException('No se encontró el contacto');
      await registrarActividadUsuario(manager, usuario, 'Eliminó un contacto de emergencia', 'ELIMINACION');
      return this.obtener(usuario.sub, manager);
    });
  }

  /** Mismo criterio que PATCH /usuarios/me: el acceso parcial no modifica su perfil. */
  private exigirAccesoCompleto(usuario: UsuarioSesion) {
    if (usuario.estado_ID !== ACCESO.COMPLETO) {
      throw new ForbiddenException('El acceso parcial no permite editar el perfil');
    }
  }

  private async conLimite<T>(consulta: Promise<T>, mensaje: string): Promise<T> {
    try {
      return await consulta;
    } catch (error) {
      const codigo = codigoPostgres(error);
      if (codigo === PG_CHECK_VIOLATION) throw new ConflictException(mensaje);
      if (codigo === PG_UNIQUE_VIOLATION) throw new ConflictException(NUMERO_DUPLICADO);
      throw error;
    }
  }
}
