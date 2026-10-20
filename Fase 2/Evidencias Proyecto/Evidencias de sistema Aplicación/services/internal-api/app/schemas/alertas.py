from pydantic import BaseModel, ConfigDict, Field


class AlertaCrear(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    ubicacion: str = Field(min_length=1, max_length=150, description="Dirección o coordenadas 'lat,lng'.")
    mensaje: str | None = Field(
        None,
        min_length=1,
        max_length=200,
        description="Si se omite, se usa el mensaje personalizado del usuario.",
    )


class Alerta(BaseModel):
    alerta_id: int
    usuario_id: int
    ubicacion: str
    mensaje: str
