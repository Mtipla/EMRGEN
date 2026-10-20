# APIs internas del proyecto

Las **APIs internas** son las que construye el equipo de EMERGEN. Las **APIs externas** son servicios de terceros que el backend consume (PayPal, Firebase, Google Maps, jsReport, mindicador, WhatsApp); su guía está en [readme-apis.md](readme-apis.md).

Existen dos backends propios:

| Servicio | Tecnología | Carpeta | Puerto | Rol |
|---|---|---|---|---|
| Backend principal | NestJS 12 + TypeORM | `apps/backend` | 3000 local / 3001 Docker | Login, usuarios, admin, compras, auditoría e integraciones externas. **No cambia.** |
| internal-api | FastAPI (Python) | `services/internal-api` | 8000 | Alertas de emergencia y tickets de soporte bajo `/internal/v1/`. |

## Objetivo

Agregar APIs nuevas en un servicio aislado, sin modificar el backend NestJS, los frontends ni la base de datos existente.

## Convención de rutas

```
/internal/v1/<recurso>
```

- `internal` deja claro que la ruta pertenece a internal-api y no al backend NestJS, cuyas rutas no llevan prefijo (`/usuarios`, `/admin/...`, `/compras/...`, `/maps`, `/indicators`...). No hay colisión posible.
- `v1` permite publicar `v2` sin romper a los consumidores de `v1`.
- Recursos en plural y en español, igual que el backend actual (`/usuarios`, `/compras`).
- `/health`, `/docs`, `/redoc` y `/openapi.json` quedan fuera del prefijo: son técnicos.

## Arquitectura

```
                    ┌──────────────────────────┐
 web / mobile /     │ Backend NestJS :3000/3001│──► PostgreSQL :5433
 desktop  ─────────►│ (existente, sin cambios) │
                    └──────────────────────────┘
        │
        └──────────►┌──────────────────────────┐
                    │ internal-api FastAPI:8000│──► PostgreSQL :5433 (tablas de alertas y SOPORTE)
                    │  /health                 │
                    │  /internal/v1/alertas    │
                    │  /internal/v1/tickets-.. │
                    └──────────────────────────┘
```

Cada tabla tiene un solo dueño: internal-api es el único que escribe en `ALERTA`, `UBICACION_ALERTA`, `DETALLE_ALERTA`, `HISTORIAL_ALERTA`, `SOPORTE` (y crea filas en `USUARIO_MENSAJE_PERSONALIZADO`); de `USUARIO` solo lee. NestJS no usa ninguna de esas tablas.

- `services/internal-api/` está fuera de los workspaces de npm (`apps/*`, `packages/*`): Turborepo, `npm ci` y el Dockerfile del backend lo ignoran.
- Dependencias Python aisladas en `services/internal-api/.venv` (no versionado) y fijadas exactas en `requirements.txt`.
- Lee los mismos `.env` que el backend NestJS local (raíz y `apps/backend/.env.local`) y después `services/internal-api/.env`, que solo sobrescribe `DB_HOST`/`DB_PORT` para fuera de Docker.
- Todavía no está en `docker-compose.yml`: se ejecuta en el PC y se conecta al PostgreSQL de Docker por `localhost:5433`.

## Cómo iniciar FastAPI

Ver [services/internal-api/README.md](services/internal-api/README.md). Resumen (PowerShell, desde la raíz del monorepo):

```powershell
Set-Location -LiteralPath ".\services\internal-api"
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

Comprobación: `curl.exe http://localhost:8000/health` → `{"status":"ok"}`.

Una sola vez por volumen de PostgreSQL, cargar los catálogos de soporte (init.sql los crea vacíos); desde la raíz del monorepo:

```powershell
Get-Content -Raw .\services\internal-api\sql\001_catalogos_soporte.sql | docker exec -i postgres_emergen_db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Para llamar a la API hace falta el token de `POST /usuarios/login` del backend NestJS: en Swagger (`/docs`) no hay botón *Authorize*; usa la cabecera `Authorization: Bearer <token>` desde curl, Postman o el cliente del frontend.

## Documentación Swagger

`http://localhost:8000/docs` (Swagger UI) y `http://localhost:8000/redoc` (ReDoc).

## Documentación OpenAPI

`http://localhost:8000/openapi.json` (OpenAPI 3.1, generado automáticamente por FastAPI). Con `INTERNAL_API_DOCS_ENABLED=false` se desactivan las tres rutas de documentación.

## Variables de entorno

Archivo propio: `services/internal-api/.env` (plantilla: `services/internal-api/.env.example`). Las variables propias llevan el prefijo `INTERNAL_API_`; las compartidas usan el mismo nombre que en el backend y se leen del `.env` de la raíz.

