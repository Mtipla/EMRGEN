from collections.abc import Callable, Iterator
from time import sleep
from typing import TypeVar
from threading import BoundedSemaphore
import psycopg
from fastapi import HTTPException, Request
from psycopg.rows import dict_row
from app.core.config import settings

T = TypeVar("T")
_regular = BoundedSemaphore(settings.db_regular_connections)
_sos = BoundedSemaphore(settings.db_sos_connections)

def connect() -> psycopg.Connection:
    return psycopg.connect(host=settings.db_host, port=settings.db_port, user=settings.db_user,
        password=settings.db_password, dbname=settings.db_name, row_factory=dict_row,
        connect_timeout=5, autocommit=True, sslmode=settings.db_sslmode,
        options=f"-c statement_timeout={settings.db_statement_timeout_ms}",
        **({"sslrootcert": settings.db_ssl_ca_file} if settings.db_ssl_ca_file else {}))

def get_db(request: Request) -> Iterator[psycopg.Connection]:
    emergency = request.url.path == '/internal/v1/alertas' or request.url.path.startswith('/internal/v1/alertas/')
    slots = _sos if emergency else _regular
    if not slots.acquire(blocking=False):
        raise HTTPException(503, "Capacidad temporal de esta operación agotada; intenta nuevamente")
    try:
        try:
            conn = connect()
        except psycopg.OperationalError as exc:
            raise HTTPException(503, "Base de datos no disponible") from exc
        with conn:
            yield conn
    finally:
        slots.release()

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
