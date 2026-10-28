import json
import subprocess
from fastapi import HTTPException
from app.core.config import MONOREPO_DIR

def verify_pin(pin: str, hashed: str) -> bool:
    """Comparte bcrypt 6 del lockfile Nest; no añade otra implementación criptográfica."""
    try:
        result = subprocess.run(["node", str(MONOREPO_DIR / "scripts" / "pin-bcrypt.cjs")],
            input=json.dumps({"pin": pin, "hash": hashed}),
            text=True, capture_output=True, timeout=10, check=True)
        return json.loads(result.stdout) is True
    except (OSError, subprocess.SubprocessError, ValueError) as exc:
        raise HTTPException(503, "Verificación de PIN no disponible") from exc
