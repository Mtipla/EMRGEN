from uuid import uuid4
from concurrent.futures import ThreadPoolExecutor
from fastapi import HTTPException
from app.core.db import connect, transaction
from app.core.scheduler import run_once
from app.schemas.alertas import AlertaCrear
from app.services import alertas
from tests.conftest import token

URL="/internal/v1/alertas"
def body(**extra):
    return {"clave_idempotencia":str(uuid4()),"prioridad_id":3,**extra}
def create(client,uid,**extra):
    r=client.post(URL,headers=token(uid),json=body(**extra))
    assert r.status_code==201,r.text
    return r.json()
def close(client,actor,aid,pin="0007"):
    return client.post(f"{URL}/{aid}/cerrar",headers=token(actor),json={"pin":pin})

def test_snapshot_idempotencia_sin_ubicacion(client,db,crear_usuario):
    uid=crear_usuario();data=body(mensaje="Snapshot original")
    first=client.post(URL,headers=token(uid),json=data);assert first.status_code==201,first.text
    aid=first.json()["alerta_id"];assert first.json()["ubicacion"] is None
    assert client.post(URL,headers=token(uid),json=data).json()["alerta_id"]==aid
    assert client.post(URL,headers=token(uid),json=data|{"mensaje":"Otro"}).status_code==409
    assert client.post(URL,headers=token(uid),json=body()).status_code==409
    assert db.execute("SELECT count(*) n FROM historial_alerta WHERE alerta_id=%s",(aid,)).fetchone()["n"]==1
    assert db.execute("SELECT count(*) n FROM envio_alerta WHERE alerta_id=%s",(aid,)).fetchone()["n"]==1
    assert first.json()["whatsapp"]=={"pendientes":1,"enviados":0,"fallidos":0}

def test_plan_contactos_y_prioridad(client,crear_usuario):
    for options in ({"plan":False},{"contacts":False}):
        uid=crear_usuario(**options)
        assert client.post(URL,headers=token(uid),json=body()).status_code==409
    uid=crear_usuario()
    assert client.post(URL,headers=token(uid),json=body(prioridad_id=5)).status_code==400
    assert client.post(URL,headers=token(uid),json={"prioridad_id":3}).status_code==400

def test_filtrar_activas_respeta_propietario_y_estado_antes_de_paginar(client,crear_usuario):
    uid=crear_usuario();other=crear_usuario();staff=crear_usuario(rol_id=1)
    terminada=create(client,uid)["alerta_id"]
    assert close(client,uid,terminada).status_code==200
    activa=create(client,uid)["alerta_id"]
    create(client,other)
    propias=client.get(URL,headers=token(uid),params={"estado":"ACTIVA","usuario_id":other,"limit":1})
    assert propias.status_code==200
    assert [a["alerta_id"] for a in propias.json()]==[activa]
    historial=client.get(URL,headers=token(uid),params={"estado":"FINALIZADA"})
    assert [a["alerta_id"] for a in historial.json()]==[terminada]
    personal=client.get(URL,headers=token(staff),params={"estado":"ACTIVA","usuario_id":uid})
    assert [a["alerta_id"] for a in personal.json()]==[activa]
    assert client.get(URL,headers=token(uid),params={"estado":"OTRO"}).status_code==400

def test_cierre_propio_pin_hash_otra_familia_repeticion(client,db,crear_usuario):
    uid=crear_usuario();other=crear_usuario()
    alert=create(client,uid,ubicacion="Ficticia");aid=alert["alerta_id"]
    assert close(client,other,aid).status_code==404
    assert close(client,uid,aid,"9999").status_code==403
    assert close(client,uid,aid,"0007").json()["estado_alerta"]=="FINALIZADA"
    assert close(client,uid,aid).status_code==200
    assert db.execute("SELECT count(*) n FROM historial_alerta WHERE alerta_id=%s",(aid,)).fetchone()["n"]==2
    assert client.get(f"{URL}/{aid}",headers=token(other)).status_code==404

