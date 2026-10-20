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
    solucion: str | None = Field(None, max_length=500)

    @model_validator(mode="after")
    def al_menos_un_campo(self):
        if self.estado is None and self.solucion is None:
            raise ValueError("indica estado o solucion")
        return self


class Ticket(BaseModel):
    ticket_id: int
    usuario_id: int
    descripcion: str
    estado: str
    solucion: str
    categoria_id: int
    categoria: str
