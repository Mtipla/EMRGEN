from fastapi import APIRouter

from .alertas import router as alertas_router
from .mensajes_contacto import router as contacto_router
from .tickets_soporte import router as tickets_router

# Prefijo común de todas las APIs internas de negocio.
internal_v1 = APIRouter(prefix="/internal/v1")
internal_v1.include_router(alertas_router)
internal_v1.include_router(tickets_router)
internal_v1.include_router(contacto_router)
