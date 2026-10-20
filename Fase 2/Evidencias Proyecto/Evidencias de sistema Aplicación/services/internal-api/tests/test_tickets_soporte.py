from pathlib import Path

import pytest

from tests.conftest import token

URL = "/internal/v1/tickets-soporte"
SEED = Path(__file__).resolve().parents[1] / "sql" / "001_catalogos_soporte.sql"


@pytest.fixture(autouse=True)
def catalogos(db):
    # El seed trae BEGIN/COMMIT: se quitan para que quede dentro de la transacción que se revierte.
    db.execute(SEED.read_text(encoding="utf-8").replace("BEGIN;", "").replace("COMMIT;", ""))


def test_catalogos(client, crear_usuario):
    h = token(crear_usuario())
    assert client.get(f"{URL}/estados", headers=h).json()[0] == {"estado_id": 1, "nombre": "ABIERTO"}
    assert {"categoria_id": 3, "nombre": "ALERTAS"} in client.get(f"{URL}/categorias", headers=h).json()


def test_ciclo_de_un_ticket(client, crear_usuario):
    uid, soporte = crear_usuario(), crear_usuario(rol_id=2)
    r = client.post(URL, json={"descripcion": "No llega la alerta", "categoria_id": 3}, headers=token(uid))
    assert r.status_code == 201, r.text
    t = r.json()
    assert (t["estado"], t["solucion"], t["categoria"], t["usuario_id"]) == ("ABIERTO", "", "ALERTAS", uid)

    # El usuario no puede cambiar su ticket.
    assert client.patch(f"{URL}/{t['ticket_id']}", json={"estado": "CERRADO"}, headers=token(uid)).status_code == 403

    r = client.patch(f"{URL}/{t['ticket_id']}", json={"estado": "resuelto", "solucion": "Se reconectó WhatsApp"}, headers=token(soporte))
    assert r.status_code == 200, r.text
    assert (r.json()["estado"], r.json()["solucion"]) == ("RESUELTO", "Se reconectó WhatsApp")

    assert client.get(URL, params={"estado": "RESUELTO"}, headers=token(uid)).json()[0]["ticket_id"] == t["ticket_id"]
    assert client.get(URL, params={"estado": "ABIERTO"}, headers=token(uid)).json() == []


def test_errores(client, crear_usuario):
    uid, admin = crear_usuario(), crear_usuario(rol_id=1)
    assert client.post(URL, json={"descripcion": "x", "categoria_id": 999}, headers=token(uid)).status_code == 400
    tid = client.post(URL, json={"descripcion": "x", "categoria_id": 1}, headers=token(uid)).json()["ticket_id"]

    assert client.patch(f"{URL}/{tid}", json={"estado": "INVENTADO"}, headers=token(admin)).status_code == 400
    r = client.patch(f"{URL}/{tid}", json={}, headers=token(admin))
    assert r.status_code == 400 and r.json()["message"] == ["Value error, indica estado o solucion"]
    assert client.patch(f"{URL}/999999", json={"solucion": "x"}, headers=token(admin)).status_code == 404
    # Ticket ajeno: 404 para otro usuario común.
    assert client.get(f"{URL}/{tid}", headers=token(crear_usuario())).status_code == 404
