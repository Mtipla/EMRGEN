import psycopg
from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.db import get_db, transaction
from app.core.limite import LimiteVentana
from app.dependencies.auth import UsuarioSesion, solo_staff
from app.schemas.contacto import (
    Catalogo, MensajeContacto, MensajeContactoActualizar, MensajeContactoCrear, MensajeContactoCreado,
)
from app.services import contacto

router = APIRouter(prefix="/mensajes-contacto", tags=["Mensajes de contacto"])

# Rutas sin sesión: las usa el formulario de la web pública (visitantes).
RUTAS_PUBLICAS = {("/internal/v1/mensajes-contacto/tipos", "get"), ("/internal/v1/mensajes-contacto", "post")}


@router.get("/tipos", response_model=list[Catalogo], summary="Catálogo TIPO_CONTACTO (público)")
def listar_tipos(db: psycopg.Connection = Depends(get_db)):
    return contacto.tipos(db)


# Antispam por IP (además del límite por correo en el servicio): 5 envíos cada 15 minutos.
limite_por_ip = LimiteVentana(maximo=5, segundos=15 * 60)


@router.post("", response_model=MensajeContactoCreado, status_code=201,
             summary="Enviar un mensaje sin sesión (público; 429 al superar 5 por IP cada 15 min o 3 por correo cada hora)")
def crear_mensaje(datos: MensajeContactoCrear, request: Request, db: psycopg.Connection = Depends(get_db)):
    # shortcut: detrás de un proxy inverso client.host es la IP del proxy; leer X-Forwarded-For de un proxy confiable al desplegar.
    if not limite_por_ip.permitir(request.client.host if request.client else "desconocido"):
        raise HTTPException(429, "Enviaste demasiados mensajes seguidos. Inténtalo nuevamente en unos minutos.")
    # Solo devuelve el número: el visitante no puede consultar mensajes.
    return {"mensaje_contacto_id": transaction(db, lambda: contacto.crear(
        db, datos.nombre, datos.correo, datos.mensaje, datos.tipo_id))}


@router.get("/estados", response_model=list[Catalogo], summary="Catálogo ESTADO_CONTACTO")
def listar_estados(_: UsuarioSesion = Depends(solo_staff), db: psycopg.Connection = Depends(get_db)):
    return contacto.estados(db)


@router.get("", response_model=list[MensajeContacto], summary="Bandeja de mensajes (ADMINISTRADOR / SOPORTE)")
def listar_mensajes(
    estado: str | None = Query(None, max_length=50),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _: UsuarioSesion = Depends(solo_staff),
    db: psycopg.Connection = Depends(get_db),
):
    return contacto.listar(db, estado, limit, offset)


@router.get("/{mensaje_id}", response_model=MensajeContacto, summary="Detalle con sus respuestas (ADMINISTRADOR / SOPORTE)")
def obtener_mensaje(mensaje_id: int, _: UsuarioSesion = Depends(solo_staff), db: psycopg.Connection = Depends(get_db)):
    mensaje = contacto.obtener(db, mensaje_id)
    if not mensaje:
        raise HTTPException(404, "El mensaje no existe")
    return mensaje


@router.patch("/{mensaje_id}", response_model=MensajeContacto,
              summary="Responder y/o cambiar estado (ADMINISTRADOR / SOPORTE); responder lo deja REVISADO")
def actualizar_mensaje(
    mensaje_id: int,
    datos: MensajeContactoActualizar,
    usuario: UsuarioSesion = Depends(solo_staff),
    db: psycopg.Connection = Depends(get_db),
):
    return transaction(db, lambda: contacto.actualizar(db, mensaje_id, datos.estado, datos.respuesta, usuario.id))
