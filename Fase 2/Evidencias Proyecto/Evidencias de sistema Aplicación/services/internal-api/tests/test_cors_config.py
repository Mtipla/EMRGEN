from app.core.config import Settings


def test_origenes_de_desarrollo_por_defecto(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.delenv("INTERNAL_API_CORS_ORIGINS", raising=False)
    assert "http://localhost:5174" in Settings(_env_file=None).cors_list


def test_reutiliza_origenes_del_backend_y_permite_configuracion_propia(monkeypatch):
    monkeypatch.delenv("INTERNAL_API_CORS_ORIGINS", raising=False)
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:5174, capacitor://localhost")
    assert Settings(_env_file=None).cors_list == ["http://localhost:5174", "capacitor://localhost"]
    monkeypatch.setenv("INTERNAL_API_CORS_ORIGINS", "http://localhost:5173")
    assert Settings(_env_file=None).cors_list == ["http://localhost:5173"]


def test_preflight_sos_desde_movil(client):
    response = client.options("/internal/v1/alertas", headers={
        "Origin": "http://localhost:5174",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
    })
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5174"
