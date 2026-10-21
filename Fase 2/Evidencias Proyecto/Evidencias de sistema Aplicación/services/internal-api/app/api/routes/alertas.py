import psycopg
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.db import get_db, transaction
from app.dependencies.auth import UsuarioSesion, usuario_actual
from app.schemas.alertas import Alerta, AlertaCrear, AlertaCerrar
from app.services import alertas

router = APIRouter(prefix="/alertas", tags=["Alertas de emergencia"])


@router.post("", response_model=Alerta, status_code=201, summary="Registrar una alerta (SOS)")
def crear_alerta(
    datos: AlertaCrear,
    usuario: UsuarioSesion = Depends(usuario_actual),
    db: psycopg.Connection = Depends(get_db),
):
    return transaction(db, lambda: alertas.crear(db, usuario.id, datos))


@router.post("/{alerta_id}/cerrar", response_model=Alerta, summary="Finalizar SOS con PIN efectivo")
def cerrar_alerta(alerta_id: int, datos: AlertaCerrar,
    usuario: UsuarioSesion = Depends(usuario_actual), db: psycopg.Connection = Depends(get_db)):
    result = transaction(db, lambda: alertas.cerrar(db, usuario.id, alerta_id, datos.pin))
    if isinstance(result, HTTPException):
        raise result
    return result


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
