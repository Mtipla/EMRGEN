import re
import bcrypt
from fastapi import HTTPException

def verify_pin(pin: str, hashed: str) -> bool:
    """Verifica bcrypt $2a/$2b de Nest sin procesos, shell o archivos del host."""
    if not isinstance(pin, str) or not re.fullmatch(r"[0-9]{4}", pin):
        return False
    try:
        return bcrypt.checkpw(pin.encode("ascii"), hashed.encode("ascii"))
    except (AttributeError, UnicodeError, ValueError, TypeError) as exc:
        raise HTTPException(503, "Verificación de PIN no disponible") from exc
