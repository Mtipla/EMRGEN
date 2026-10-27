from tests.conftest import token
URL="/internal/v1/tickets-soporte"

def test_ticket_sin_seguimiento_estado_y_solucion(client,db,crear_usuario):
    user=crear_usuario();staff=crear_usuario(rol_id=2);other=crear_usuario()
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
        r=client.patch(f"{URL}/{tid}",headers=token(staff),json={"solucion":text})
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
    actualizado = client.patch(f"{URL}/{tid}", headers=token(soporte), json={"estado": "CERRADO", "solucion": "Acceso restablecido"})
    assert actualizado.status_code == 200, actualizado.text
    respuesta = client.get(f"{URL}/{tid}", headers=token(principal)).json()
    assert respuesta["estado"] == "CERRADO"
    assert respuesta["solucion"] == "Acceso restablecido"
    assert client.get(f"{URL}/{tid}", headers=token(otro)).status_code == 404
