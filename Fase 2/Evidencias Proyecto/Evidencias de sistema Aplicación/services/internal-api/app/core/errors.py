"""Errores con la misma forma que NestJS: {statusCode, message, error}.

El cliente compartido (packages/api-client/src/http.ts, ApiError) ya lee ese formato,
así que los frontends pueden consumir esta API sin cambios.
"""

import logging
import psycopg
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

logger = logging.getLogger("internal-api")


def _body(status: int, message: str | list[str]) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"statusCode": status, "message": message, "error": HTTPStatus(status).phrase},
    )


async def _http_error(_: Request, exc: HTTPException) -> JSONResponse:
    return _body(exc.status_code, str(exc.detail))


async def _validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    # Lista de mensajes, como ValidationPipe de NestJS.
    msgs = []
    for e in exc.errors():
        campo = ".".join(str(p) for p in e["loc"][1:])
        msgs.append(f"{campo}: {e['msg']}" if campo else e["msg"])
    return _body(400, msgs)


async def _unhandled_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Error no controlado en %s %s", request.method, request.url.path)
    return _body(500, "Internal server error")


async def _postgres_error(_: Request, exc: psycopg.Error) -> JSONResponse:
    if exc.sqlstate in ("23503", "23505", "23514", "23001", "23502", "22001", "22P02"):
        return _body(409, "La operación contradice una regla de integridad o referencia")
    if exc.sqlstate in ("40001", "40P01") or isinstance(exc, psycopg.OperationalError):
        return _body(503, "La operación no se completó; vuelve a intentarlo")
    logger.error("Error PostgreSQL: %s", exc.sqlstate)
    return _body(500, "Internal server error")


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(psycopg.Error, _postgres_error)
    app.add_exception_handler(HTTPException, _http_error)
    app.add_exception_handler(RequestValidationError, _validation_error)
    app.add_exception_handler(Exception, _unhandled_error)
