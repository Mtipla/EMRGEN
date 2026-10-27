"""Carreras con conexiones PostgreSQL independientes; transacciones y barreras reales."""
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier, Event
from time import monotonic, sleep
from uuid import uuid4
import psycopg
import pytest
from app.core.db import connect, transaction
from app.services.alertas import _finalizar
from tests.test_alertas import create

def race(operations):
    start=Barrier(len(operations))
    def run(op):
        with connect() as conn:
            start.wait(timeout=5)
            try:
                return transaction(conn,lambda:op(conn))
            except psycopg.Error as error:
                return error.sqlstate
    with ThreadPoolExecutor(len(operations)) as pool:
        return list(pool.map(run,operations))

def test_ultimo_cupo(db,crear_usuario):
    uid=crear_usuario()
    db.execute("UPDATE plan_usuario SET cupos_apadrinados_adq=1 WHERE usuario_id=%s",(uid,))
    def insert(conn):
        conn.execute("INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,usuario_principal_id,estado_id) VALUES ('Carrera',%s,'test',%s,2)",("race."+uuid4().hex+"@emergen.test",uid))
        return "ok"
    try:
        assert sorted(race([insert,insert]))==["23514","ok"]
        assert db.execute("SELECT count(*) n FROM usuario WHERE usuario_principal_id=%s",(uid,)).fetchone()["n"]==1
    finally:
        db.execute("DELETE FROM usuario WHERE usuario_principal_id=%s",(uid,))

def test_maximo_y_ultimo_contacto(db,crear_usuario):
    uid=crear_usuario()
    for n in range(2,5):
        db.execute("INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES (%s,%s,'Ficticio')",(uid,f"+5690000000{n}"))
    def insert(number):
        return lambda conn: (conn.execute("INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES (%s,%s,'Carrera')",(uid,number)),"ok")[1]
    assert sorted(race([insert("+56900000005"),insert("+56900000006")]))==["23514","ok"]
    rows=db.execute("SELECT contacto_emergencia_id FROM contacto_emergencia WHERE usuario_id=%s ORDER BY 1",(uid,)).fetchall()
    for row in rows[2:]:
        db.execute("DELETE FROM contacto_emergencia WHERE contacto_emergencia_id=%s",(row["contacto_emergencia_id"],))
    def delete(cid):
        return lambda conn: (conn.execute("DELETE FROM contacto_emergencia WHERE contacto_emergencia_id=%s",(cid,)),"ok")[1]
    assert sorted(race([delete(row["contacto_emergencia_id"]) for row in rows[:2]]))==["23514","ok"]
    assert db.execute("SELECT count(*) n FROM contacto_emergencia WHERE usuario_id=%s",(uid,)).fetchone()["n"]==1

@pytest.mark.parametrize("operation",["rol","delete"])
def test_dos_bajas_ultimo_administrador(db,crear_usuario,operation):
    originals=[r["usuario_id"] for r in db.execute("SELECT usuario_id FROM usuario WHERE rol_id=1").fetchall()]
    a=crear_usuario(rol_id=1);b=crear_usuario(rol_id=1)
    try:
        db.execute("UPDATE usuario SET rol_id=3 WHERE usuario_id=ANY(%s)",(originals,))
        def demote(uid):
            return lambda conn: (conn.execute("UPDATE usuario SET rol_id=3 WHERE usuario_id=%s" if operation=="rol" else "DELETE FROM usuario WHERE usuario_id=%s",(uid,)),"ok")[1]
        assert sorted(race([demote(a),demote(b)]))==["23514","ok"]
        assert db.execute("SELECT count(*) n FROM usuario WHERE rol_id=1").fetchone()["n"]==1
    finally:
        db.execute("UPDATE usuario SET rol_id=1 WHERE usuario_id=ANY(%s)",(originals,))

