"""Alertas sobre las tablas existentes ALERTA, UBICACION_ALERTA, DETALLE_ALERTA e HISTORIAL_ALERTA.

Una alerta = ubicación + detalle (que apunta a un USUARIO_MENSAJE_PERSONALIZADO) + una fila de
historial que registra el incidente (diagrama de secuencia "Generar Alerta").
"""

import psycopg

from app.core.db import siguiente_id

_SELECT = """
    SELECT a.alerta_id, a.usuario_id, u.ubicacion, m.mensaje
    FROM alerta a
    JOIN ubicacion_alerta u ON u.ubicacion_alerta_id = a.ubicacion_alerta_id
    JOIN detalle_alerta d ON d.detalle_alerta_id = a.detalle_alerta_id
    JOIN usuario_mensaje_personalizado m ON m.msj_personalizado_id = d.msj_personalizado_id
"""


def mensaje_por_defecto(conn: psycopg.Connection, usuario_id: int) -> int | None:
    fila = conn.execute(
        "SELECT msj_personalizado_id FROM usuario WHERE usuario_id = %s", (usuario_id,)
    ).fetchone()
    return fila["msj_personalizado_id"] if fila else None


def crear(conn: psycopg.Connection, usuario_id: int, ubicacion: str, mensaje: str | None, msj_id: int | None) -> dict:
    """Todo en la transacción de la petición: si un INSERT falla, no queda una alerta a medias."""
    if mensaje is not None:
        msj_id = siguiente_id(conn, "usuario_mensaje_personalizado", "msj_personalizado_id")
        conn.execute(
            "INSERT INTO usuario_mensaje_personalizado (msj_personalizado_id, mensaje) VALUES (%s, %s)",
            (msj_id, mensaje),
        )

    detalle_id = siguiente_id(conn, "detalle_alerta", "detalle_alerta_id")
    conn.execute(
        "INSERT INTO detalle_alerta (detalle_alerta_id, msj_personalizado_id) VALUES (%s, %s)",
        (detalle_id, msj_id),
    )
    ubicacion_id = siguiente_id(conn, "ubicacion_alerta", "ubicacion_alerta_id")
    conn.execute(
        "INSERT INTO ubicacion_alerta (ubicacion_alerta_id, ubicacion) VALUES (%s, %s)",
        (ubicacion_id, ubicacion),
    )
    alerta_id = siguiente_id(conn, "alerta", "alerta_id")
    conn.execute(
        "INSERT INTO alerta (alerta_id, ubicacion_alerta_id, detalle_alerta_id, usuario_id) VALUES (%s, %s, %s, %s)",
        (alerta_id, ubicacion_id, detalle_id, usuario_id),
    )
    historial_id = siguiente_id(conn, "historial_alerta", "historial_alerta_id")
    conn.execute(
        "INSERT INTO historial_alerta (historial_alerta_id, alerta_id, usuario_id, detalle_alerta_id) VALUES (%s, %s, %s, %s)",
        (historial_id, alerta_id, usuario_id, detalle_id),
    )
    return obtener(conn, alerta_id)


def listar(conn: psycopg.Connection, usuario_id: int | None, limit: int, offset: int) -> list[dict]:
    # ALERTA no tiene fecha: el ID creciente es el único orden cronológico disponible.
    return conn.execute(
        _SELECT + " WHERE %(u)s::int IS NULL OR a.usuario_id = %(u)s ORDER BY a.alerta_id DESC LIMIT %(l)s OFFSET %(o)s",
        {"u": usuario_id, "l": limit, "o": offset},
    ).fetchall()


def obtener(conn: psycopg.Connection, alerta_id: int) -> dict | None:
    return conn.execute(_SELECT + " WHERE a.alerta_id = %s", (alerta_id,)).fetchone()
