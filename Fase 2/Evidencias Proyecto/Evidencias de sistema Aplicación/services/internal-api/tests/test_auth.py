import time

from tests.conftest import token


def test_sin_token(client):
    r = client.get("/internal/v1/alertas")
    assert r.status_code == 401
    assert r.json()["message"] == "Debes iniciar sesión"


def test_token_vencido_o_de_otra_audiencia(client, crear_usuario):
    uid = crear_usuario()
    for cambios in ({"exp": int(time.time()) - 10}, {"aud": "otra"}, {"iss": "otro"}):
        r = client.get("/internal/v1/alertas", headers=token(uid, **cambios))
        assert r.status_code == 401, cambios


def test_usuario_bloqueado(client, crear_usuario):
    uid = crear_usuario(estado_id=3)
    r = client.get("/internal/v1/alertas", headers=token(uid))
    assert r.status_code == 401
    assert r.json()["message"] == "La sesión no corresponde a un usuario activo"
