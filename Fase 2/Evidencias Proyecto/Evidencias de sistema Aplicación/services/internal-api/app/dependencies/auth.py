"""Misma sesión que el backend NestJS (apps/backend/src/login/jwt-auth.guard.ts).

Verifica el JWT HS256 que emite POST /usuarios/login y relee el usuario desde la BD en cada
petición: los permisos se actualizan sin esperar a que venza el token.
"""

from dataclasses import dataclass

import jwt
import psycopg
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.db import get_db

# IDs fijos de ROL y ESTADO_USUARIO (init.sql; apps/backend/src/login/roles.decorator.ts).
ROL_ADMINISTRADOR = 1
ROL_SOPORTE = 2

# Esquema de seguridad real: Swagger añade Authorization mediante Authorize.
# auto_error=False conserva la respuesta 401 propia cuando faltan credenciales.
sesion_bearer = HTTPBearer(
    scheme_name="SesionEMERGEN",
    bearerFormat="JWT",
    description="JWT de POST /usuarios/login en NestJS. Pega solo el token, sin el prefijo Bearer ni comillas.",
    auto_error=False,
)


@dataclass(frozen=True)
class UsuarioSesion:
    id: int
    email: str
    rol_id: int
    estado_id: int

    @property
    def es_staff(self) -> bool:
        return self.estado_id == 1 and self.rol_id in (ROL_ADMINISTRADOR, ROL_SOPORTE)


def usuario_actual(
    credentials: HTTPAuthorizationCredentials | None = Depends(sesion_bearer),
    db: psycopg.Connection = Depends(get_db),
) -> UsuarioSesion:
    if credentials is None:
        raise HTTPException(401, "Debes iniciar sesión")
    if not settings.jwt_secret:
        raise HTTPException(503, "Autenticación no configurada: define JWT_SECRET en el archivo .env")

    try:
        payload = jwt.decode(
            credentials.credentials,
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
    if not usuario:
        raise HTTPException(401, "La sesión no corresponde a un usuario activo")
    return UsuarioSesion(usuario["usuario_id"], usuario["correo_usuario"], usuario["rol_id"], usuario["estado_id"])


def solo_staff(usuario: UsuarioSesion = Depends(usuario_actual)) -> UsuarioSesion:
    if not usuario.es_staff:
        raise HTTPException(403, "No tienes permisos para esta acción")
    return usuario
