import psycopg
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.db import get_db, transaction
from app.dependencies.auth import UsuarioSesion, solo_staff, usuario_actual
from app.schemas.tickets import Categoria, Estado, Ticket, TicketActualizar, TicketCrear
from app.services import tickets

router = APIRouter(prefix="/tickets-soporte", tags=["Tickets de soporte"])


# Las rutas fijas van antes de /{ticket_id}.
@router.get("/categorias", response_model=list[Categoria], summary="Catálogo CATEGORIA_SOPORTE")
def listar_categorias(_: UsuarioSesion = Depends(usuario_actual), db: psycopg.Connection = Depends(get_db)):
    return tickets.categorias(db)


@router.get("/estados", response_model=list[Estado], summary="Catálogo ESTADO_TICKET")
def listar_estados(_: UsuarioSesion = Depends(usuario_actual), db: psycopg.Connection = Depends(get_db)):
    return tickets.estados(db)


@router.post("", response_model=Ticket, status_code=201, summary="Abrir un ticket")
def crear_ticket(
    datos: TicketCrear,
    usuario: UsuarioSesion = Depends(usuario_actual),
    db: psycopg.Connection = Depends(get_db),
):
    if not tickets.existe_categoria(db, datos.categoria_id):
        raise HTTPException(400, "La categoría no existe")
    return transaction(db, lambda: tickets.crear(db, usuario.id, datos.descripcion, datos.categoria_id))


@router.get("", response_model=list[Ticket], summary="Listar tickets")
def listar_tickets(
    estado: str | None = Query(None, max_length=50),
    usuario_id: int | None = Query(None, description="Solo ADMINISTRADOR o SOPORTE: filtra por usuario."),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    usuario: UsuarioSesion = Depends(usuario_actual),
    db: psycopg.Connection = Depends(get_db),
):
    filtro = usuario_id if usuario.es_staff else usuario.id
    return tickets.listar(db, filtro, estado, limit, offset)


@router.get("/{ticket_id}", response_model=Ticket, summary="Detalle de un ticket")
def obtener_ticket(
    ticket_id: int,
    usuario: UsuarioSesion = Depends(usuario_actual),
    db: psycopg.Connection = Depends(get_db),
):
    ticket = tickets.obtener(db, ticket_id)
    if not ticket or (ticket["usuario_id"] != usuario.id and not usuario.es_staff):
        raise HTTPException(404, "El ticket no existe")
    return ticket


@router.patch("/{ticket_id}", response_model=Ticket, summary="Cambiar estado o solución (ADMINISTRADOR / SOPORTE)")
def actualizar_ticket(
    ticket_id: int,
    datos: TicketActualizar,
    usuario: UsuarioSesion = Depends(solo_staff),
    db: psycopg.Connection = Depends(get_db),
):
    return transaction(db, lambda: tickets.actualizar(
        db, ticket_id, datos.estado, datos.solucion, usuario.rol_id, usuario.id,
        datos.enviar_verificacion, datos.confirmar_cierre,
    ))
