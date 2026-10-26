from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class AlertaCrear(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    clave_idempotencia: UUID
    prioridad_id: int = Field(ge=1, le=4)
    ubicacion: str | None = Field(None, min_length=1, max_length=150)
    mensaje: str | None = Field(None, min_length=1, max_length=200)

class AlertaCerrar(BaseModel):
    model_config = ConfigDict(extra="forbid")
    pin: str = Field(pattern=r"^\d{4}$", strict=True)

class EstadoWhatsapp(BaseModel):
    pendientes: int
    enviados: int
    fallidos: int

class Alerta(BaseModel):
    alerta_id: int
    usuario_id: int | None
    ubicacion: str | None
    mensaje: str
    prioridad_id: int
    clave_idempotencia: UUID
    estado_alerta: str
    fecha_creacion: datetime
    fecha_cierre: datetime | None
    whatsapp: EstadoWhatsapp
    whatsapp_cierre: EstadoWhatsapp
