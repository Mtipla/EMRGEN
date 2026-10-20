"""Pruebas contra el PostgreSQL real dentro de una transacción que se revierte al final.

No dejan datos en la BD. Si la BD no está disponible (docker compose apagado), se omiten.
"""

import time
from itertools import count

import jwt
import psycopg
import pytest
from fastapi.testclient import TestClient
from psycopg.rows import dict_row

from app.core.config import settings
from app.core.db import get_db
from app.main import app

_correos = count()


@pytest.fixture
def db():
    try:
        conn = psycopg.connect(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            dbname=settings.db_name,
            row_factory=dict_row,
            connect_timeout=3,
        )
    except psycopg.OperationalError:
        pytest.skip("PostgreSQL no disponible")
    app.dependency_overrides[get_db] = lambda: conn
    try:
        yield conn
    finally:
        app.dependency_overrides.clear()
        conn.rollback()
        conn.close()


@pytest.fixture
def client(db):
    return TestClient(app)


def token(usuario_id: int, **cambios) -> dict:
    """Cabecera con un token igual al que firma POST /usuarios/login de NestJS."""
    payload = {"sub": usuario_id, "email": "x@emergen.test", "iss": "emergen-api", "aud": "emergen-web",
               "exp": int(time.time()) + 3600} | cambios
    return {"Authorization": "Bearer " + jwt.encode(payload, settings.jwt_secret, algorithm="HS256")}


@pytest.fixture
def crear_usuario(db):
    def _crear(rol_id: int = 3, estado_id: int = 1) -> int:
        return db.execute(
            """INSERT INTO usuario (nombre_usuario, correo_usuario, contra_usuario, rol_id, estado_id)
               VALUES ('Prueba', %s, 'x', %s, %s) RETURNING usuario_id""",
            (f"pytest{next(_correos)}@emergen.test", rol_id, estado_id),
        ).fetchone()["usuario_id"]

    return _crear
