import pytest
from pydantic import ValidationError
from app.core.config import Settings


def production():
    return dict(environment="production", deployment_id="emergen-prod", db_host="db", db_port=5432, db_sslmode="disable",
                db_user="app", db_password="solo-test", db_name="emergen", jwt_secret="x" * 48,
                cors_origins="https://app.emergen.cl,https://localhost")


def test_production_requires_explicit_configuration():
    config = production()
    # Los alias de entorno son también los nombres usados en el constructor.
    values = {"EMERGEN_ENVIRONMENT": config.pop("environment"), "EMERGEN_DEPLOYMENT_ID": config.pop("deployment_id"),
              "DB_HOST": config.pop("db_host"), "DB_PORT": config.pop("db_port"), "DB_USER": config.pop("db_user"),
              "DB_PASSWORD": config.pop("db_password"), "DB_NAME": config.pop("db_name"),
              "JWT_SECRET": config.pop("jwt_secret"), "CORS_ORIGINS": config.pop("cors_origins"),
              "DB_SSLMODE": config.pop("db_sslmode")}
    assert Settings(_env_file=None, **values).deployment_id == "emergen-prod"
    for key in ("DB_PASSWORD", "JWT_SECRET", "EMERGEN_DEPLOYMENT_ID"):
        with pytest.raises(ValidationError):
            Settings(_env_file=None, **{**values, key: ""})
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **{**values, "CORS_ORIGINS": "http://localhost:5173"})


def test_production_without_explicit_tls_policy_is_rejected():
    with pytest.raises(ValidationError, match="DB_SSLMODE"):
        Settings(_env_file=None, EMERGEN_ENVIRONMENT="production",
                 EMERGEN_DEPLOYMENT_ID="synthetic", DB_HOST="synthetic.invalid", DB_PORT=55439,
                 DB_USER="synthetic", DB_PASSWORD="synthetic-only", DB_NAME="synthetic_test",
                 JWT_SECRET="s" * 48, CORS_ORIGINS="https://app.example.invalid")


def test_port_del_proveedor_y_override_local(monkeypatch):
    monkeypatch.setenv("PORT", "12345")
    monkeypatch.delenv("INTERNAL_API_PORT", raising=False)
    assert Settings(_env_file=None).port == 12345
    monkeypatch.setenv("INTERNAL_API_PORT", "8001")
    assert Settings(_env_file=None).port == 8001


def test_tls_no_permite_ignorar_certificados():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, DB_SSLMODE="require")
    with pytest.raises(ValidationError):
        Settings(_env_file=None, DB_SSLMODE="verify-full", DB_SSL_CA_FILE="archivo-que-no-existe")
