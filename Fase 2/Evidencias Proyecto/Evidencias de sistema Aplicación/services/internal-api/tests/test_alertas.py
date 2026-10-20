from tests.conftest import token

URL = "/internal/v1/alertas"


def test_crear_listar_y_ver(client, db, crear_usuario):
    uid = crear_usuario()
    r = client.post(URL, json={"ubicacion": "-33.45,-70.66", "mensaje": "Caída en casa"}, headers=token(uid))
    assert r.status_code == 201, r.text
    alerta = r.json()
    assert alerta | {"alerta_id": 0} == {"alerta_id": 0, "usuario_id": uid, "ubicacion": "-33.45,-70.66", "mensaje": "Caída en casa"}

    # El incidente queda también en el historial.
    hist = db.execute("SELECT usuario_id FROM historial_alerta WHERE alerta_id = %s", (alerta["alerta_id"],)).fetchall()
    assert hist == [{"usuario_id": uid}]

    assert client.get(URL, headers=token(uid)).json() == [alerta]
    assert client.get(f"{URL}/{alerta['alerta_id']}", headers=token(uid)).json() == alerta


def test_mensaje_por_defecto(client, db, crear_usuario):
    uid = crear_usuario()
    # Sin mensaje personalizado: 400.
    assert client.post(URL, json={"ubicacion": "Casa"}, headers=token(uid)).status_code == 400

    msj = db.execute("SELECT COALESCE(MAX(msj_personalizado_id), 0) + 1 AS id FROM usuario_mensaje_personalizado").fetchone()["id"]
    db.execute("INSERT INTO usuario_mensaje_personalizado VALUES (%s, 'Soy diabético')", (msj,))
    db.execute("UPDATE usuario SET msj_personalizado_id = %s WHERE usuario_id = %s", (msj, uid))
    r = client.post(URL, json={"ubicacion": "Casa"}, headers=token(uid))
    assert r.status_code == 201
    assert r.json()["mensaje"] == "Soy diabético"


def test_aislamiento_entre_usuarios(client, crear_usuario):
    duenio, otro, soporte = crear_usuario(), crear_usuario(), crear_usuario(rol_id=2)
    alerta_id = client.post(URL, json={"ubicacion": "A", "mensaje": "M"}, headers=token(duenio)).json()["alerta_id"]

    assert client.get(f"{URL}/{alerta_id}", headers=token(otro)).status_code == 404
    assert client.get(URL, headers=token(otro)).json() == []
    # Un usuario común no puede ver las de otro aunque filtre por usuario_id.
    assert client.get(URL, params={"usuario_id": duenio}, headers=token(otro)).json() == []

    assert client.get(f"{URL}/{alerta_id}", headers=token(soporte)).status_code == 200
    assert [a["alerta_id"] for a in client.get(URL, params={"usuario_id": duenio}, headers=token(soporte)).json()] == [alerta_id]


def test_validacion(client, crear_usuario):
    uid = crear_usuario()
    r = client.post(URL, json={"ubicacion": "x" * 151, "mensaje": "M"}, headers=token(uid))
    assert r.status_code == 400
    assert r.json()["message"][0].startswith("ubicacion:")
    assert client.post(URL, json={"ubicacion": "A", "extra": 1}, headers=token(uid)).status_code == 400
