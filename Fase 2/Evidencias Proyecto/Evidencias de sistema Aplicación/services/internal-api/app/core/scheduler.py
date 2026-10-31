"""Recuperación al arrancar y revisión periódica; sin temporizadores en el navegador."""
import asyncio
import logging
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.db import connect, transaction
from app.services.alertas import finalizar_vencidas

logger = logging.getLogger("internal-api.scheduler")

def run_once() -> int:
    with connect() as conn:
        return transaction(conn, lambda: finalizar_vencidas(conn))

async def loop(stop: asyncio.Event):
    while not stop.is_set():
        try:
            count = await asyncio.to_thread(run_once)
            if count:
                logger.info("Alertas vencidas finalizadas: %d", count)
        except Exception:
            logger.error("expiry_job_failed; se reintentará")
        try:
            await asyncio.wait_for(stop.wait(), timeout=settings.intervalo_cierre_segundos)
        except asyncio.TimeoutError:
            pass

@asynccontextmanager
async def lifespan(app):
    stop = asyncio.Event()
    task = asyncio.create_task(loop(stop))
    try:
        yield
    finally:
        stop.set()
        await task
