"""Finite request stream/structure; no quota shared with emergency operations."""
import json
from starlette.responses import JSONResponse


def structure_ok(value, depth=8, nodes=1024):
    pending = [(value, 0)]
    count = 0
    while pending:
        item, level = pending.pop()
        count += 1
        if count > nodes or level > depth:
            return False
        if isinstance(item, dict):
            if len(item) > 128 or any(k in ("__proto__", "prototype", "constructor") for k in item):
                return False
            pending.extend((v, level + 1) for v in item.values())
        elif isinstance(item, list):
            if len(item) > 100:
                return False
            pending.extend((v, level + 1) for v in item)
    return True


class RequestBounds:
    def __init__(self, app, max_bytes=16384):
        self.app, self.max_bytes = app, max_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        async def reject(code, message):
            await JSONResponse({"statusCode": code, "message": message, "error": "Request rejected"}, status_code=code)(scope, receive, secure_send)

        async def secure_send(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers += [(b"x-content-type-options", b"nosniff"), (b"referrer-policy", b"no-referrer"),
                            (b"x-frame-options", b"DENY"), (b"cache-control", b"no-store")]
                if scope.get("scheme") == "https":
                    headers.append((b"strict-transport-security", b"max-age=31536000"))
                message = {**message, "headers": headers}
            await send(message)

        query = scope.get("query_string", b"")
        if len(scope.get("raw_path", b"")) + len(query) > 4096 or query.count(b"&") >= 32:
            return await reject(414, "URL o consulta demasiado extensa")
        body = bytearray()
        while True:
            event = await receive()
            if event["type"] == "http.disconnect":
                return
            body.extend(event.get("body", b""))
            if len(body) > self.max_bytes:
                return await reject(413, "Cuerpo de solicitud demasiado grande")
            if not event.get("more_body", False):
                break
        if body:
            content_type = dict(scope.get("headers", [])).get(b"content-type", b"").split(b";")[0].lower()
            if content_type != b"application/json" and not (content_type.startswith(b"application/") and content_type.endswith(b"+json")):
                return await reject(415, "Usa application/json")
            try:
                parsed = json.loads(body)
                if not isinstance(parsed, (dict, list)) or not structure_ok(parsed):
                    raise ValueError()
            except (ValueError, UnicodeError, RecursionError):
                return await reject(400, "JSON inválido o estructura no admitida")
        delivered = False

        async def replay():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": bytes(body), "more_body": False}
            return await receive()

        await self.app(scope, replay, secure_send)
