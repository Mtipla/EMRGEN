from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


class Catalogo(BaseModel):
    id: int
    nombre: str


class MensajeContactoCrear(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    nombre: str = Field(min_length=1, max_length=100)
    # Mismo patrón que c_mensaje_contacto_02.
    correo: str = Field(max_length=100, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    mensaje: str = Field(min_length=1, max_length=500)
    tipo_id: int = Field(gt=0, description="ID de TIPO_CONTACTO (RECLAMO, SUGERENCIA o CONSULTA).")


class MensajeContactoCreado(BaseModel):
    mensaje_contacto_id: int


class MensajeContactoActualizar(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    estado: str | None = Field(None, min_length=1, max_length=50, description="Nombre de ESTADO_CONTACTO.")
    respuesta: str | None = Field(None, min_length=1, max_length=500, description="Crea una fila en RESPUESTA_CONTACTO.")

    @model_validator(mode="after")
    def al_menos_un_campo(self):
        if self.estado is None and self.respuesta is None:
            raise ValueError("indica estado o respuesta")
        return self


class RespuestaContacto(BaseModel):
    respuesta_id: int
    texto: str
    fecha: datetime
    autor: str | None = Field(description="Nombre del ADMINISTRADOR o SOPORTE que respondió; nulo si su cuenta ya no existe.")


class MensajeContacto(BaseModel):
    mensaje_contacto_id: int
    nombre: str
    correo: str
    mensaje: str
    fecha: datetime
    tipo: str
    estado: str
    respuestas: list[RespuestaContacto]
