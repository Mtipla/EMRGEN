"""Límite de peticiones por clave (IP) en ventana deslizante, en memoria del proceso."""
import threading
import time
from collections import defaultdict, deque


class LimiteVentana:
    # shortcut: memoria de un solo proceso; con varios workers o réplicas, cada uno cuenta aparte (usar Redis si se escala).
    def __init__(self, maximo: int, segundos: int):
        self.maximo, self.segundos = maximo, segundos
        self._usos: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def permitir(self, clave: str) -> bool:
        """Registra el uso y devuelve False si la clave ya agotó su cupo en la ventana."""
        ahora = time.monotonic()
        with self._lock:
            usos = self._usos[clave]
            while usos and ahora - usos[0] >= self.segundos:
                usos.popleft()
            if len(usos) >= self.maximo:
                return False
            usos.append(ahora)
            return True

    def reiniciar(self) -> None:
        with self._lock:
            self._usos.clear()
