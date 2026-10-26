from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICE_DIR = Path(__file__).resolve().parents[2]
MONOREPO_DIR = SERVICE_DIR.parents[1]


class Settings(BaseSettings):
    """Variables propias INTERNAL_API_* y las compartidas con el backend NestJS (DB_*, JWT_SECRET).

    Lee los mismos archivos que el backend local (.env de la raíz y apps/backend/.env.local) y
    después el .env de esta carpeta; gana el último que define la variable. Las variables del
    entorno del proceso ganan siempre.
    """

    model_config = SettingsConfigDict(
        env_file=(
            MONOREPO_DIR / ".env",
            MONOREPO_DIR / "apps" / "backend" / ".env.local",
            SERVICE_DIR / ".env",
        ),
        env_prefix="INTERNAL_API_",
        extra="ignore",
    )

    mensaje_predeterminado: str = Field("Necesito ayuda inmediata en mi ubicación.", min_length=1, max_length=200)
    intervalo_cierre_segundos: int = Field(30, ge=1, le=300)
    port: int = 8000
    cors_origins: str = Field(
        "http://localhost:5173,http://localhost:5174,http://localhost:5175",
        validation_alias=AliasChoices("INTERNAL_API_CORS_ORIGINS", "CORS_ORIGINS"),
    )
    docs_enabled: bool = True

    db_host: str = Field("localhost", validation_alias="DB_HOST")
    db_port: int = Field(5433, validation_alias="DB_PORT")
    db_user: str | None = Field(None, validation_alias="DB_USER")
    db_password: str | None = Field(None, validation_alias="DB_PASSWORD")
    db_name: str | None = Field(None, validation_alias="DB_NAME")

    # Debe ser el mismo JWT_SECRET del backend NestJS: internal-api verifica sus tokens.
    jwt_secret: str | None = Field(None, validation_alias="JWT_SECRET")

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
