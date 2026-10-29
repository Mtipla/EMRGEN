from uuid import uuid4
import pytest
from app.api.routes.mensajes_contacto import limite_por_ip
from tests.conftest import token
URL = "/internal/v1/mensajes-contacto"


@pytest.fixture(autouse=True)
def limite_limpio():
    limite_por_ip.reiniciar()
    yield
    limite_por_ip.reiniciar()


def _datos(correo: str) -> dict:
    return {"nombre": "Spam", "correo": correo, "mensaje": "Hola", "tipo_id": 3}


def test_visitante_envia_y_personal_responde(client, crear_usuario, db):
    usuario = crear_usuario()
    soporte = crear_usuario(rol_id=2)
    tipos = {t["nombre"]: t["id"] for t in client.get(URL + "/tipos").json()}
    assert set(tipos) == {"RECLAMO", "SUGERENCIA", "CONSULTA"}
    datos = {"nombre": "Visitante", "correo": "visitante@emergen.test", "mensaje": "¿Funciona sin internet?", "tipo_id": tipos["CONSULTA"]}
    r = client.post(URL, json=datos)
    assert r.status_code == 201, r.text
    mid = r.json()["mensaje_contacto_id"]
    try:
        assert set(r.json()) == {"mensaje_contacto_id"}
        assert client.post(URL, json={**datos, "correo": "no-es-correo"}).status_code == 400
        assert client.post(URL, json={**datos, "tipo_id": 99999}).status_code == 400
        # Solo el personal ve la bandeja.
        assert client.get(URL).status_code == 401
        assert client.get(URL, headers=token(usuario)).status_code == 403
        assert client.patch(f"{URL}/{mid}", headers=token(usuario), json={"respuesta": "x"}).status_code == 403
        bandeja = client.get(URL, headers=token(soporte), params={"estado": "PENDIENTE", "limit": 100}).json()
        nuevo = next(m for m in bandeja if m["mensaje_contacto_id"] == mid)
        assert nuevo["tipo"] == "CONSULTA" and nuevo["respuestas"] == [] and nuevo["correo"] == "visitante@emergen.test"
        assert client.patch(f"{URL}/{mid}", headers=token(soporte), json={"estado": "INVENTADO"}).status_code == 400
        assert client.patch(f"{URL}/{mid}", headers=token(soporte), json={}).status_code == 400
        r = client.patch(f"{URL}/{mid}", headers=token(soporte), json={"estado": "EN_REVISION"})
        assert r.json()["estado"] == "EN_REVISION"
        r = client.patch(f"{URL}/{mid}", headers=token(soporte), json={"respuesta": "Necesitas conexión para enviar alertas."})
        assert r.status_code == 200, r.text
        item = r.json()
        assert item["estado"] == "REVISADO"
        assert [x["texto"] for x in item["respuestas"]] == ["Necesitas conexión para enviar alertas."]
        assert item["respuestas"][0]["autor"] == "Pytest"
        assert client.get(f"{URL}/{mid}", headers=token(soporte)).json() == item
        assert client.get(f"{URL}/99999999", headers=token(soporte)).status_code == 404
    finally:
        db.execute("DELETE FROM mensaje_contacto WHERE mensaje_contacto_id=%s", (mid,))


def test_antispam_por_correo(client, db):
    correo = f"spam.{uuid4().hex}@emergen.test"
    try:
        for _ in range(3):
            assert client.post(URL, json=_datos(correo)).status_code == 201
        limite_por_ip.reiniciar()  # aísla el límite por correo del límite por IP
        r = client.post(URL, json=_datos(correo.upper()))
        assert r.status_code == 429, r.text
        assert db.execute("SELECT count(*) n FROM mensaje_contacto WHERE lower(correo_remitente)=%s", (correo,)).fetchone()["n"] == 3
    finally:
        db.execute("DELETE FROM mensaje_contacto WHERE lower(correo_remitente)=%s", (correo,))


def test_antispam_por_ip_aunque_cambie_el_correo(client, db):
    prefijo = f"ip.{uuid4().hex}"
    try:
        for i in range(5):
            assert client.post(URL, json=_datos(f"{prefijo}.{i}@emergen.test")).status_code == 201
        assert client.post(URL, json=_datos(f"{prefijo}.5@emergen.test")).status_code == 429
    finally:
        db.execute("DELETE FROM mensaje_contacto WHERE correo_remitente LIKE %s", (prefijo + ".%",))


def test_limite_ventana_libera_cupo_al_vencer():
    from app.core.limite import LimiteVentana
    limite = LimiteVentana(maximo=2, segundos=0)
    assert all(limite.permitir("a") for _ in range(3))  # ventana 0: nunca acumula
    limite = LimiteVentana(maximo=2, segundos=60)
    assert limite.permitir("a") and limite.permitir("a") and not limite.permitir("a")
    assert limite.permitir("b")