def test_parcial_pin_tutor_completo_pin_propio(client,db,crear_usuario):
    parent=crear_usuario();partial=crear_usuario(estado_id=2,parent=parent,pin=False)
    complete=crear_usuario(parent=parent)
    assert client.post(URL,headers=token(partial),json=body(mensaje="No permitido")).status_code==403
    aid=create(client,partial)["alerta_id"]
    assert close(client,parent,aid).status_code==200
    aid=create(client,complete)["alerta_id"]
    # El propio no se copia del principal: se sustituye por hash real de fixture completo (1234).
    db.execute("UPDATE pin SET pin_hash=(SELECT p.pin_hash FROM pin p JOIN usuario u USING(pin_id) WHERE u.nombre_usuario='Apadrinado Completo' AND u.usuario_principal_id IS NOT NULL LIMIT 1) WHERE pin_id=(SELECT pin_id FROM usuario WHERE usuario_id=%s)",(complete,))
    assert close(client,parent,aid).status_code==403
    assert close(client,complete,aid,"1234").status_code==200

def test_pin_limitado_persistente_y_configuracion_faltante(client,db,crear_usuario):
    uid=crear_usuario();aid=create(client,uid)["alerta_id"]
    for i in range(5):
        assert close(client,uid,aid,"9999").status_code==(429 if i==4 else 403)
    assert close(client,uid,aid).status_code==429
    db.execute("UPDATE pin SET bloqueado_hasta=clock_timestamp()-interval '1 second' WHERE pin_id=(SELECT pin_id FROM usuario WHERE usuario_id=%s)",(uid,))
    assert close(client,uid,aid).status_code==200
    no_pin=crear_usuario(estado_id=2,pin=False);aid=create(client,no_pin)["alerta_id"]
    r=close(client,no_pin,aid);assert r.status_code==409 and "configurar" in r.json()["message"]

def historical(db,uid,age):
    # Fecha histórica al INSERT: respeta la inmutabilidad de fecha_creacion.
    with db.transaction():
        detail=db.execute("INSERT INTO detalle_alerta(texto_mensaje) VALUES ('Fixture temporal') RETURNING detalle_alerta_id").fetchone()["detalle_alerta_id"]
        row=db.execute("INSERT INTO alerta(usuario_id,detalle_alerta_id,prioridad_id,clave_idempotencia,huella_solicitud,fecha_creacion) VALUES (%s,%s,3,%s,repeat('a',64),clock_timestamp()-%s::interval) RETURNING *",(uid,detail,uuid4(),age)).fetchone()
        db.execute("INSERT INTO historial_alerta(alerta_id,detalle_alerta_id,estado_actual,fecha_cambio_estado) VALUES (%s,%s,'ACTIVA',%s)",(row["alerta_id"],detail,row["fecha_creacion"]))
    return row["alerta_id"]

def test_24_horas_recuperacion_y_carrera_job_manual(client,db,crear_usuario):
    uid=crear_usuario();aid=historical(db,uid,"24 hours 1 second")
    def manual():
        with connect() as conn:
            return transaction(conn,lambda:alertas.cerrar(conn,uid,aid,"0007"))
    with ThreadPoolExecutor(2) as pool:
        a=pool.submit(manual);b=pool.submit(run_once);a.result();b.result()
    row=db.execute("SELECT * FROM alerta WHERE alerta_id=%s",(aid,)).fetchone()
    assert row["estado_alerta"]=="FINALIZADA"
    assert row["fecha_cierre"]>=row["fecha_creacion"]
    assert db.execute("SELECT count(*) n FROM historial_alerta WHERE alerta_id=%s AND estado_actual='FINALIZADA'",(aid,)).fetchone()["n"]==1
    no_pin=crear_usuario(estado_id=2,pin=False);aid2=historical(db,no_pin,"23 hours 59 minutes")
    run_once()
    assert db.execute("SELECT estado_alerta FROM alerta WHERE alerta_id=%s",(aid2,)).fetchone()["estado_alerta"]=="ACTIVA"
    no_pin2=crear_usuario(estado_id=2,pin=False);aid2=historical(db,no_pin2,"25 hours")
    # Mismo procedimiento que arranque recupera vencidas sin PIN, con zona horaria de sesión distinta.
    with connect() as conn:
        conn.execute("SET timezone='America/Santiago'")
        transaction(conn,lambda:alertas.finalizar_vencidas(conn))
    assert db.execute("SELECT estado_alerta FROM alerta WHERE alerta_id=%s",(aid2,)).fetchone()["estado_alerta"]=="FINALIZADA"

