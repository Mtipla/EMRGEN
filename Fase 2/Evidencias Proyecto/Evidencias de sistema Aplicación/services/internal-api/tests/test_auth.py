import time
from tests.conftest import token

def test_sin_token(client):
    assert client.get("/internal/v1/alertas").status_code == 401

def test_token_vencido_audiencia_emisor(client,crear_usuario):
    uid=crear_usuario()
    for changes in ({"exp":int(time.time())-10},{"aud":"otra"},{"iss":"otro"}):
        assert client.get("/internal/v1/alertas",headers=token(uid,**changes)).status_code == 401

def test_parcial_autenticado_sin_facultades_staff(client,crear_usuario):
    uid=crear_usuario(rol_id=2,estado_id=2)
    assert client.get("/internal/v1/alertas",headers=token(uid)).status_code == 200
    assert client.patch("/internal/v1/tickets-soporte/1",headers=token(uid),json={"estado":"CERRADO"}).status_code == 403
