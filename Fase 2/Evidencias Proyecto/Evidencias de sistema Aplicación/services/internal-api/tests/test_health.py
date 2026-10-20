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
