from collections.abc import Iterator

import psycopg
from fastapi import HTTPException
from psycopg import sql
from psycopg.rows import dict_row

from app.core.config import settings


def get_db() -> Iterator[psycopg.Connection]:
    """Una conexión y una transacción por petición: commit al terminar, rollback si hay error."""
    try:
        conn = psycopg.connect(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            dbname=settings.db_name,
            row_factory=dict_row,
            connect_timeout=5,
        )
    except psycopg.OperationalError as exc:
        raise HTTPException(503, "Base de datos no disponible") from exc
    # shortcut: conexión por petición, sin pool; usar psycopg_pool si la carga crece.
    with conn:
        yield conn


def siguiente_id(conn: psycopg.Connection, tabla: str, columna: str) -> int:
    """MAX+1 bajo bloqueo de tabla hasta el commit: dos inserciones simultáneas no repiten ID.

    shortcut: estas tablas de init.sql no son IDENTITY; cuando se agregue una migración como
    apps/backend/migrations/20261006_pin_identity.sql, reemplazar por el autoincremento.
    """
    conn.execute(sql.SQL("LOCK TABLE {} IN EXCLUSIVE MODE").format(sql.Identifier(tabla)))
    fila = conn.execute(
        sql.SQL("SELECT COALESCE(MAX({}), 0) + 1 AS id FROM {}").format(
            sql.Identifier(columna), sql.Identifier(tabla)
        )
    ).fetchone()
    return fila["id"]
