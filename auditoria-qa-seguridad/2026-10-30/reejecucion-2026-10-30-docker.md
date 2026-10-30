# Re-ejecución 2026-10-30 — Correcciones aplicadas + pruebas sobre Docker

Segunda pasada solicitada por el usuario: **aplicar** las correcciones recomendadas (no solo
proponerlas) y **re-ejecutar** las pruebas levantando el stack de **Docker** construido desde el
HEAD actual. El usuario autorizó expresamente modificar estos puntos y habilitar Docker, lo que
anula para estos ítems la restricción previa de "solo recomendar". Se mantienen: `init.sql`
intacto, datos/volúmenes del equipo sin tocar, sin commits/push.

## 1. Correcciones aplicadas (código)

| ID | Archivo | Cambio | Verificación |
|---|---|---|---|
| **QA-REG-02** | `apps/web/vitest.config.ts` | Resolver la función de `vite.config.ts` (modo `test`) antes de `mergeConfig` | `npm test` web vuelve a correr: **110/110** (`evidencias/fix-reg02-vitest-web.log`) |
| **QA-REG-01** | `apps/backend/src/admin/admin-tickets.service.spec.ts` | Spec alineado al tope de filas (PRE-SEC-006): afirma `LIMIT reportLimit()+1` y añade un caso que exige **413 sin truncado silencioso** cuando se supera el tope | Spec **7/7**; suite backend unitaria completa **265/265** (`evidencias/fix-reg01-jest.log`, `fix-jest-unit-completo.log`) |
| **QA-ENV-01/02** | `services/internal-api/.venv` (no versionado) | Recreado en **Python 3.12.10** con `requirements.txt` (bcrypt 5.0.0); respaldo del 3.14 eliminado | `python -c "import bcrypt,fastapi"` OK; FastAPI arranca; el runner del compañero ya puede ejecutar su paso Python |

**Decisión sobre la política de informe (QA-REG-01):** el tope **no trunca en silencio**; si los
tickets cerrados superan `API_REPORT_MAX_ROWS` (2000 por defecto) el informe devuelve **413** con
mensaje que remite a exportación operativa. Es coherente con HU-19 (no entregar un informe parcial
haciéndolo pasar por completo) y con PRE-SEC-006. Si el negocio necesita informes de histórico
grande, la vía es paginar/exportar, no subir el tope sin control.

## 2. PRE-SEC-003 — verificado construyendo y levantando desde el HEAD

Se construyó un stack Docker **desde el HEAD** (`scripts/docker-compose.audit.yml`), aislado y
endurecido: BD sintética en `tmpfs` (volumen propio, **nunca** `volumen_emergen_postgres_data`),
`EMERGEN_ENVIRONMENT=test`, secretos sintéticos, WhatsApp desactivado. Evidencia de build:
`evidencias/10-docker-build.log`.

**Binding de puertos (contraste directo):**

```
Stack auditoría (imagen del HEAD):   127.0.0.1:3720->3000  127.0.0.1:3721->8000  127.0.0.1:55733->5432
Contenedores del equipo (imagen previa): 0.0.0.0:3001->3000  [::]:3001  0.0.0.0:8000->8000  [::]:8000
```

- Levantando desde el HEAD con binding a loopback, las APIs **no quedan expuestas a la LAN** —la
  forma correcta de PRE-SEC-003. Evidencia: `evidencias/12-docker-pruebas-salida.log` (DK-PRESEC003-01)
  y la salida `docker ps` de arriba.
- **No se modificó** el `docker-compose.yml` de desarrollo: liga `backend`/`internal-api` a
  `0.0.0.0` a propósito para que el teléfono físico alcance el backend al depurar la APK por LAN
  (`docs/APK_DEBUG_LAN_2026-10-28.md`). La recomendación operativa se mantiene: **en el host real,
  usar `docker-compose.production.yml` / reglas de ingreso y reconstruir imágenes desde el HEAD**;
  los contenedores del equipo en ejecución son de una imagen anterior al commit de seguridad.

