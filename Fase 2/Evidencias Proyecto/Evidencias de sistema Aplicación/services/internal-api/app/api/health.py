from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.db import get_db

router = APIRouter(tags=["técnico"])


@router.get("/health/ready")
def readiness(conn=Depends(get_db)):
    """Solo lectura: conexión y columnas que utiliza la cola SOS."""
    result = {
        "status": "ready",
        "service": "emergen-internal-api",
        "environment": settings.environment,
        "deployment": settings.deployment_id,
        "database": "up",
    }
    try:
        conn.execute("SELECT e.tipo_notificacion,a.estado_alerta,c.compartir_antecedentes,s.trabajador_id,s.trabajador_nombre,s.trabajador_correo FROM envio_alerta e JOIN alerta a USING(alerta_id) LEFT JOIN contacto_emergencia c ON c.contacto_emergencia_id=e.contacto_emergencia_id LEFT JOIN soporte s ON false LIMIT 0")
    except Exception:
        return JSONResponse({**result, "status": "unavailable", "database": "down"}, status_code=503)
    return result
