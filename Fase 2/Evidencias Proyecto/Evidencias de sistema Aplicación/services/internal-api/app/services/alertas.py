"""SOS atómico: historial normal en el servicio; borrado y revocación en triggers."""
import hashlib
import json
import psycopg
from fastapi import HTTPException
from app.core.config import settings
from app.core.pin import verify_pin
from app.schemas.alertas import AlertaCrear

_SELECT = """
 SELECT a.alerta_id,a.usuario_id,u.ubicacion,d.texto_mensaje AS mensaje,
        a.prioridad_id,a.clave_idempotencia,a.estado_alerta,a.fecha_creacion,a.fecha_cierre
 FROM alerta a LEFT JOIN ubicacion_alerta u USING(ubicacion_alerta_id)
 JOIN detalle_alerta d USING(detalle_alerta_id)
"""

def crear(conn: psycopg.Connection, usuario_id: int, datos: AlertaCrear) -> dict:
    user = conn.execute("SELECT * FROM usuario WHERE usuario_id=%s FOR UPDATE", (usuario_id,)).fetchone()
    if not user:
        raise HTTPException(401, "La cuenta ya no existe")
    fingerprint = hashlib.sha256(json.dumps(datos.model_dump(mode="json"), sort_keys=True).encode()).hexdigest()
    previous = conn.execute("SELECT * FROM alerta WHERE clave_idempotencia=%s", (datos.clave_idempotencia,)).fetchone()
    if previous:
        if previous["usuario_id"] != usuario_id:
            raise HTTPException(404, "Clave de solicitud no disponible")
        if previous["huella_solicitud"] != fingerprint:
            raise HTTPException(409, "La clave ya identifica una solicitud diferente")
        return obtener(conn, previous["alerta_id"])
    for row in conn.execute("SELECT * FROM alerta WHERE usuario_id=%s AND estado_alerta='ACTIVA' AND fecha_creacion<=clock_timestamp()-interval '24 hours' FOR UPDATE", (usuario_id,)).fetchall():
        _finalizar(conn, row)
    if conn.execute("SELECT 1 FROM alerta WHERE usuario_id=%s AND estado_alerta='ACTIVA'", (usuario_id,)).fetchone():
        raise HTTPException(409, "Ya existe una alerta activa")
    titular = user["usuario_principal_id"] or usuario_id
    if not conn.execute("SELECT 1 FROM plan_usuario WHERE usuario_id=%s", (titular,)).fetchone():
        raise HTTPException(409, "Se requiere un plan del principal para emitir SOS")
    if not conn.execute("SELECT 1 FROM contacto_emergencia WHERE usuario_id=%s", (usuario_id,)).fetchone():
        raise HTTPException(409, "Agrega al menos un contacto antes de emitir SOS")
    template = conn.execute("SELECT mensaje FROM usuario_mensaje_personalizado WHERE msj_personalizado_id=%s", (user["msj_personalizado_id"],)).fetchone()
    if user["estado_id"] == 2 and datos.mensaje is not None:
        raise HTTPException(403, "El acceso parcial usa el mensaje configurado")
    texto = datos.mensaje or (template["mensaje"] if template else settings.mensaje_predeterminado)
    detail = conn.execute("INSERT INTO detalle_alerta(msj_personalizado_id,texto_mensaje) VALUES (%s,%s) RETURNING detalle_alerta_id",
        (user["msj_personalizado_id"] if template and datos.mensaje is None else None, texto)).fetchone()["detalle_alerta_id"]
    location = None
    if datos.ubicacion is not None:
        location = conn.execute("INSERT INTO ubicacion_alerta(ubicacion) VALUES (%s) RETURNING ubicacion_alerta_id", (datos.ubicacion,)).fetchone()["ubicacion_alerta_id"]
    alert = conn.execute("""INSERT INTO alerta(usuario_id,detalle_alerta_id,ubicacion_alerta_id,prioridad_id,clave_idempotencia,huella_solicitud)
        VALUES (%s,%s,%s,%s,%s,%s) RETURNING *""", (usuario_id,detail,location,datos.prioridad_id,datos.clave_idempotencia,fingerprint)).fetchone()
    conn.execute("INSERT INTO historial_alerta(alerta_id,detalle_alerta_id,estado_actual,fecha_cambio_estado) VALUES (%s,%s,'ACTIVA',%s)", (alert["alerta_id"],detail,alert["fecha_creacion"]))
    return obtener(conn, alert["alerta_id"])

