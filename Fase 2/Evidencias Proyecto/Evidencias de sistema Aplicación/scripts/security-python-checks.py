"""Standalone, never pytest conftest/local DB; only security-db-check synthetic environment."""
import os
import asyncio
import json
import time
import uuid
import hashlib
import socket

assert os.environ.get('SECURITY_ISOLATED_DB') == '1'
assert os.environ.get('EMERGEN_ENVIRONMENT') == 'test'
assert os.environ.get('DB_HOST') == '127.0.0.1' and os.environ.get('DB_PORT') == '55439'
assert os.environ.get('DB_NAME') == 'emergen_security_test'
original_connect = socket.socket.connect

def guarded_connect(self, destination):
    # Windows asyncio uses a private loopback socketpair; existing service ports stay blocked.
    if not isinstance(destination, tuple) or destination[0] not in ('127.0.0.1', '::1') or destination[1] < 10000:
        raise RuntimeError('Network destination blocked')
    return original_connect(self, destination)

socket.socket.connect = guarded_connect
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'services' / 'internal-api'))
import jwt
import httpx
from app.core.config import settings
settings.docs_enabled = False
from app.core.db import connect, transaction
from app.core.security import RequestBounds, structure_ok
from app.core.limite import LimiteVentana
from app.services import alertas
from app.main import app


def headers(user):
    token = jwt.encode({'sub': user, 'exp': int(time.time()) + 600, 'iss': 'emergen-api', 'aud': 'emergen-web'},
                       os.environ['JWT_SECRET'], algorithm='HS256')
    return {'Authorization': 'Bearer ' + token}


async def main():
    with connect() as conn:
        child = conn.execute('SELECT usuario_id FROM usuario WHERE usuario_principal_id=900001').fetchone()['usuario_id']
        conn.execute('INSERT INTO contacto_emergencia(nombre_contacto,num_emergencia,usuario_id) VALUES(%s,%s,%s)',
                     ('Synthetic', '+12025550124', child))
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://synthetic.invalid') as client:
        # Six finite SOS requests. Main and partial profiles; no dispatcher/transport exists here.
        body = {'clave_idempotencia': str(uuid.uuid4()), 'prioridad_id': 1, 'ubicacion': 'synthetic GPS placeholder'}
        first = await client.post('/internal/v1/alertas', json=body, headers=headers(900001))
        assert first.status_code == 201, 'SOS creation contract'
        aid = first.json()['alerta_id']
        replay = await client.post('/internal/v1/alertas', json=body, headers=headers(900001))
        assert replay.json()['alerta_id'] == aid, 'idempotency contract'
        active = await client.post('/internal/v1/alertas', json={**body, 'clave_idempotencia': str(uuid.uuid4())}, headers=headers(900001))
        assert active.status_code == 409, 'one active contract'
        closed = await client.post(f'/internal/v1/alertas/{aid}/cerrar', json={'pin': '4826'}, headers=headers(900001))
        assert closed.status_code == 200 and closed.json()['estado_alerta'] == 'FINALIZADA', 'closure contract'
        partial = await client.post('/internal/v1/alertas', json={'clave_idempotencia': str(uuid.uuid4()), 'prioridad_id': 1}, headers=headers(child))
        assert partial.status_code == 201 and partial.json()['ubicacion'] is None, 'partial/no-GPS contract'
        closed_partial = await client.post(f"/internal/v1/alertas/{partial.json()['alerta_id']}/cerrar", json={'pin': '4826'}, headers=headers(child))
        assert closed_partial.status_code == 200, 'partial effective principal PIN'
        print('FastAPI SOS: 6 sequential contracts PASS; queue only, no delivery')

        ticket = await client.post('/internal/v1/tickets-soporte', json={'descripcion': 'Synthetic ticket', 'categoria_id': 1}, headers=headers(900001))
        assert ticket.status_code == 201, 'ticket creation'
        tid = ticket.json()['ticket_id']
        own = await client.get(f'/internal/v1/tickets-soporte/{tid}', headers=headers(900001))
        assert own.status_code == 200, 'own ticket'
        staff = await client.patch(f'/internal/v1/tickets-soporte/{tid}', json={'solucion': 'Synthetic solution', 'estado': 'RESUELTO'}, headers=headers(900005))
        assert staff.status_code == 200, 'permitted staff transition'
        contact = await client.post('/internal/v1/mensajes-contacto', json={'nombre': 'Synthetic', 'correo': 'contact@example.invalid', 'mensaje': 'Synthetic contact', 'tipo_id': 1})
        assert contact.status_code == 201, 'public contact'
        assert (await client.get('/health/ready')).status_code == 200, 'readiness'
        assert (await client.get('/docs')).status_code == 404, 'documentation off'
        assert not any(getattr(route, 'path', '') in ('/docs', '/redoc', '/openapi.json', '/docs/oauth2-redirect') for route in app.routes)
        print('FastAPI support/contact/health/docs: 6 sequential contracts PASS')

    # Expiration on a deliberately historical fixture in the disposable DB, no clock waiting.
    with connect() as conn:
        with conn.transaction():
            detail = conn.execute('INSERT INTO detalle_alerta(texto_mensaje) VALUES(%s) RETURNING detalle_alerta_id', ('Synthetic old alert',)).fetchone()['detalle_alerta_id']
            conn.execute("INSERT INTO alerta(usuario_id,detalle_alerta_id,prioridad_id,clave_idempotencia,huella_solicitud,fecha_creacion) VALUES(900001,%s,1,%s,%s,clock_timestamp()-interval '25 hours')", (detail, uuid.uuid4(), hashlib.sha256(b'synthetic').hexdigest()))
        assert transaction(conn, lambda: alertas.finalizar_vencidas(conn)) == 1, 'expiry contract'
    print('SOS historical expiration: PASS')

    # Tiny actual streams; no large input or load.
    async def check_stream(chunks):
        result = []
        queue = [{'type': 'http.request', 'body': chunk, 'more_body': i < len(chunks)-1} for i, chunk in enumerate(chunks)]
        async def receive(): return queue.pop(0) if queue else {'type': 'http.disconnect'}
        async def send(message): result.append(message)
        async def terminal(scope, receive, send):
            await receive()
            await send({'type': 'http.response.start', 'status': 200, 'headers': []})
            await send({'type': 'http.response.body', 'body': b'{}'})
        await RequestBounds(terminal, max_bytes=12)({'type': 'http', 'method': 'POST', 'path': '/', 'raw_path': b'/',
          'query_string': b'', 'headers': [(b'content-type', b'application/json')], 'scheme': 'http'}, receive, send)
        return next(m['status'] for m in result if m['type'] == 'http.response.start')
    assert await check_stream([b'{"x":1}']) == 200
    assert await check_stream([b'{"x":"', b'a' * 10, b'"}']) == 413
    assert not structure_ok({'x': {'y': {}}}, depth=1)
    print('FastAPI input: 3 minimal cases PASS')
    now = [0.0]
    budget = LimiteVentana(1, 1, capacidad=1, reloj=lambda: now[0])
    assert budget.permitir('synthetic')
    assert not budget.permitir('synthetic')
    now[0] = 2.0
    assert budget.permitir('synthetic')
    print('FastAPI limiter: 3 fake-clock calls PASS')

asyncio.run(main())
