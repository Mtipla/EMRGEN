"""Formulario de contacto de la web pública: MENSAJE_CONTACTO con su tipo, estado y respuestas del personal."""
import psycopg
from fastapi import HTTPException

# Estado de todo mensaje nuevo y estado al que pasa cuando el personal responde.
ESTADO_INICIAL = "PENDIENTE"
ESTADO_RESPONDIDO = "REVISADO"
# Antispam persistente: mensajes por correo en la ventana (el límite por IP está en la ruta).
MAXIMO_POR_CORREO = 3
VENTANA_POR_CORREO_MIN = 60

_SELECT = """
 SELECT m.mensaje_contacto_id,m.nombre_remitente AS nombre,m.correo_remitente AS correo,m.mensaje,
        m.fecha_contacto AS fecha,t.nombre_tipo AS tipo,e.nombre_estado AS estado,
        COALESCE((SELECT json_agg(json_build_object('respuesta_id',r.respuesta_contacto_id,'texto',r.texto_respuesta,
                     'fecha',r.fecha_respuesta,'autor',u.nombre_usuario) ORDER BY r.fecha_respuesta,r.respuesta_contacto_id)
                  FROM respuesta_contacto r LEFT JOIN usuario u ON u.usuario_id=r.usuario_id
                  WHERE r.mensaje_contacto_id=m.mensaje_contacto_id),'[]') AS respuestas
 FROM mensaje_contacto m
 JOIN tipo_contacto t USING(tipo_contacto_id)
 JOIN estado_contacto e USING(estado_contacto_id)
"""

def tipos(conn: psycopg.Connection) -> list[dict]:
    return conn.execute("SELECT tipo_contacto_id AS id,nombre_tipo AS nombre FROM tipo_contacto ORDER BY 1").fetchall()

def estados(conn: psycopg.Connection) -> list[dict]:
    return conn.execute("SELECT estado_contacto_id AS id,nombre_estado AS nombre FROM estado_contacto ORDER BY 1").fetchall()

def _estado_id(conn: psycopg.Connection, nombre: str) -> int | None:
    row = conn.execute("SELECT estado_contacto_id FROM estado_contacto WHERE UPPER(nombre_estado)=UPPER(%s)", (nombre,)).fetchone()
    return row["estado_contacto_id"] if row else None

def crear(conn: psycopg.Connection, nombre: str, correo: str, mensaje: str, tipo_id: int) -> int:
    if not conn.execute("SELECT 1 FROM tipo_contacto WHERE tipo_contacto_id=%s", (tipo_id,)).fetchone():
        raise HTTPException(400, "El tipo de contacto no existe")
    # El lock serializa envíos simultáneos del mismo correo para que el conteo no se salte.
    conn.execute("SELECT pg_advisory_xact_lock(hashtext(lower(%s)))", (correo,))
    enviados = conn.execute("""SELECT count(*) AS n FROM mensaje_contacto
        WHERE lower(correo_remitente)=lower(%s) AND fecha_contacto > now() - make_interval(mins => %s)""",
        (correo, VENTANA_POR_CORREO_MIN)).fetchone()["n"]
    if enviados >= MAXIMO_POR_CORREO:
        raise HTTPException(429, "Ya recibimos varios mensajes desde este correo. Espera nuestra respuesta o inténtalo en una hora.")
    return conn.execute("""INSERT INTO mensaje_contacto(nombre_remitente,correo_remitente,mensaje,tipo_contacto_id,estado_contacto_id)
        VALUES (%s,%s,%s,%s,%s) RETURNING mensaje_contacto_id""",
        (nombre,correo,mensaje,tipo_id,_estado_id(conn, ESTADO_INICIAL))).fetchone()["mensaje_contacto_id"]

def listar(conn: psycopg.Connection, estado: str | None, limit: int, offset: int) -> list[dict]:
    return conn.execute(_SELECT + """ WHERE (%(e)s::text IS NULL OR UPPER(e.nombre_estado)=UPPER(%(e)s))
        ORDER BY m.fecha_contacto DESC,m.mensaje_contacto_id DESC LIMIT %(l)s OFFSET %(o)s""",
        {"e":estado,"l":limit,"o":offset}).fetchall()

def obtener(conn: psycopg.Connection, mensaje_id: int) -> dict | None:
    return conn.execute(_SELECT + " WHERE m.mensaje_contacto_id=%s", (mensaje_id,)).fetchone()

def actualizar(conn: psycopg.Connection, mensaje_id: int, estado: str | None, respuesta: str | None, usuario_id: int) -> dict:
    if not conn.execute("SELECT 1 FROM mensaje_contacto WHERE mensaje_contacto_id=%s FOR UPDATE", (mensaje_id,)).fetchone():
        raise HTTPException(404, "El mensaje no existe")
    if respuesta is not None:
        conn.execute("INSERT INTO respuesta_contacto(texto_respuesta,mensaje_contacto_id,usuario_id) VALUES (%s,%s,%s)",
                     (respuesta,mensaje_id,usuario_id))
        estado = estado or ESTADO_RESPONDIDO
    if estado is not None:
        estado_id = _estado_id(conn, estado)
        if estado_id is None:
            raise HTTPException(400, "El estado no existe en ESTADO_CONTACTO")
        conn.execute("UPDATE mensaje_contacto SET estado_contacto_id=%s WHERE mensaje_contacto_id=%s", (estado_id,mensaje_id))
    return obtener(conn, mensaje_id)
