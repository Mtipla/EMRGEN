# internal-api (FastAPI)

Servicio FastAPI para SOS y soporte en /internal/v1, como proceso local o servicio internal-api de Compose, sobre el mismo PostgreSQL que NestJS. Contrato: [readme.apis.internas.md](../../readme.apis.internas.md).

Requiere Python 3.12 y requirements.txt para desarrollo. El verificador usa bcrypt Python 5.0.0 y admite los hashes producidos por Nest/bcrypt 6; no necesita Node ni scripts/pin-bcrypt.cjs dentro de FastAPI. La imagen Linux/Python 3.12 instala locks/requirements-linux-py312.lock con --require-hashes; se regenera con Dockerfile.lock, no congelando el venv Windows.

Desde esta carpeta (services/internal-api), crear el venv propio solo si falta y actualizar sus requisitos también después de incorporar cambios:

```powershell
if (-not (Test-Path -LiteralPath '.\.venv\Scripts\python.exe')) {
    python -m venv .venv
}
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Alternativa con activación en PowerShell: .\.venv\Scripts\Activate.ps1 y luego python -m pip install -r requirements.txt desde esta misma carpeta. Si la activación está bloqueada, usar el intérprete directo anterior; no cambiar políticas globales. No copiar .venv ni instalar globalmente.

requirements.txt corresponde al desarrollo local Windows/Python 3.12 e incluye pruebas; el lock con hashes corresponde al runtime Linux/Python 3.12 usado por Docker. En un venv propio Linux: source .venv/bin/activate y python -m pip install --require-hashes -r locks/requirements-linux-py312.lock. No aplicar ese lock a Windows. scripts/pin-bcrypt.cjs se conserva como legado sin consumidores de código actuales, fuera de FastAPI.

Arranque local sobre el Compose existente:

```powershell
$env:DB_HOST = 'localhost'
$env:DB_PORT = '5433'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host localhost --port 8000
```

DB_USER/DB_PASSWORD/DB_NAME/JWT_SECRET se leen de la configuración local existente. No copiarlos a código ni registros. `GET /health` comprueba el proceso; una petición autenticada comprueba además la conexión a BD. `/docs`, `/redoc` y `/openapi.json` se pueden desactivar con INTERNAL_API_DOCS_ENABLED=false.

El móvil y la web necesitan CORS para consultar, emitir y cerrar SOS desde el navegador. El servicio reutiliza `CORS_ORIGINS` del monorepo; `INTERNAL_API_CORS_ORIGINS` permite una lista propia con prioridad sobre la compartida. Sin configuración se autorizan `http://localhost:5173`, `http://localhost:5174` y `http://localhost:5175`. Para un dispositivo físico o Capacitor agrega su origen explícito a la lista y reinicia FastAPI. No se usa un comodín para los orígenes.

El ciclo de vida de FastAPI ejecuta el cierre de alertas vencidas al arrancar y cada 30 segundos. INTERNAL_API_INTERVALO_CIERRE_SEGUNDOS permite 1–300 segundos; el cierre usa 24 horas transcurridas y hora real, no temporizadores del navegador. Varias instancias usan bloqueos de fila/SKIP LOCKED; en desarrollo se mantiene una sola.

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Las pruebas requieren PostgreSQL y los fixtures base de README_BDD. Usan transacciones reales y cuentas temporales; la falta de BD es fallo. Ejecutarlas secuencialmente respecto de las suites Nest; la prueba del último administrador restaura roles en finally. No cargar `sql/001_catalogos_soporte.sql`: es histórico, el init vigente contiene los catálogos.

El arranque manual local no añade un servicio a Docker. Para disponibilidad de cierre automático, este proceso debe permanecer encendido; al volver a iniciarlo recupera las vencidas.

Crear un SOS también vincula la ficha médica del emisor y registra un `ENVIO_ALERTA` pendiente de `ACTIVACION` por contacto en la misma transacción. Al pasar a `FINALIZADA`, un trigger encola un aviso de `FINALIZACION` por contacto; funciona con cierre manual y automático. NestJS consume esa cola y despacha por WhatsApp el tipo de emergencia, el mensaje, la ubicación y los antecedentes médicos descifrados al activar, y el texto de cierre al finalizar. Las respuestas SOS incluyen los contadores `{pendientes, enviados, fallidos}` en `whatsapp` y `whatsapp_cierre`. Las instalaciones existentes necesitan la configuración de cifrado y las migraciones documentadas en [SOS por WhatsApp](../../docs/WHATSAPP_SOS.md).

El histórico ya se conserva en PostgreSQL: `GET /internal/v1/alertas` incluye las alertas finalizadas al omitir el filtro `estado`; `GET /internal/v1/alertas/{id}` devuelve el estado persistido. Son consultas informativas de solo lectura. Cerrar un SOS actualiza el mismo registro y conserva sus transiciones en `historial_alerta`; reiniciar la API no borra ese historial.

Para consultar desde Swagger, abre `http://localhost:8000/docs`, pulsa **Authorize** y pega únicamente el JWT `access_token` de NestJS, sin `Bearer` ni comillas. Confirma **Authorize → Close** y ejecuta el GET. El esquema `SesionEMERGEN` añade la cabecera automáticamente. Si tenías Swagger abierto antes de este cambio, usa **Ctrl+F5**.

Producción/staging exige DB_SSLMODE explícito y CA si verify-full. Docs está desactivado por defecto en distribución. Los límites/slots y pasos operativos están en [OPERACION_SEGURA.md](../../docs/OPERACION_SEGURA.md). No ejecutar pytest completo sobre la BD local para verificar cambios: python-config y los casos aislados registrados no usan conftest ni .env.