def test_sos_concurrente_unico_y_replay(client,db,crear_usuario):
    uid=crear_usuario();data=AlertaCrear(**body())
    def op():
        with connect() as conn:
            return transaction(conn,lambda:alertas.crear(conn,uid,data))
    with ThreadPoolExecutor(2) as pool:
        results=list(pool.map(lambda _:op(),range(2)))
    assert results[0]["alerta_id"]==results[1]["alerta_id"]
    assert db.execute("SELECT count(*) n FROM alerta WHERE usuario_id=%s",(uid,)).fetchone()["n"]==1

def test_borrado_lectura_historica_staff_left_join(client,db,crear_usuario):
    uid=crear_usuario();staff=crear_usuario(rol_id=2);aid=create(client,uid,ubicacion="Privada",mensaje="Privado")["alerta_id"]
    db.execute("DELETE FROM usuario WHERE usuario_id=%s",(uid,))
    r=client.get(f"{URL}/{aid}",headers=token(staff));assert r.status_code==200,r.text
    assert r.json()["usuario_id"] is None and r.json()["ubicacion"] is None
    assert r.json()["mensaje"]=="[Contenido eliminado]"


def test_snapshot_plantilla_no_cambia_al_editar_origen(client,db,crear_usuario):
    uid=crear_usuario()
    mid=db.execute("INSERT INTO usuario_mensaje_personalizado(mensaje) VALUES ('Texto original') RETURNING msj_personalizado_id").fetchone()["msj_personalizado_id"]
    db.execute("UPDATE usuario SET msj_personalizado_id=%s WHERE usuario_id=%s",(mid,uid))
    aid=create(client,uid)["alerta_id"]
    db.execute("UPDATE usuario_mensaje_personalizado SET mensaje='Texto cambiado' WHERE msj_personalizado_id=%s",(mid,))
    assert client.get(f"{URL}/{aid}",headers=token(uid)).json()["mensaje"]=="Texto original"


def test_cierre_encola_un_aviso_por_contacto_y_no_duplica_al_repetir(client,db,crear_usuario):
    uid=crear_usuario()
    db.execute("INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES (%s,'+56900000002','Segundo ficticio')",(uid,))
    aid=create(client,uid,prioridad_id=2)["alerta_id"]
    assert close(client,uid,aid,"9999").status_code==403
    assert db.execute("SELECT count(*) n FROM envio_alerta WHERE alerta_id=%s AND tipo_notificacion='FINALIZACION'",(aid,)).fetchone()["n"]==0
    result=close(client,uid,aid)
    assert result.status_code==200,result.text
    assert result.json()["whatsapp"]=={"pendientes":2,"enviados":0,"fallidos":0}
    assert result.json()["whatsapp_cierre"]=={"pendientes":2,"enviados":0,"fallidos":0}
    assert close(client,uid,aid).status_code==200
    assert db.execute("SELECT count(*) n FROM envio_alerta WHERE alerta_id=%s AND tipo_notificacion='FINALIZACION'",(aid,)).fetchone()["n"]==2


def test_cierre_automatico_encola_y_rollback_no_confirma_avisos(client,db,crear_usuario):
    uid=crear_usuario();aid=historical(db,uid,"25 hours")
    assert run_once()>=1
    assert run_once()>=0
    assert db.execute("SELECT count(*) n FROM envio_alerta WHERE alerta_id=%s AND tipo_notificacion='FINALIZACION'",(aid,)).fetchone()["n"]==1
    uid2=crear_usuario();aid2=create(client,uid2)["alerta_id"]
    class Revertir(Exception): pass
    try:
        with db.transaction():
            row=db.execute("SELECT * FROM alerta WHERE alerta_id=%s FOR UPDATE",(aid2,)).fetchone()
            alertas._finalizar(db,row)
            raise Revertir()
    except Revertir:
        pass
    assert db.execute("SELECT estado_alerta FROM alerta WHERE alerta_id=%s",(aid2,)).fetchone()["estado_alerta"]=="ACTIVA"
    assert db.execute("SELECT count(*) n FROM envio_alerta WHERE alerta_id=%s AND tipo_notificacion='FINALIZACION'",(aid2,)).fetchone()["n"]==0


