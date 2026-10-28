import pytest
from tests.conftest import token
URL="/internal/v1/tickets-soporte"

def test_ticket_sin_seguimiento_estado_y_solucion(client,db,crear_usuario):
    user=crear_usuario();staff=crear_usuario(rol_id=2);other=crear_usuario();admin=crear_usuario(rol_id=1)
    r=client.post(URL,headers=token(user),json={"descripcion":"Prueba ticket","categoria_id":1})
    assert r.status_code==201,r.text
    item=r.json();tid=item["ticket_id"];assert item["estado"]=="ABIERTO" and item["solucion"] is None
    assert db.execute("SELECT count(*) n FROM soporte WHERE ticket_soporte_id=%s",(tid,)).fetchone()["n"]==0
    assert client.get(f"{URL}/{tid}",headers=token(other)).status_code==404
    assert client.patch(f"{URL}/{tid}",headers=token(user),json={"estado":"CERRADO"}).status_code==403
    assert client.patch(f"{URL}/{tid}",headers=token(staff),json={"estado":"INVENTADO"}).status_code==400
    assert client.patch(f"{URL}/{tid}",headers=token(staff),json={"solucion":""}).status_code==400
    r=client.patch(f"{URL}/{tid}",headers=token(staff),json={"estado":"EN PROCESO"})
    assert r.status_code==200,r.text
    assert r.json()["solucion"] is None
    for text in ("Respuesta inicial","Respuesta final"):
        r=client.patch(f"{URL}/{tid}",headers=token(admin),json={"solucion":text})
        assert r.status_code==200,r.text
    assert db.execute("SELECT count(*) n FROM soporte WHERE ticket_soporte_id=%s",(tid,)).fetchone()["n"]==1
    assert r.json()["solucion"]=="Respuesta final"
    assert client.get(URL,headers=token(user)).status_code==200

def test_catalogos_y_referencias(client,crear_usuario):
    uid=crear_usuario()
    assert client.get(URL+"/categorias",headers=token(uid)).status_code==200
    assert client.get(URL+"/estados",headers=token(uid)).status_code==200
    assert client.post(URL,headers=token(uid),json={"descripcion":"Caso","categoria_id":99999}).status_code==400


def test_bandeja_staff_aislamiento_y_respuesta_visible_al_solicitante(client, crear_usuario):
    principal = crear_usuario()
    otro = crear_usuario()
    soporte = crear_usuario(rol_id=2)
    parcial = crear_usuario(rol_id=2, estado_id=2)
    ticket = client.post(URL, headers=token(principal), json={"descripcion": "Problema de acceso", "categoria_id": 1}).json()
    ajeno = client.post(URL, headers=token(otro), json={"descripcion": "Otro caso", "categoria_id": 1}).json()
    tid = ticket["ticket_id"]
    assert ticket["nombre_usuario"] == "Pytest"
    assert ticket["correo_usuario"].endswith("@emergen.test")
    propios = client.get(URL, headers=token(principal), params={"usuario_id": otro, "limit": 100}).json()
    assert tid in [t["ticket_id"] for t in propios]
    assert ajeno["ticket_id"] not in [t["ticket_id"] for t in propios]
    bandeja = client.get(URL, headers=token(soporte), params={"usuario_id": principal}).json()
    assert tid in [t["ticket_id"] for t in bandeja]
    assert client.patch(f"{URL}/{tid}", headers=token(parcial), json={"estado": "CERRADO"}).status_code == 403
    actualizado = client.patch(f"{URL}/{tid}", headers=token(soporte), json={"estado": "CERRADO", "solucion": "Acceso restablecido", "confirmar_cierre": True})
    assert actualizado.status_code == 200, actualizado.text
    respuesta = client.get(f"{URL}/{tid}", headers=token(principal)).json()
    assert respuesta["estado"] == "CERRADO"
    assert respuesta["solucion"] == "Acceso restablecido"
    assert client.get(f"{URL}/{tid}", headers=token(otro)).status_code == 404


