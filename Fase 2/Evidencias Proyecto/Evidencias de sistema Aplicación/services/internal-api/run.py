"""Mismo arranque en local y hosting: respeta PORT del proveedor y INTERNAL_API_PORT."""
import os
import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=os.environ.get("HOST", "0.0.0.0"), port=settings.port)