| Variable | Origen | Defecto | Uso |
|---|---|---|---|
| `INTERNAL_API_PORT` | propio | `8000` | Puerto de referencia del servicio (uvicorn recibe `--port`). |
| `INTERNAL_API_CORS_ORIGINS` | propio | vacío | Orígenes permitidos, separados por coma. Vacío = sin CORS. |
| `INTERNAL_API_DOCS_ENABLED` | propio | `true` | Activa `/docs`, `/redoc` y `/openapi.json`. |
| `DB_HOST` / `DB_PORT` | propio (sobrescribe) | `localhost` / `5433` | El `.env` de la raíz usa `db:5432`, que solo existe dentro de Docker. |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `.env` raíz | — | Misma BD que el backend. |
| `JWT_SECRET` | `.env` raíz | — | **Debe ser el mismo del backend**: con él se verifican sus tokens. Sin él, las rutas responden 503. |

## APIs internas

Roles (tabla `ROL`): `1` ADMINISTRADOR, `2` SOPORTE, `3` USUARIO. "Personal" = ADMINISTRADOR o SOPORTE. Un recurso ajeno responde `404` (no `403`) para no revelar que existe.

### API 1: Alertas de emergencia

Estado:
IMPLEMENTADA (2026-10-20)

Objetivo:
Registrar una alerta (SOS) con ubicación y mensaje, y consultar su historial. Sigue el diagrama de secuencia "Generar Alerta": `Enviar mensaje(Ubicacion, mensaje)` → `Registrar Incidente`.

Endpoints:

| Método | Endpoint | Quién | Función |
|---|---|---|---|
| POST | `/internal/v1/alertas` | cualquier usuario | Crea una alerta propia. Body: `ubicacion` (1–150), `mensaje` (1–200, opcional: si falta usa el mensaje personalizado del usuario; si no tiene, `400`). |
| GET | `/internal/v1/alertas?limit=20&offset=0` | cualquier usuario | Sus alertas, de la más reciente a la más antigua. El personal ve todas o filtra con `usuario_id`. |
| GET | `/internal/v1/alertas/{alerta_id}` | dueño o personal | Detalle. |

Respuesta: `{ "alerta_id": 1, "usuario_id": 19, "ubicacion": "-33.45,-70.66", "mensaje": "Caída en casa" }`.

Sin `PUT`, `PATCH` ni `DELETE`: una alerta es un hecho registrado (trazabilidad).

Qué escribe `POST`, en una sola transacción: `USUARIO_MENSAJE_PERSONALIZADO` (si viene `mensaje`) → `DETALLE_ALERTA` → `UBICACION_ALERTA` → `ALERTA` → `HISTORIAL_ALERTA`.

Limitaciones del esquema actual (no se modificó):
- `ALERTA` no tiene fecha ni tipo de emergencia: la respuesta no los incluye y el orden es por ID.
- `DETALLE_ALERTA.antecedente_medico_ID` está en el diagrama ER pero no en la BD.

Dependencias:
PostgreSQL y sesión JWT del backend NestJS. El aviso por WhatsApp sigue en NestJS (`POST /notifications/whatsapp/alerts`); internal-api no lo duplica.

---

### API 2: Tickets de soporte

Estado:
IMPLEMENTADA (2026-10-20)

Objetivo:
Que un usuario abra un caso de soporte y que SOPORTE o ADMINISTRADOR lo atiendan (estado y solución). Usa la tabla `SOPORTE`, que en el diagrama ER es la que tiene el ciclo del caso (descripción, estado, solución, categoría). `TICKET_SOPORTE` no tiene estado ni relación con `SOPORTE`, así que no se usa.

Endpoints:

| Método | Endpoint | Quién | Función |
|---|---|---|---|
| GET | `/internal/v1/tickets-soporte/categorias` | cualquier usuario | Catálogo `CATEGORIA_SOPORTE`. |
| GET | `/internal/v1/tickets-soporte/estados` | cualquier usuario | Catálogo `ESTADO_TICKET`. |
| POST | `/internal/v1/tickets-soporte` | cualquier usuario | Abre un ticket. Body: `descripcion` (1–500), `categoria_id`. Estado inicial: `ABIERTO`; solución vacía. |
| GET | `/internal/v1/tickets-soporte?estado=&limit=20&offset=0` | cualquier usuario | Sus tickets. El personal ve todos o filtra con `usuario_id`. |
| GET | `/internal/v1/tickets-soporte/{ticket_id}` | dueño o personal | Detalle. |
| PATCH | `/internal/v1/tickets-soporte/{ticket_id}` | solo personal | Cambia `estado` (nombre de `ESTADO_TICKET`, sin distinguir mayúsculas) y/o `solucion` (≤500). |

Respuesta: `{ "ticket_id": 1, "usuario_id": 19, "descripcion": "...", "estado": "ABIERTO", "solucion": "", "categoria_id": 3, "categoria": "ALERTAS" }`.

Sin `PUT` (no se reemplaza un caso completo) ni `DELETE` (los casos se cierran con estado `CERRADO`, no se borran).

Requisito: los catálogos de `services/internal-api/sql/001_catalogos_soporte.sql` (estados ABIERTO, EN PROCESO, RESUELTO, CERRADO y 5 categorías). Sin ellos, `POST` responde `400` (categoría) o `503` (estados).

Nota del esquema: en la BD real el estado es `SOPORTE.estado_caso` (texto), no la FK `estado_ticket_ID` del diagrama ER; la API valida el texto contra `ESTADO_TICKET`.

