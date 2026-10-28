"""Integración contra el único PostgreSQL de desarrollo. Ausencia de DB es fallo, no skip."""
import time
from uuid import uuid4
import jwt
import pytest
from fastapi.testclient import TestClient
from app.core.config import settings
from app.core.db import connect, get_db
from app.main import app

if settings.db_host == "db":
    settings.db_host, settings.db_port = "localhost", 5433

@pytest.fixture
def db():
    with connect() as conn:
        app.dependency_overrides[get_db] = lambda: conn
        try:
            yield conn
        finally:
            app.dependency_overrides.clear()

@pytest.fixture
def client(db):
    # Scheduler se verifica aparte; no compite con pruebas que preparan fechas.
    return TestClient(app)

def token(usuario_id: int, **changes) -> dict:
    payload = {"sub":usuario_id,"email":"test@emergen.test","iss":"emergen-api","aud":"emergen-web","exp":int(time.time())+3600} | changes
    return {"Authorization":"Bearer "+jwt.encode(payload, settings.jwt_secret, algorithm="HS256")}

@pytest.fixture
def crear_usuario(db):
    created = []
    def create(rol_id=3, estado_id=1, parent=None, plan=True, contacts=True, pin=True):
        pin_id = None
        if pin:
            pin_id=db.execute("INSERT INTO pin(pin_hash) SELECT p.pin_hash FROM pin p JOIN usuario u USING(pin_id) WHERE u.correo_usuario='admin@emergen.test' RETURNING pin_id").fetchone()["pin_id"]
        uid=db.execute("""INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,rol_id,estado_id,usuario_principal_id,pin_id)
            VALUES ('Pytest',%s,%s,%s,%s,%s,%s) RETURNING usuario_id""", (None if parent else "pytest."+uuid4().hex+"@emergen.test",None if parent else 'no-login',rol_id,estado_id,parent,pin_id)).fetchone()["usuario_id"]
        created.append(uid)
        if plan and parent is None:
            db.execute("INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES (%s,2,3)",(uid,))
        if contacts:
            db.execute("INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES (%s,'+56900000001','Ficticio pytest')",(uid,))
        return uid
    yield create
    for uid in reversed(created):
        rows=db.execute("SELECT alerta_id,detalle_alerta_id FROM alerta WHERE usuario_id=%s",(uid,)).fetchall()
        db.execute("DELETE FROM usuario WHERE usuario_id=%s",(uid,))
        for row in rows:
            for table in ("envio_alerta","enlace_medico","historial_alerta"):
                db.execute(f"DELETE FROM {table} WHERE alerta_id=%s",(row["alerta_id"],))
            db.execute("DELETE FROM alerta WHERE alerta_id=%s",(row["alerta_id"],))
            db.execute("DELETE FROM detalle_alerta WHERE detalle_alerta_id=%s",(row["detalle_alerta_id"],))
