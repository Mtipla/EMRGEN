from fastapi.testclient import TestClient
from app.main import app
from app.api.routes.mensajes_contacto import RUTAS_PUBLICAS


def test_swagger_declara_bearer_jwt_para_authorize():
    response=TestClient(app).get("/openapi.json")
    assert response.status_code==200
    schema=response.json()
    security=schema["components"]["securitySchemes"]["SesionEMERGEN"]
    assert security["type"]=="http"
    assert security["scheme"]=="bearer"
    assert security["bearerFormat"]=="JWT"


def test_rutas_sos_y_soporte_usan_seguridad_sin_cabecera_reservada():
    schema=app.openapi()
    for path,operations in schema["paths"].items():
        if not path.startswith("/internal/v1/"):
            continue
        for method,operation in operations.items():
            if (path,method) in RUTAS_PUBLICAS:
                assert not operation.get("security")
                continue
            assert operation["security"]==[{"SesionEMERGEN":[]}]
            assert not any(parameter["in"]=="header" and parameter["name"].lower()=="authorization"
                for parameter in operation.get("parameters",[]))


def test_salud_y_documentacion_continuan_publicas():
    schema=app.openapi()
    assert not schema["paths"]["/health"]["get"].get("security")
    client=TestClient(app)
    assert client.get("/health").status_code==200
    assert client.get("/docs").status_code==200
