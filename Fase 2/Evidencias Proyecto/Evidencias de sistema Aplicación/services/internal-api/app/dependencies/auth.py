"""Misma sesión que el backend NestJS (apps/backend/src/login/jwt-auth.guard.ts).

Verifica el JWT HS256 que emite POST /usuarios/login y relee el usuario desde la BD en cada
petición: un usuario bloqueado o con rol cambiado pierde el acceso sin esperar a que venza el token.
"""

from dataclasses import dataclass

import jwt
import psycopg
from fastapi import Depends, Header, HTTPException

from app.core.config import settings
from app.core.db import get_db

# IDs fijos de ROL y ESTADO_USUARIO (init.sql; apps/backend/src/login/roles.decorator.ts).
ROL_ADMINISTRADOR = 1
ROL_SOPORTE = 2
ESTADO_BLOQUEADO = 3


@dataclass(frozen=True)
class UsuarioSesion:
    id: int
    email: str
    rol_id: int

    @property
    def es_staff(self) -> bool:
        return self.rol_id in (ROL_ADMINISTRADOR, ROL_SOPORTE)


def usuario_actual(
    authorization: str | None = Header(None),
    db: psycopg.Connection = Depends(get_db),
) -> UsuarioSesion:
    partes = (authorization or "").split()
    if len(partes) != 2 or partes[0].lower() != "bearer":
        raise HTTPException(401, "Debes iniciar sesión")
    if not settings.jwt_secret:
        raise HTTPException(503, "Autenticación no configurada: define JWT_SECRET en el archivo .env")

    try:
        payload = jwt.decode(
            partes[1],
            settings.jwt_secret,
            algorithms=["HS256"],
            issuer="emergen-api",
            audience="emergen-web",
            # NestJS firma `sub` como número; PyJWT por defecto exige texto.
            options={"verify_sub": False, "require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        raise HTTPException(401, "La sesión no es válida o expiró")

    sub = payload.get("sub")
    usuario = None
    if isinstance(sub, int) and not isinstance(sub, bool):
        usuario = db.execute(
            "SELECT usuario_id, correo_usuario, rol_id, estado_id FROM usuario WHERE usuario_id = %s",
            (sub,),
        ).fetchone()
    if not usuario or usuario["estado_id"] == ESTADO_BLOQUEADO:
        raise HTTPException(401, "La sesión no corresponde a un usuario activo")
    return UsuarioSesion(usuario["usuario_id"], usuario["correo_usuario"], usuario["rol_id"])


def solo_staff(usuario: UsuarioSesion = Depends(usuario_actual)) -> UsuarioSesion:
    if not usuario.es_staff:
        raise HTTPException(403, "No tienes permisos para esta acción")
    return usuario
