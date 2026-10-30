from pathlib import Path
import os
from urllib.parse import urlsplit

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICE_DIR = Path(__file__).resolve().parents[2]
# parent es estable también al empaquetar el servicio solo en /app (sin monorepo).
MONOREPO_DIR = SERVICE_DIR.parent.parent


class Settings(BaseSettings):
    """Variables propias INTERNAL_API_* y las compartidas con el backend NestJS (DB_*, JWT_SECRET).

    Lee los mismos archivos que el backend local (.env de la raíz y apps/backend/.env.local) y
    después el .env de esta carpeta; gana el último que define la variable. Las variables del
    entorno del proceso ganan siempre.
    """

    model_config = SettingsConfigDict(
        env_file=() if os.environ.get("EMERGEN_ENVIRONMENT") in ("test", "staging", "production") else (
            MONOREPO_DIR / ".env",
            MONOREPO_DIR / "apps" / "backend" / ".env.local",
            SERVICE_DIR / ".env",
        ),
        env_prefix="INTERNAL_API_",
        extra="ignore",
        hide_input_in_errors=True,
    )

    mensaje_predeterminado: str = Field("Necesito ayuda inmediata en mi ubicación.", min_length=1, max_length=160)
    intervalo_cierre_segundos: int = Field(30, ge=1, le=300)
    # PORT del proveedor se respeta; PORT del .env raíz pertenece a NestJS.
    port: int = Field(default_factory=lambda: int(os.environ.get("PORT", "8000")), ge=1, le=65535)
    environment: str = Field("development", validation_alias="EMERGEN_ENVIRONMENT")
    deployment_id: str = Field("local", validation_alias="EMERGEN_DEPLOYMENT_ID")
    cors_origins: str = Field(
        "http://localhost:5173,http://localhost:5174,http://localhost:5175",
        validation_alias=AliasChoices("INTERNAL_API_CORS_ORIGINS", "CORS_ORIGINS"),
    )
    docs_enabled: bool = Field(default_factory=lambda: os.environ.get('EMERGEN_ENVIRONMENT', 'development') not in ('staging', 'production'))
    max_body_bytes: int = Field(16384, ge=1024, le=1048576)
    db_regular_connections: int = Field(8, ge=1, le=64)
    db_sos_connections: int = Field(4, ge=1, le=32)
    tickets_per_15_minutes: int = Field(10, ge=1, le=1000)
    db_statement_timeout_ms: int = Field(30000, ge=1000, le=300000, validation_alias="DB_STATEMENT_TIMEOUT_MS")

    db_host: str = Field("localhost", validation_alias="DB_HOST")
    db_port: int = Field(5433, ge=1, le=65535, validation_alias="DB_PORT")
    db_user: str | None = Field(None, validation_alias="DB_USER")
    db_password: str | None = Field(None, validation_alias="DB_PASSWORD")
    db_name: str | None = Field(None, validation_alias="DB_NAME")
    db_sslmode: str = Field("disable", validation_alias="DB_SSLMODE")
    db_ssl_ca_file: str | None = Field(None, validation_alias="DB_SSL_CA_FILE")

    # Debe ser el mismo JWT_SECRET del backend NestJS: internal-api verifica sus tokens.
    jwt_secret: str | None = Field(None, validation_alias="JWT_SECRET")

    @model_validator(mode="after")
    def validate_deployment(self):
        if '*' in os.environ.get('FORWARDED_ALLOW_IPS', ''):
            raise ValueError('FORWARDED_ALLOW_IPS: enumera únicamente proxies confiables')
        if self.db_sslmode not in ("disable", "verify-full"):
            raise ValueError("DB_SSLMODE: usa disable o verify-full")
        if self.db_sslmode == "verify-full" and (not self.db_ssl_ca_file or not Path(self.db_ssl_ca_file).is_file()):
            raise ValueError("DB_SSL_CA_FILE: falta el archivo CA del proveedor")
        if self.environment not in ("development", "test", "staging", "production"):
            raise ValueError("EMERGEN_ENVIRONMENT: valor no válido")
        if self.environment in ("staging", "production"):
            if 'docs_enabled' not in self.model_fields_set:
                self.docs_enabled = False
            if 'db_sslmode' not in self.model_fields_set:
                raise ValueError('DB_SSLMODE: declara la política TLS del destino')
            if not {"db_host", "db_port"}.issubset(self.model_fields_set):
                raise ValueError("DB_HOST y DB_PORT: deben configurarse explícitamente en hosting")
            for name in ("db_host", "db_user", "db_password", "db_name", "jwt_secret"):
                value = getattr(self, name)
                if not value or "<INSERT_" in value or "CHANGE_ME" in value:
                    raise ValueError(f"{name.upper()}: debe configurarse en el entorno del servicio")
            if len(self.jwt_secret or "") < 32:
                raise ValueError("JWT_SECRET: usa al menos 32 caracteres")
            if not self.deployment_id or self.deployment_id == "local":
                raise ValueError("EMERGEN_DEPLOYMENT_ID: identifica el despliegue compartido con NestJS")
            if not self.cors_list:
                raise ValueError("CORS_ORIGINS: configura los orígenes del despliegue")
            for origin in self.cors_list:
                if origin in ("https://localhost", "capacitor://localhost"):
                    continue
                url = urlsplit(origin)
                if url.scheme != "https" or not url.hostname or url.hostname == "localhost" or url.username or url.password or url.path or url.query or url.fragment:
                    raise ValueError("CORS_ORIGINS: usa orígenes HTTPS exactos")
        return self

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
