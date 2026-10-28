from pydantic import BaseModel, ConfigDict, Field, model_validator


class Categoria(BaseModel):
    categoria_id: int
    nombre: str


class Estado(BaseModel):
    estado_id: int
    nombre: str


class TicketCrear(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    descripcion: str = Field(min_length=1, max_length=500)
    categoria_id: int = Field(gt=0)


class TicketActualizar(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    estado: str | None = Field(None, min_length=1, max_length=50, description="Nombre de ESTADO_TICKET.")
    solucion: str | None = Field(None, min_length=1, max_length=500)
    enviar_verificacion: bool = Field(False, strict=True, description="Acción que cambia el estado a EN PROCESO; no se almacena como campo del ticket.")
    confirmar_cierre: bool = Field(False, strict=True)

    @model_validator(mode="after")
    def al_menos_un_campo(self):
        if self.enviar_verificacion and self.estado is not None and self.estado.upper() != "EN PROCESO":
            raise ValueError("la verificación requiere estado EN PROCESO")
        if self.estado is None and self.solucion is None and not self.enviar_verificacion:
            raise ValueError("indica estado o solucion")
        return self


class Ticket(BaseModel):
    ticket_id: int
    usuario_id: int
    nombre_usuario: str | None = None
    correo_usuario: str | None = None
    descripcion: str
    estado: str
    solucion: str | None
    categoria_id: int
    categoria: str