Dependencias:
PostgreSQL y sesión JWT del backend NestJS. Consumidores previstos: web y móvil (abrir y ver tickets) y el panel de escritorio (atenderlos).

---

### Otras propuestas (no aprobadas)

Contactos de emergencia (`CONTACTO_EMERGENCIA`), mensajes de contacto (`MENSAJE_CONTACTO`, `RESPUESTA_CONTACTO`) y notificaciones móviles (`NOTIFICACION_MOVIL`). Estado: PROPUESTA.

---

## APIs externas

No son parte de internal-api. Se consumen desde el backend NestJS y se documentan en [readme-apis.md](readme-apis.md):

| API | Uso | Rutas del backend NestJS |
|---|---|---|
| PayPal REST API | Cobro de planes | `/payments/paypal/...`, `/compras/apadrinados/...` |
| Firebase Authentication | Verificación de ID tokens al registrarse | `/auth/me`, `POST /usuarios/registro` |
| Google Maps Platform | Geocodificación | `/maps/geocode`, `/maps/reverse-geocode` |
| jsReport | PDF de reportes | `/reports`, `/admin/auditoria/reporte` |
| mindicador.cl | Valor del dólar (CLP) | `/indicators` |
| WhatsApp (Baileys) | Envío de alertas | `/notifications/whatsapp/...` |

## Reglas para crear nuevas APIs

1. Proponerla aquí con estado `PROPUESTA` y esperar aprobación del equipo.
2. Un archivo de router por recurso en `app/api/routes/`, montado en `internal_v1` (`app/api/routes/__init__.py`).
3. No duplicar una ruta o lógica que ya exista en NestJS: si ya está ahí, se consume desde ahí.
4. No modificar tablas existentes desde internal-api sin migración SQL revisada (como `migraciones/` y `apps/backend/migrations/`).
5. Toda API nueva lleva al menos un test en `tests/`.
6. Actualizar este archivo (estado, endpoints e historial) en el mismo cambio.

## Versionado

El prefijo `/internal/v1` es la versión del contrato. Cambios compatibles (campos nuevos opcionales, endpoints nuevos) se quedan en `v1`. Cambios incompatibles (quitar o renombrar campos, cambiar tipos) van en `/internal/v2`, conviviendo con `v1` hasta que ningún consumidor lo use.

## Seguridad

internal-api **no tiene login propio**: reutiliza la sesión del backend NestJS (`app/dependencies/auth.py`, equivalente a `apps/backend/src/login/jwt-auth.guard.ts`).

1. El frontend inicia sesión en NestJS (`POST /usuarios/login`) y recibe el JWT.
2. Llama a internal-api con `Authorization: Bearer <token>`.
3. internal-api verifica HS256 con el mismo `JWT_SECRET`, emisor `emergen-api`, audiencia `emergen-web` y vencimiento.
4. Relee el usuario desde `USUARIO` en cada petición: si no existe o está bloqueado (`estado_ID = 3`) responde `401`; el rol también se toma de la BD, no del token.
5. `solo_staff` responde `403` si el rol no es ADMINISTRADOR ni SOPORTE.

Los mensajes de `401`/`403` son los mismos de NestJS. Verificado el 2026-10-20: un token firmado con la configuración de internal-api es aceptado por `GET /usuarios/me` del backend de Docker.

`/health`, `/docs`, `/redoc` y `/openapi.json` no piden sesión. Fuera de desarrollo: `INTERNAL_API_DOCS_ENABLED=false` y CORS solo con los orígenes necesarios.

Pendiente: las acciones del personal (`PATCH` de tickets) no se registran todavía en `BITACORA_SISTEMA`.

## Manejo de errores

Mismo formato que NestJS, porque el cliente compartido (`packages/api-client/src/http.ts`, clase `ApiError`) ya lo interpreta:

```json
{ "statusCode": 404, "message": "Not Found", "error": "Not Found" }
```

Errores de validación devuelven `400` con `message` como lista, igual que `ValidationPipe`:

```json
{ "statusCode": 400, "message": ["ubicacion: String should have at most 150 characters"], "error": "Bad Request" }
```

Los campos no declarados en el body también son `400`, como `forbidNonWhitelisted` en NestJS. Si PostgreSQL no responde: `503 Base de datos no disponible`.

Errores no controlados devuelven `500` sin detalles internos y se registran en el log del servicio (`logging` de Python, logger `internal-api`), igual que el backend usa el `Logger` de NestJS por servicio. Implementado en `services/internal-api/app/core/errors.py`.

## Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-10-20 | Se crea `services/internal-api` (FastAPI 0.156.2) con `/health`, Swagger, ReDoc, OpenAPI, formato de errores compatible con NestJS y router `/internal/v1` vacío. APIs 1 y 2 en estado PROPUESTA. |
| 2026-10-20 | Aprobadas e implementadas: **Alertas de emergencia** y **Tickets de soporte**. Autenticación con el JWT de NestJS. Catálogos de soporte en `sql/001_catalogos_soporte.sql`. 13 tests contra PostgreSQL real (en transacción revertida). Sin cambios de esquema ni en código existente. |
