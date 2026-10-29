from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_openapi_y_swagger():
    assert client.get("/openapi.json").json()["info"]["title"] == "EMERGEN internal-api"
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200


def test_error_con_formato_nestjs():
    r = client.get("/internal/v1/no-existe")
    assert r.status_code == 404
    assert r.json() == {"statusCode": 404, "message": "Not Found", "error": "Not Found"}


def test_readiness_comprueba_esquema_sin_escribir(client, db):
    before = db.execute("SELECT count(*) AS total FROM envio_alerta").fetchone()["total"]
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["service"] == "emergen-internal-api"
    assert response.json()["database"] == "up"
    assert db.execute("SELECT count(*) AS total FROM envio_alerta").fetchone()["total"] == before


def test_readiness_no_oculta_un_fallo_de_esquema():
    from app.core.db import get_db

    class BrokenDatabase:
        def execute(self, query):
            raise RuntimeError("información privada de conexión")

    app.dependency_overrides[get_db] = lambda: BrokenDatabase()
    try:
        response = client.get("/health/ready")
        assert response.status_code == 503
        assert response.json()["database"] == "down"
        assert "privada" not in response.text
    finally:
        app.dependency_overrides.clear()
