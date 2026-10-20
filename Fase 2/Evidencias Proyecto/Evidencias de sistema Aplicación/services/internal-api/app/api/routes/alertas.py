import psycopg
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.db import get_db
from app.dependencies.auth import UsuarioSesion, usuario_actual
from app.schemas.alertas import Alerta, AlertaCrear
from app.services import alertas

router = APIRouter(prefix="/alertas", tags=["Alertas de emergencia"])


@router.post("", response_model=Alerta, status_code=201, summary="Registrar una alerta (SOS)")
def crear_alerta(
    datos: AlertaCrear,
    usuario: UsuarioSesion = Depends(usuario_actual),
    db: psycopg.Connection = Depends(get_db),
):
    msj_id = None
    if datos.mensaje is None:
        msj_id = alertas.mensaje_por_defecto(db, usuario.id)
        if msj_id is None:
            raise HTTPException(400, "Escribe un mensaje: no tienes un mensaje de emergencia personalizado")
    return alertas.crear(db, usuario.id, datos.ubicacion, datos.mensaje, msj_id)


@router.get("", response_model=list[Alerta], summary="Historial de alertas")
def listar_alertas(
    usuario_id: int | None = Query(None, description="Solo ADMINISTRADOR o SOPORTE: filtra por usuario."),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    usuario: UsuarioSesion = Depends(usuario_actual),
    db: psycopg.Connection = Depends(get_db),
):
    # Un usuario común solo ve las suyas; el personal ve todas o las de un usuario.
    filtro = usuario_id if usuario.es_staff else usuario.id
    return alertas.listar(db, filtro, limit, offset)


@router.get("/{alerta_id}", response_model=Alerta, summary="Detalle de una alerta")
def obtener_alerta(
    alerta_id: int,
    usuario: UsuarioSesion = Depends(usuario_actual),
    db: psycopg.Connection = Depends(get_db),
):
    alerta = alertas.obtener(db, alerta_id)
    # 404 también para alertas ajenas: no revela que existen.
    if not alerta or (alerta["usuario_id"] != usuario.id and not usuario.es_staff):
        raise HTTPException(404, "La alerta no existe")
    return alerta
