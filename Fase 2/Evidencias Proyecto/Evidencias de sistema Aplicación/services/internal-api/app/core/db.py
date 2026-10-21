from collections.abc import Callable, Iterator
from time import sleep
from typing import TypeVar
import psycopg
from fastapi import HTTPException
from psycopg.rows import dict_row
from app.core.config import settings

T = TypeVar("T")

def connect() -> psycopg.Connection:
    return psycopg.connect(host=settings.db_host, port=settings.db_port, user=settings.db_user,
        password=settings.db_password, dbname=settings.db_name, row_factory=dict_row,
        connect_timeout=5, autocommit=True)

def get_db() -> Iterator[psycopg.Connection]:
    try:
        conn = connect()
    except psycopg.OperationalError as exc:
        raise HTTPException(503, "Base de datos no disponible") from exc
    with conn:
        yield conn

def transaction(conn: psycopg.Connection, action: Callable[[], T]) -> T:
    """Commit antes de responder; reintenta la transacción completa, sin efectos externos."""
    for attempt in range(3):
        try:
            with conn.transaction():
                result = action()
            return result
        except psycopg.Error as exc:
            if exc.sqlstate not in ("40001", "40P01") or attempt == 2:
                raise
            sleep(0.025 * (2 ** attempt))
    raise AssertionError("unreachable")
