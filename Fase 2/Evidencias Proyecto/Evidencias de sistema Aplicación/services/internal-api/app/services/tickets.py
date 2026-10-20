"""Tickets de soporte sobre la tabla existente SOPORTE (+ CATEGORIA_SOPORTE y ESTADO_TICKET).

SOPORTE es la tabla con el ciclo completo del caso (descripción, estado, solución, categoría);
TICKET_SOPORTE no tiene estado ni relación con SOPORTE, así que no se usa.
En la BD real el estado es SOPORTE.estado_caso (texto con el nombre de ESTADO_TICKET), no una FK.
"""

import psycopg

from app.core.db import siguiente_id

_SELECT = """
    SELECT s.soporte_id AS ticket_id, s.usuario_id, s.desc_caso AS descripcion, s.estado_caso AS estado,
           s.solucion_caso AS solucion, s.categoria_soporte_id AS categoria_id, c.nombre_categoria AS categoria
    FROM soporte s
    JOIN categoria_soporte c ON c.categoria_soporte_id = s.categoria_soporte_id
"""


def categorias(conn: psycopg.Connection) -> list[dict]:
    return conn.execute(
        "SELECT categoria_soporte_id AS categoria_id, nombre_categoria AS nombre FROM categoria_soporte ORDER BY 1"
    ).fetchall()


def estados(conn: psycopg.Connection) -> list[dict]:
    return conn.execute(
        "SELECT estado_ticket_id AS estado_id, estado_ticket AS nombre FROM estado_ticket ORDER BY 1"
    ).fetchall()


def existe_categoria(conn: psycopg.Connection, categoria_id: int) -> bool:
    return conn.execute(
        "SELECT 1 FROM categoria_soporte WHERE categoria_soporte_id = %s", (categoria_id,)
    ).fetchone() is not None


def estado_canonico(conn: psycopg.Connection, nombre: str) -> str | None:
    """Nombre exacto del catálogo (sin distinguir mayúsculas), o None si no existe."""
    fila = conn.execute(
        "SELECT estado_ticket FROM estado_ticket WHERE UPPER(estado_ticket) = UPPER(%s)", (nombre,)
    ).fetchone()
    return fila["estado_ticket"] if fila else None


def estado_inicial(conn: psycopg.Connection) -> str | None:
    """El estado con el ID más bajo del catálogo (ABIERTO en sql/001_catalogos_soporte.sql)."""
    fila = conn.execute("SELECT estado_ticket FROM estado_ticket ORDER BY estado_ticket_id LIMIT 1").fetchone()
    return fila["estado_ticket"] if fila else None


def crear(conn: psycopg.Connection, usuario_id: int, descripcion: str, categoria_id: int, estado: str) -> dict:
    ticket_id = siguiente_id(conn, "soporte", "soporte_id")
    conn.execute(
        """INSERT INTO soporte (soporte_id, desc_caso, estado_caso, solucion_caso, usuario_id, categoria_soporte_id)
           VALUES (%s, %s, %s, '', %s, %s)""",
        (ticket_id, descripcion, estado, usuario_id, categoria_id),
    )
    return obtener(conn, ticket_id)


def listar(conn: psycopg.Connection, usuario_id: int | None, estado: str | None, limit: int, offset: int) -> list[dict]:
    return conn.execute(
        _SELECT
        + """ WHERE (%(u)s::int IS NULL OR s.usuario_id = %(u)s)
              AND (%(e)s::text IS NULL OR UPPER(s.estado_caso) = UPPER(%(e)s))
              ORDER BY s.soporte_id DESC LIMIT %(l)s OFFSET %(o)s""",
        {"u": usuario_id, "e": estado, "l": limit, "o": offset},
    ).fetchall()


def obtener(conn: psycopg.Connection, ticket_id: int) -> dict | None:
    return conn.execute(_SELECT + " WHERE s.soporte_id = %s", (ticket_id,)).fetchone()


def actualizar(conn: psycopg.Connection, ticket_id: int, estado: str | None, solucion: str | None) -> dict | None:
    conn.execute(
        """UPDATE soporte SET estado_caso = COALESCE(%s, estado_caso), solucion_caso = COALESCE(%s, solucion_caso)
           WHERE soporte_id = %s""",
        (estado, solucion, ticket_id),
    )
    return obtener(conn, ticket_id)