def test_borrar_usuario_no_deja_avisos_de_cierre_pendientes(client,db,crear_usuario):
    uid=crear_usuario();aid=create(client,uid)["alerta_id"]
    db.execute("DELETE FROM usuario WHERE usuario_id=%s",(uid,))
    assert db.execute("SELECT count(*) n FROM envio_alerta WHERE alerta_id=%s AND estado_envio_id=1",(aid,)).fetchone()["n"]==0

def test_mensaje_puntual_maximo_160(client,crear_usuario):
    # CA-05.1: el texto enviado al emitir el SOS tiene el mismo máximo que el mensaje personalizado.
    uid=crear_usuario()
    assert client.post(URL,headers=token(uid),json=body(mensaje="a"*161)).status_code==400
    alerta=create(client,uid,mensaje="a"*160)
    assert alerta["mensaje"]=="a"*160
    assert close(client,uid,alerta["alerta_id"]).status_code==200


def test_sos_vincula_solo_el_antecedente_del_emisor(client,db,crear_usuario):
    parent=crear_usuario();child=crear_usuario(parent=parent)
    medical={}
    for uid in (parent,child):
        # No se descifra en FastAPI; esta prueba verifica propiedad y referencia.
        medical[uid]=db.execute("""INSERT INTO antecedente_medico(usuario_id,tipo_sangre,alergias,
            enfermedades_cronicas,medicamentos_actuales,discapacidad_presente,donante_organos)
            VALUES (%s,'fixture','fixture','fixture','fixture','fixture','fixture') RETURNING antecedente_medico_id""",(uid,)).fetchone()["antecedente_medico_id"]
    aid=create(client,child)["alerta_id"]
    ref=db.execute("SELECT d.antecedente_medico_id FROM alerta a JOIN detalle_alerta d USING(detalle_alerta_id) WHERE alerta_id=%s",(aid,)).fetchone()
    assert ref["antecedente_medico_id"]==medical[child]
    assert ref["antecedente_medico_id"]!=medical[parent]


def test_historico_persiste_estado_y_consultarlo_es_solo_lectura(client,db,crear_usuario):
    uid=crear_usuario();created=create(client,uid,prioridad_id=2,mensaje="Registro histórico")
    aid=created["alerta_id"]
    assert close(client,uid,aid).status_code==200
    with connect() as other:
        stored=alertas.obtener(other,aid)
        assert stored["estado_alerta"]=="FINALIZADA" and stored["fecha_cierre"] is not None
    before=db.execute("SELECT (SELECT count(*) FROM historial_alerta WHERE alerta_id=%s) AS historial,(SELECT count(*) FROM envio_alerta WHERE alerta_id=%s) AS envios",(aid,aid)).fetchone()
    for _ in range(2):
        detail=client.get(f"{URL}/{aid}",headers=token(uid))
        assert detail.status_code==200
        assert detail.json()["estado_alerta"]=="FINALIZADA"
        assert detail.json()["mensaje"]=="Registro histórico"
        assert detail.json()["fecha_creacion"]==created["fecha_creacion"]
        history=client.get(URL,headers=token(uid),params={"estado":"FINALIZADA"})
        assert [row["alerta_id"] for row in history.json()]==[aid]
    assert client.patch(f"{URL}/{aid}",headers=token(uid),json={"estado_alerta":"ACTIVA"}).status_code==405
    assert client.delete(f"{URL}/{aid}",headers=token(uid)).status_code==405
    after=db.execute("SELECT (SELECT count(*) FROM historial_alerta WHERE alerta_id=%s) AS historial,(SELECT count(*) FROM envio_alerta WHERE alerta_id=%s) AS envios",(aid,aid)).fetchone()
    assert before==after and after["historial"]==2
