import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import internal_v1
from app.core.config import settings
from app.core.scheduler import lifespan
from app.core.errors import register_error_handlers
from app.api.health import router as health_router
from app.core.security import RequestBounds

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s [%(name)s] %(message)s")

docs = settings.docs_enabled
app = FastAPI(
    lifespan=lifespan,
    title="EMERGEN internal-api",
    version="0.1.0",
    description="APIs internas de EMERGEN. Ver readme.apis.internas.md en la raíz del monorepo.",
    docs_url="/docs" if docs else None,
    redoc_url="/redoc" if docs else None,
    openapi_url="/openapi.json" if docs else None,
)

app.add_middleware(RequestBounds, max_bytes=settings.max_body_bytes)
if settings.cors_list:
    app.add_middleware(CORSMiddleware, allow_origins=settings.cors_list, allow_methods=["*"], allow_headers=["*"])

register_error_handlers(app)
app.include_router(internal_v1)
app.include_router(health_router)


@app.get("/health", tags=["técnico"])
def health() -> dict[str, str]:
    return {"status": "ok"}