def _finalizar(conn: psycopg.Connection, row: dict) -> None:
    if row["estado_alerta"] != "ACTIVA":
        return
    closed = conn.execute("UPDATE alerta SET estado_alerta='FINALIZADA',fecha_cierre=GREATEST(clock_timestamp(),fecha_creacion) WHERE alerta_id=%s RETURNING fecha_cierre", (row["alerta_id"],)).fetchone()
    conn.execute("INSERT INTO historial_alerta(alerta_id,detalle_alerta_id,estado_anterior,estado_actual,fecha_cambio_estado) VALUES (%s,%s,'ACTIVA','FINALIZADA',%s)", (row["alerta_id"],row["detalle_alerta_id"],closed["fecha_cierre"]))

def cerrar(conn: psycopg.Connection, actor_id: int, alerta_id: int, pin: str) -> dict | HTTPException:
    """Devuelve errores PIN para confirmar contadores antes de responder HTTP."""
    ref = conn.execute("SELECT usuario_id FROM alerta WHERE alerta_id=%s", (alerta_id,)).fetchone()
    if not ref or not ref["usuario_id"]:
        raise HTTPException(404, "La alerta no existe")
    emitter = conn.execute("SELECT * FROM usuario WHERE usuario_id=%s FOR UPDATE", (ref["usuario_id"],)).fetchone()
    if not emitter or actor_id not in (emitter["usuario_id"], emitter["usuario_principal_id"]):
        raise HTTPException(404, "La alerta no existe")
    row = conn.execute("SELECT * FROM alerta WHERE alerta_id=%s FOR UPDATE", (alerta_id,)).fetchone()
    if row["estado_alerta"] != "ACTIVA":
        return obtener(conn, alerta_id)
    effective_id = emitter["usuario_principal_id"] if emitter["estado_id"] == 2 and emitter["usuario_principal_id"] else emitter["usuario_id"]
    credential = conn.execute("""SELECT p.*,clock_timestamp() AS ahora FROM pin p JOIN usuario u USING(pin_id)
        WHERE u.usuario_id=%s FOR UPDATE OF p""", (effective_id,)).fetchone()
    if not credential:
        return HTTPException(409, "Falta configurar el PIN efectivo; la alerta continúa activa")
    if credential["bloqueado_hasta"] and credential["bloqueado_hasta"] > credential["ahora"]:
        return HTTPException(429, "Límite de intentos PIN; vuelve a intentar después de 15 minutos")
    if not verify_pin(pin, credential["pin_hash"]):
        attempts = (0 if credential["bloqueado_hasta"] else credential["intentos_fallidos"]) + 1
        conn.execute("UPDATE pin SET intentos_fallidos=%s,bloqueado_hasta=CASE WHEN %s>=5 THEN clock_timestamp()+interval '15 minutes' END WHERE pin_id=%s", (attempts,attempts,credential["pin_id"]))
        return HTTPException(429 if attempts >= 5 else 403, "PIN incorrecto" if attempts < 5 else "Límite de intentos PIN; espera 15 minutos")
    conn.execute("UPDATE pin SET intentos_fallidos=0,bloqueado_hasta=NULL WHERE pin_id=%s", (credential["pin_id"],))
    _finalizar(conn, row)
    return obtener(conn, alerta_id)

def finalizar_vencidas(conn: psycopg.Connection) -> int:
    rows = conn.execute("SELECT * FROM alerta WHERE estado_alerta='ACTIVA' AND fecha_creacion<=clock_timestamp()-interval '24 hours' ORDER BY alerta_id FOR UPDATE SKIP LOCKED").fetchall()
    for row in rows:
        _finalizar(conn, row)
    return len(rows)

def listar(conn: psycopg.Connection, usuario_id: int | None, limit: int, offset: int) -> list[dict]:
    return conn.execute(_SELECT + " WHERE %(u)s::int IS NULL OR a.usuario_id=%(u)s ORDER BY a.fecha_creacion DESC,a.alerta_id DESC LIMIT %(l)s OFFSET %(o)s", {"u":usuario_id,"l":limit,"o":offset}).fetchall()

def obtener(conn: psycopg.Connection, alerta_id: int) -> dict | None:
    return conn.execute(_SELECT + " WHERE a.alerta_id=%s", (alerta_id,)).fetchone()
