import type { EntityManager } from 'typeorm';
import type { ActorAuditoria } from './auditoria.service';
import type { TipoAccion } from './bitacora.entity';
import { APLICACION } from './aplicacion.entity';

/** Guarda el evento junto con la operación, sin valores médicos ni credenciales. */
export async function registrarActividadUsuario(
  manager: EntityManager,
  actor: ActorAuditoria,
  accion: string,
  tipo: TipoAccion = 'MODIFICACION',
  afectado = actor.sub,
): Promise<void> {
  await manager.query(
    `INSERT INTO bitacora_sistema
      (usuario_id, usuario_afectado_id, rol_actor_id, aplicacion_id, accion_realizada, tipo_accion, entidad_afectada)
     VALUES ($1, $2, $3, $4, $5, $6, 'USUARIO')`,
    [actor.sub, afectado, actor.rol_ID, APLICACION.WEB, accion, tipo],
  );
}