## 3. Re-ejecución QA + seguridad contra el stack Docker del HEAD

36 casos contra las imágenes reales (NEST `3720`, FastAPI `3721`), **todos APROBADO**. Como contra
contenedores no se pueden inyectar dobles, los usuarios se sembraron en BD y se inició sesión por
API (el login no usa proveedores). Evidencia por caso: `evidencias/casos-docker.jsonl`; salida:
`evidencias/12-docker-pruebas-salida.log`.

Cubierto sobre la imagen del HEAD: salud/arranque, login y rechazo genérico, **JWT expirado/firma
ajena** en ambas APIs, autorización por rol (incl. **rol forjado que no escala**), rutas genéricas
retiradas (404) y maps/indicators con JWT, **IDOR** en contactos, **cifrado de ficha médica en
reposo**, límite de mensaje 160, SQLi parametrizado, XSS como dato + nosniff, cabeceras de
seguridad, 413/415/400, CORS allowlist, **SOS completo** (crear/idempotencia/cierre con PIN/alerta
ajena 404) y soporte/contacto público con bandeja solo-staff.

**Conteo:** APROBADO 36 · FALLIDO 0 · BLOQUEADO 0.

No reejecutado contra Docker (ya verificado en la fase in-process con dobles, por requerir
proveedores reales): registro vía Firebase y **captura de pago PayPal**.

## 4. PRE-SEC-007 — no implementado (requiere decisión + esquema)
La revocación de sesión del lado del servidor necesita estado persistido (versión de sesión por
cuenta o lista de denegación de tokens), es decir un **cambio de esquema** — y `init.sql` está
congelado por instrucción. Es además una decisión de producto (qué eventos revocan: logout,
cambio/recuperación de contraseña, pérdida de dispositivo; y su efecto en SOS). **Diseño mínimo
sugerido** (para el encargo que lo implemente, con autorización de esquema): añadir
`usuario.sesion_version` (o tabla de denylist con `jti`), incluir el valor en el JWT al emitir y
comparar en `JwtAuthGuard`/`auth.py` en cada petición (ya releen la cuenta); incrementar la versión
en logout global, cambio/recuperación de contraseña y acción de "cerrar sesiones". No se aplicó
aquí para no tocar `init.sql` ni introducir una migración de auth sin esa decisión.

## 5. Hallazgo nuevo de esta pasada
- **QA-DEPLOY-01 (media):** un `docker compose up` **recién creado** inicializa la BD solo con
  `init.sql` (vía `docker-entrypoint-initdb.d`), **no** con las migraciones de `migrations/`. Dos
  columnas que consulta `/health/ready` (`soporte.trabajador_*`, `contacto_emergencia.compartir_antecedentes`)
  no están en `init.sql`, así que **la API arranca pero reporta `database: down` hasta ejecutar
  `migrate:deployment`**. Reproducción: BD limpia solo con init.sql → `GET /health/ready` = 503.
  Evidencia: logs de `emergen-aud-*` antes de aplicar migraciones (sección de arranque en la
  bitácora de esta pasada). Recomendación: documentar/automatizar la aplicación de migraciones en
  el arranque Docker, o incorporar esas columnas al flujo de init del contenedor (propuesta al
  dueño de `init.sql`, sin modificarlo por iniciativa propia).

## 6. Estado tras esta pasada
- Suites del proyecto: backend unit **265/265**, web **110/110**, api-client 31, móvil 53, node 23,
  FastAPI pytest 62/63 (la que falta es dependencia de datos de seed, no producto).
- Docker (HEAD): **36/36**.
- Archivos de producción modificados (correcciones solicitadas, **sin commit**):
  `apps/web/vitest.config.ts`, `apps/backend/src/admin/admin-tickets.service.spec.ts`.
- `init.sql` intacto (mismo SHA-256). Volúmenes/datos del equipo sin tocar. Stack Docker de
  auditoría y su BD eliminados al cierre (`down -v`).
