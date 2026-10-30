"""Límite de peticiones por clave (IP) en ventana deslizante, en memoria del proceso."""
import threading
import time
from collections import defaultdict, deque


class LimiteVentana:
    # shortcut: memoria de un solo proceso; con varios workers o réplicas, cada uno cuenta aparte (usar Redis si se escala).
    def __init__(self, maximo: int, segundos: int, capacidad: int = 10000, reloj=time.monotonic):
        self.maximo, self.segundos = maximo, segundos
        self.capacidad, self._reloj = capacidad, reloj
        self._usos: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def permitir(self, clave: str) -> bool:
        """Registra el uso y devuelve False si la clave ya agotó su cupo en la ventana."""
        ahora = self._reloj()
        with self._lock:
            # Finite cardinality and TTL, including IPs that never return.
            for key in list(self._usos):
                queue = self._usos[key]
                while queue and ahora - queue[0] >= self.segundos:
                    queue.popleft()
                if not queue:
                    del self._usos[key]
            if clave not in self._usos and len(self._usos) >= self.capacidad:
                return False
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
