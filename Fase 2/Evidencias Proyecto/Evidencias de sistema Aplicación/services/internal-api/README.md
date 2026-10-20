# internal-api (FastAPI)

Servicio Python independiente para las APIs internas de EMERGEN. Contrato, convenciones y estado de cada API: [../../readme.apis.internas.md](../../readme.apis.internas.md).

Está **fuera** de `apps/*` y `packages/*` a propósito: npm workspaces, Turborepo, `turbo prune` y el `Dockerfile` del backend no lo ven, así que `npm ci`, `npx turbo run build` y `docker compose up` siguen igual.

## Requisitos

Python 3.12 o superior (probado con 3.14.7). No necesita Node.

## Primera vez (PowerShell, desde esta carpeta)

```powershell
Set-Location -LiteralPath ".\services\internal-api"   # desde la raíz del monorepo
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
Copy-Item .env.example .env                           # opcional: los valores por defecto sirven en desarrollo
```

## Ejecutar

```powershell
.\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

| URL | Qué es |
|---|---|
| `http://localhost:8000/health` | Estado del servicio → `{"status":"ok"}` |
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/redoc` | ReDoc |
| `http://localhost:8000/openapi.json` | Esquema OpenAPI 3.1 |

Necesita el PostgreSQL de `docker compose` encendido (`localhost:5433`) y los catálogos de soporte cargados una vez (comando en `sql/001_catalogos_soporte.sql`).

## Pruebas

```powershell
.\.venv\Scripts\python -m pytest -q
```

Corren contra el PostgreSQL real dentro de una transacción que se revierte: no dejan datos. Si la BD está apagada, los tests que la usan se omiten.

## Estructura

```
app/
├── main.py                    → crea la app, CORS opcional, /health, monta /internal/v1
├── core/config.py             → variables (propias INTERNAL_API_* y compartidas DB_*, JWT_SECRET)
├── core/db.py                 → conexión/transacción por petición y generación de IDs
├── core/errors.py             → errores con el formato de NestJS {statusCode, message, error}
├── dependencies/auth.py       → sesión: JWT de NestJS + usuario y rol desde la BD
├── schemas/                   → modelos Pydantic de entrada y salida
├── services/                  → SQL de cada API
└── api/routes/                → alertas.py, tickets_soporte.py (montados en __init__.py)
sql/001_catalogos_soporte.sql  → catálogos ESTADO_TICKET y CATEGORIA_SOPORTE
tests/                         → health, auth, alertas, tickets
```