@pytest.mark.parametrize("operation",["envio","enlace"])
@pytest.mark.parametrize("ending",["cierre","borrado"])
def test_insert_compite_con_cierre_o_borrado(client,db,crear_usuario,operation,ending):
    uid=crear_usuario();aid=create(client,uid)["alerta_id"]
    # Esta prueba prepara un envío nuevo que compite con el cierre/borrado;
    # elimina primero el envío que ahora registra automáticamente la creación del SOS.
    if operation=="envio":
        db.execute("DELETE FROM envio_alerta WHERE alerta_id=%s",(aid,))
    cid=db.execute("SELECT contacto_emergencia_id FROM contacto_emergencia WHERE usuario_id=%s",(uid,)).fetchone()["contacto_emergencia_id"]
    waiting=Event();pid=[]
    def insert():
        with connect() as other:
            pid.append(other.info.backend_pid);waiting.set()
            try:
                with other.transaction():
                    other.execute("SET LOCAL lock_timeout='5s'")
                    if operation=="envio":
                        other.execute("INSERT INTO envio_alerta(alerta_id,contacto_emergencia_id) VALUES (%s,%s)",(aid,cid))
                    else:
                        other.execute("INSERT INTO enlace_medico(alerta_id,token_hash,fecha_expiracion) VALUES (%s,%s,clock_timestamp()+interval '1 hour')",(aid,uuid4().hex+uuid4().hex))
                return "ok"
            except psycopg.Error as error:
                return error.sqlstate
    with ThreadPoolExecutor(1) as pool:
        with connect() as owner:
            with owner.transaction():
                row=owner.execute("SELECT * FROM alerta WHERE alerta_id=%s FOR UPDATE",(aid,)).fetchone()
                future=pool.submit(insert)
                assert waiting.wait(5)
                deadline=monotonic()+3
                while monotonic()<deadline:
                    wait=db.execute("SELECT wait_event_type FROM pg_stat_activity WHERE pid=%s",(pid[0],)).fetchone()
                    if wait and wait["wait_event_type"]=="Lock":
                        break
                    sleep(0.01)
                else:
                    raise AssertionError("La segunda conexión no llegó al bloqueo esperado")
                if ending=="cierre":
                    _finalizar(owner,row)
                else:
                    owner.execute("DELETE FROM usuario WHERE usuario_id=%s",(uid,))
            assert future.result(timeout=6)=="23514"
    table="envio_alerta" if operation=="envio" else "enlace_medico"
    filtro=" AND tipo_notificacion='ACTIVACION'" if operation=="envio" else ""
    assert db.execute(f"SELECT count(*) n FROM {table} WHERE alerta_id=%s{filtro}",(aid,)).fetchone()["n"]==0

def test_insert_antes_de_cierre_revoca_enlace(client,db,crear_usuario):
    uid=crear_usuario();aid=create(client,uid)["alerta_id"]
    db.execute("INSERT INTO enlace_medico(alerta_id,token_hash,fecha_expiracion) VALUES (%s,%s,clock_timestamp()+interval '1 hour')",(aid,uuid4().hex+uuid4().hex))
    with db.transaction():
        row=db.execute("SELECT * FROM alerta WHERE alerta_id=%s FOR UPDATE",(aid,)).fetchone()
        _finalizar(db,row)
    assert db.execute("SELECT fecha_revocacion FROM enlace_medico WHERE alerta_id=%s",(aid,)).fetchone()["fecha_revocacion"] is not None

@pytest.mark.parametrize("mode",["serializable","deadlock"])
def test_reintento_transaccion_completa_real(db,crear_usuario,mode):
    ids=[crear_usuario(),crear_usuario()];barrier=Barrier(2);attempts=[0,0]
    def worker(index):
        with connect() as conn:
            def action():
                attempts[index]+=1
                if mode=="serializable":
                    conn.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
                    conn.execute("SELECT nombre_usuario FROM usuario WHERE usuario_id=%s",(ids[0],)).fetchone()
                    if attempts[index]==1:
                        barrier.wait(5)
                    conn.execute("UPDATE usuario SET nombre_usuario=nombre_usuario||'x' WHERE usuario_id=%s",(ids[0],))
                else:
                    conn.execute("SELECT 1 FROM usuario WHERE usuario_id=%s FOR UPDATE",(ids[index],))
                    if attempts[index]==1:
                        barrier.wait(5)
                    conn.execute("UPDATE usuario SET nombre_usuario=nombre_usuario||'x' WHERE usuario_id=%s",(ids[1-index],))
                return "ok"
            return transaction(conn,action)
    with ThreadPoolExecutor(2) as pool:
        assert list(pool.map(worker,range(2)))==["ok","ok"]
    assert sum(attempts)>=3
    if mode=="serializable":
        assert db.execute("SELECT nombre_usuario FROM usuario WHERE usuario_id=%s",(ids[0],)).fetchone()["nombre_usuario"]=="Pytestxx"

def test_ventas_concurrentes_total_al_commit(db,crear_usuario):
    uid=crear_usuario()
    with db.transaction():
        sid=db.execute("INSERT INTO venta(usuario_id,metodo_pago_id,estado_pago_id,total_venta) VALUES (%s,1,1,1000) RETURNING venta_id",(uid,)).fetchone()["venta_id"]
        db.execute("INSERT INTO detalle_venta(venta_id,plan_id,tipo_compra,cantidad,precio_uni,cupos_otorgados) VALUES (%s,2,'CUPOS',1,1000,1)",(sid,))
    def update(price):
        def action(conn):
            # Cada operación toma la cabecera primero; el total se verifica al COMMIT.
            conn.execute("UPDATE venta SET total_venta=%s WHERE venta_id=%s",(price,sid))
            conn.execute("UPDATE detalle_venta SET precio_uni=%s WHERE venta_id=%s",(price,sid))
            return "ok"
        return action
    try:
        assert race([update(2000),update(3000)])==["ok","ok"]
        row=db.execute("SELECT v.total_venta,sum(d.cantidad*d.precio_uni)::int total FROM venta v JOIN detalle_venta d USING(venta_id) WHERE venta_id=%s GROUP BY v.total_venta",(sid,)).fetchone()
        assert row["total_venta"]==row["total"]
    finally:
        db.execute("DELETE FROM venta WHERE venta_id=%s",(sid,))