def test_verificacion_cierre_y_permisos_actualizados(client, crear_usuario, db):
    solicitante = crear_usuario()
    soporte = crear_usuario(rol_id=2)
    admin = crear_usuario(rol_id=1)
    tid = client.post(URL, headers=token(solicitante), json={"descripcion": "Revisar caso", "categoria_id": 1}).json()["ticket_id"]
    assert not db.execute("""SELECT 1 FROM information_schema.columns WHERE table_schema='public'
        AND table_name IN ('ticket_soporte','soporte') AND column_name='verificacion_solicitada'""").fetchall()
    antes = db.execute("SELECT * FROM ticket_soporte WHERE ticket_soporte_id=%s", (tid,)).fetchone()
    en_proceso = db.execute("SELECT estado_ticket_id FROM estado_ticket WHERE estado_ticket='EN PROCESO'").fetchone()["estado_ticket_id"]
    assert client.patch(f"{URL}/{tid}", headers=token(soporte), json={"verificacion_solicitada": True}).status_code == 400
    # Sin cambiar manualmente estado ni solución: siempre queda EN PROCESO.
    r = client.patch(f"{URL}/{tid}", headers=token(soporte), json={"enviar_verificacion": True})
    assert r.status_code == 200, r.text
    assert r.json()["estado"] == "EN PROCESO"
    assert "verificacion_solicitada" not in r.json()
    assert r.json()["solucion"] is None
    assert db.execute("SELECT * FROM ticket_soporte WHERE ticket_soporte_id=%s", (tid,)).fetchone() == {
        **antes, "estado_ticket_id": en_proceso,
    }
    assert db.execute("SELECT count(*) n FROM soporte WHERE ticket_soporte_id=%s", (tid,)).fetchone()["n"] == 0
    assert client.patch(f"{URL}/{tid}", headers=token(soporte), json={"enviar_verificacion": True}).status_code == 403
    bandeja = client.get(URL, headers=token(admin), params={"usuario_id": solicitante, "estado": "EN PROCESO"}).json()
    revision = next(t for t in bandeja if t["ticket_id"] == tid)
    assert revision["estado"] == "EN PROCESO"
    assert "verificacion_solicitada" not in revision
    assert "verificacion_solicitada" not in client.get("/openapi.json").json()["components"]["schemas"]["Ticket"]["properties"]
    assert client.patch(f"{URL}/{tid}", headers=token(soporte), json={"estado": "CERRADO"}).status_code == 403
    assert client.patch(f"{URL}/{tid}", headers=token(admin), json={"estado": "CERRADO"}).status_code == 400
    r = client.patch(f"{URL}/{tid}", headers=token(admin), json={"estado": "CERRADO", "solucion": "Caso resuelto", "confirmar_cierre": True})
    assert r.status_code == 200, r.text
    assert r.json()["estado"] == "CERRADO"
    assert "verificacion_solicitada" not in r.json()
    for datos in ({"solucion": "Cambio prohibido"}, {"estado": "ABIERTO"}, {"enviar_verificacion": True}):
        assert client.patch(f"{URL}/{tid}", headers=token(soporte), json=datos).status_code == 403
    assert client.get(f"{URL}/{tid}", headers=token(soporte)).json()["solucion"] == "Caso resuelto"
    r = client.patch(f"{URL}/{tid}", headers=token(admin), json={"solucion": "Revisión administrativa", "estado": "ABIERTO"})
    assert r.status_code == 200, r.text
    assert r.json()["solucion"] == "Revisión administrativa"
    db.execute("UPDATE usuario SET rol_id=3 WHERE usuario_id=%s", (soporte,))
    assert client.patch(f"{URL}/{tid}", headers=token(soporte), json={"solucion": "Inhabilitado"}).status_code == 403
    assert tid not in [t["ticket_id"] for t in client.get(URL, headers=token(soporte)).json()]
    db.execute("UPDATE usuario SET rol_id=2 WHERE usuario_id=%s", (soporte,))
    assert client.patch(f"{URL}/{tid}", headers=token(soporte), json={"enviar_verificacion": True}).status_code == 200


@pytest.mark.parametrize("verificar", [False, True])
def test_en_proceso_solo_admin_puede_modificar_sin_escrituras_de_soporte(client, crear_usuario, db, verificar):
    solicitante = crear_usuario()
    soporte = crear_usuario(rol_id=2)
    otro_soporte = crear_usuario(rol_id=2)
    admin = crear_usuario(rol_id=1)
    tid = client.post(URL, headers=token(solicitante), json={"descripcion": "Revisar plan", "categoria_id": 2}).json()["ticket_id"]
    assert client.patch(f"{URL}/{tid}", headers=token(soporte), json={"solucion": "Respuesta original"}).status_code == 200
    cambio = {"enviar_verificacion": True} if verificar else {"estado": "EN PROCESO"}
    assert client.patch(f"{URL}/{tid}", headers=token(soporte), json=cambio).status_code == 200
    antes = client.get(f"{URL}/{tid}", headers=token(soporte)).json()
    seguimiento = db.execute("SELECT * FROM soporte WHERE ticket_soporte_id=%s", (tid,)).fetchone()
    for personal in (soporte, otro_soporte):
        for cambios in (
            {"solucion": "No debe guardarse"},
            {"estado": "ABIERTO"},
            {"estado": "EN PROCESO", "solucion": "Tampoco debe guardarse"},
            {"estado": "CERRADO", "confirmar_cierre": True},
            {"enviar_verificacion": True},
        ):
            respuesta = client.patch(f"{URL}/{tid}", headers=token(personal), json=cambios)
            assert respuesta.status_code == 403, respuesta.text
            assert client.get(f"{URL}/{tid}", headers=token(personal)).json() == antes
            assert db.execute("SELECT * FROM soporte WHERE ticket_soporte_id=%s", (tid,)).fetchone() == seguimiento
    r = client.patch(f"{URL}/{tid}", headers=token(admin), json={"solucion": "Respuesta revisada"})
    assert r.status_code == 200, r.text
    assert r.json()["estado"] == "EN PROCESO"
    assert r.json()["solucion"] == "Respuesta revisada"
    assert client.patch(f"{URL}/{tid}", headers=token(admin), json={"estado": "ABIERTO"}).status_code == 200
    assert client.patch(f"{URL}/{tid}", headers=token(soporte), json={"solucion": "Respuesta tras reapertura"}).status_code == 200


def test_ticket_cerrado_no_se_reabre_sin_motivo(client, crear_usuario):
    user = crear_usuario(); staff = crear_usuario(rol_id=1)
    tid = client.post(URL, headers=token(user), json={"descripcion": "Caso", "categoria_id": 1}).json()["ticket_id"]
    assert client.patch(f"{URL}/{tid}", headers=token(staff), json={"estado": "CERRADO", "solucion": "Rechazada: fuera de alcance", "confirmar_cierre": True}).status_code == 200
    assert client.patch(f"{URL}/{tid}", headers=token(staff), json={"estado": "EN PROCESO"}).status_code == 400
    r = client.patch(f"{URL}/{tid}", headers=token(staff), json={"estado": "EN PROCESO", "solucion": "Reabierto: faltaban datos"})
    assert r.status_code == 200 and r.json()["estado"] == "EN PROCESO"
