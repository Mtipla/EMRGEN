# Revisión independiente precommit e integración del equipo — 30-10-2026

Revisor: Claude Code (Opus 5.5), ejecutando `docs/PROMPT_CLAUDE_REVISION_PRECOMMIT_EQUIPO.md`. Rutas relativas a A (`Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación`) salvo indicación. No se modificaron fuentes ni configuración del árbol del usuario: el único archivo nuevo es este informe. No hubo staging, commit, push, fetch, checkout/reset/restore, cierre de procesos, ni acceso a BD, volúmenes, `.env` operativos o proveedores.

**Dictamen limitado: «requiere correcciones antes de integrar».** Las correcciones son pequeñas y locales (H2–H5). Tras aplicarlas, el candidato queda en condición de «preparado para revisión/commit local con pendientes externos». No se declara listo para publicar ni que todas las ramas funcionen.

## 1. Snapshot, candidato y plataforma

| Elemento | Observado |
|---|---|
| Rama / HEAD | `alonso` / `6c228e6566487c265231c0f99dcc12de7a305557`; índice vacío; sin commit del fortalecimiento |
| Delta Git | 64 `M` + 34 `??` del prompt **más 4 entradas `graphify-out/cache/hook_sessions/*.nudges`** (3 ` D`, 1 `??` creada por esta sesión). Total observado 102 (+1 este informe). Las 4 de graphify no son candidato |
| Huella del manifiesto | Recalculada `d0f70f5aabc9fd5da13d47432766b231497446adaca30757638d079bd26f4da1` — **coincide**. Las 96 entradas coinciden en ruta, estado y SHA-256; ninguna entrada del candidato cambió |
| Entradas sin hash | `D/.env` (revisado redactado, §4), INFORME_REVALIDACION_QA_2026-10-29.md y docs/qa/revalidacion-2026-10-29.json (no revisados: QA previa) |
| init.sql / synchronize | SHA-256 `d4e71a57…8f68` sin cambios; init.sql/migraciones idénticos a HEAD; `app.module.ts:67 synchronize: false` |
| `git diff --check` | exit 0 |
| Plataforma de revisión | Windows 11 x64; Node 24.21.0, npm 11.19.0; Python 3.12.10; Docker 29.9.2, Compose v5.6.1. Linux/macOS **no** verificados |

Refs locales sin fetch (último FETCH_HEAD: 2026-10-29 19:30 -03):

| Ref | Tip | Commits solo en la ref vs HEAD | Solapamiento con el candidato |
|---|---|---|---|
| origin/main | 3b6e209 (25-10) | 0 (ancestro de HEAD) | 0 |
| main local | d7f372c (23-09) | 0; 13 commits detrás de origin/main | 0 |
| origin/diego | 809c2bd (28-10) | 0 (ancestro) | 0 |
| origin/gabriel | b41848c (28-10) | 0 (ancestro) | 0 |
| origin/graphify | 7e35ae3 (28-10) | 0 (ancestro) | 0 |

Con estas refs no hay divergencia, así que tampoco hay merge que simular. **No hay destino de integración acordado verificado**. CONTRIBUTING describe un PR hacia `main`. La compatibilidad con trabajo no publicado o posterior al 29-10 19:30 **no puede confirmarse** sin un fetch del responsable.

## 2. Hallazgos por severidad

| # | Sev. | Tipo | Archivo:línea | Escenario → efecto | Corrección propuesta |
|---|---|---|---|---|---|
| H1 | Alta (externo) | Fallo probado, ya conocido (PRE-SEC-002) | `D/.env` y `D/example.env` en HEAD y `origin/alonso` | En HEAD hay 21 valores no-placeholder por archivo (JWT, PayPal secret, jsReport, DB, Maps, Firebase). El árbol actual los reemplaza por 33/34 placeholders, pero siguen **publicados en la historia remota** | Revocar/rotar en proveedor antes de hosting (runbook OPERACION_SEGURA §Rotación). El commit limpia la punta y no revoca nada. Reescribir la historia es una decisión aparte del responsable |
| H2 | Media | Fallo probado | `scripts/seed-safety.cjs:6-11` vs README.md:250-256, 341-346, 512-521 y `example.env:3,7` | Con la plantilla estándar (`DB_NAME=EMERGEN_BDD`, `DB_HOST=db`) **y** con loopback + `EMERGEN_SEED_EXPECTED_DB` explícitos, el guard sigue bloqueando: exige minúsculas y sufijo `_dev`/`_test`. Los pasos del README («`node scripts/seed-dev.cjs`», también tras `down -v`) fallan siempre para el equipo | Opción mínima: mantener entorno coherente + loopback + confirmación exacta, y aceptar el nombre existente (`/^[A-Za-z][A-Za-z0-9_]*$/` sin sufijo obligatorio cuando `EMERGEN_SEED_EXPECTED_DB === DB_NAME`). Alternativa: conservar el guard y documentar en README el bloque PowerShell con las 6 variables y una BD `*_dev`. Decide el usuario; en ambos casos, actualizar el README |
| H3 | Media | Fallo probado (contrato de errores) | `apps/backend/src/main.ts:17` antes de `:28` | `boundedJson` se registra antes de `enableCors`, así que los 413/414/415/400 salen **sin `Access-Control-Allow-Origin`**. El navegador o WebView entrega "Failed to fetch" en vez de `ApiError` con status/mensaje, lo que contradice OPERACION_SEGURA.md:56 | Calcular `origenes` y llamar `app.enableCors({ origin: origenes })` **antes** de `app.use(boundedJson())`. Probe: orden actual 413/415 sin ACAO; orden propuesto con ACAO, 201 intacto. Añadir el caso a `security-boundaries.e2e-spec.ts`, que hoy no habilita CORS |
| H4 | Media | Incompatibilidad inferida (paso obligatorio) | `services/internal-api/app/core/pin.py:2`, importado por `app/services/alertas.py:7`; README.md:263 | FastAPI ahora importa `bcrypt` de Python al cargar. Un `.venv` existente de un integrante no lo tiene, así que FastAPI no arranca tras incorporar el commit hasta reinstalar. README §6.4 aún dice que el PIN usa bcrypt «mediante un script de Node» | README §6.4: reemplazar esa frase y añadir «tras actualizar: `pip install -r services/internal-api/requirements.txt`». `scripts/pin-bcrypt.cjs` ya no tiene consumidores de código: eliminarlo o marcarlo histórico |
| H5 | Media-baja | Probado (dist ausente) + inferido (fallo del runner) | `apps/desktop/README.md:19`; `scripts/check-electron-panel.mjs:14` | Electron 44.9.1 **no declara postinstall** y npm 11.19 no ejecuta install scripts sin `allowScripts`. Tras `npm ci` limpio, `node_modules/electron/dist` no existe. `npm run dev` lo descarga de forma perezosa al primer uso (red a GitHub); el runner nativo lanza ENOENT al leer `dist/version`. «Conservar los scripts necesarios» es impreciso | Documentar tras `npm ci`: `node node_modules/electron/install.js` (instalador oficial con `checksums.json`), o `npx install-electron --no`. Cypress: `npx --workspace=mobile cypress install` (ya está en la tabla de problemas) |
| H6 | Baja | Defecto latente | `packages/api-client/src/paypal-sdk.ts:54-55`, exportado en `index.ts:19` | `renderPaypalButtons` usa los wrappers retirados, por lo que el botón siempre falla con 410. No tiene consumidores (web usa solo `loadPaypalSdk`). Su test pasa porque inyecta un `api` falso | Eliminar `renderPaypalButtons` con su test y su export, o reescribirlo sobre `api.compras`. No reactivar rutas genéricas |
| H7 | Baja | Código muerto | `integrations/paypal/paypal.controller.ts`, `integrations/jsreport/jsreport.controller.ts` (+ DTO) | Desregistrados en sus módulos, sin importadores | Borrar ambos controllers y sus DTO exclusivos; evita reintroducirlos en merges |
| H8 | Baja | Diseño inferido (decisión pendiente) | `config/security.ts:85`, `core/limite.py:26-27` | Al llenarse la capacidad (10 000 claves), toda identidad nueva recibe 429 hasta que expiren ventanas (≤15 min en identidad). Rotando IPv6, un tercero puede negar login a peers nuevos por proceso | Decidir: agregar IPv6 por /64 para claves `peer:` o expulsar la más antigua en vez de denegar; mitigación en el ingreso. Ya documentado como provisional |
| H9 | Baja | Doc/plataforma | README.md (solo PowerShell); `scripts/security-run.mjs:24,52` | Sin diferencias Linux/macOS (venv `bin/`, activación, rutas). `python-config` fija `.venv/Scripts/python.exe` y `build` busca npm en `execPath/../node_modules/npm`, ruta que en Linux no existe (`<prefix>/lib/node_modules/npm`) | Añadir una subsección Linux/macOS al README. En el harness, seleccionar `bin/python` fuera de win32 y usar `process.env.npm_execpath` o `npm` del PATH. Hasta entonces el harness es solo Windows |
| H10 | Info | Reproducibilidad | `services/internal-api/Dockerfile:1`, `Dockerfile.lock:2` | `python:3.12-slim` por tag. La evidencia registró `@sha256:aa943ce4…d159`, pero otra máquina puede resolver otra base | Fijar `FROM python:3.12-slim@sha256:aa943ce411423c7582288f18707ff66eddcbaeb510502d747a72aeb34f30d159` (PRE-SEC-014) |
| H11 | Info | Higiene | `D/.env:9,34`, `D/example.env:9,35`; `D/.gitignore` | Clave `JWT_SECRET` duplicada en ambas copias documentales. El `.gitignore` nuevo no deja de versionar `D/.env` (sigue tracked) | Eliminar el duplicado. Dejar de versionarlo (`git rm --cached`) es decisión del usuario |

Sin hallazgos en: retiro de `/payments/paypal` y `/reports` (404) y JWT en maps/indicators (e2e 6/6). Tampoco en el formato de PIN, `^\d{4}$` igual en Nest y Python; en el orden de middlewares FastAPI, donde CORS queda por fuera de `RequestBounds`; en la cobertura del interceptor de exportación sobre las cuatro rutas `reporte|informe`, con auditoría acotada por DTO `@Max(1000)`; ni en `dev`/`dev:docker`, que pasan por `dev.mjs` con `NODE_ENV=development`. Ningún consumidor de apps llama a `api.maps`, `api.indicators`, `api.paypal` o `api.reports`.

## 3. Matriz de reproducibilidad (copia limpia)

Copia: `C:\Users\gonza\AppData\Local\Temp\claude\c--Users-gonza-EMRGEN\0803ebd7-42cc-4733-a7a3-b9fa9a12bc8d\scratchpad\clean`. Selección revisada: 538 tracked + 30 nuevos de A, más 5 plantillas `*.example` revisadas. Excluidos: `.env.docker`, QA previa, `node_modules`, `.venv`, `backups`, claves y sesiones. La ruta es ASCII y difiere de la del autor (`Aplicación`), lo que no se reprodujo.

| Componente | Requerida | Resuelta / ejecutable | Instalación | Variables | Comprobación | Resultado |
|---|---|---|---|---|---|---|
| Node / npm | ^24.21.0 / ^11.19.0; sin `packageManager` | 24.21.0 / 11.19.0 | — | — | `turbo run check-types --dry=json` | Turbo 2.11.2 resuelve 9 workspaces sin `packageManager` |
| Dependencias npm | lock v3 `2bcdf7d4…ebbf` | 1485 paquetes; lock sin cambios | `npm ci --no-audit --no-fund` | `CYPRESS_INSTALL_BINARY=0`, sin efecto real | exit 0; `npm install-scripts ls` | **9 install scripts no ejecutados** (allowScripts). bcrypt 6.0.0 carga desde su prebuild |
| Vite | 8.3.3 | 8.3.3 | — | build `security-check` | `security-run build web/mobile/desktop/backend` | 4/4 exit 0; solo avisos de chunk |
| Electron | 44.9.1 | 44.9.1, Chromium 152.0.7977.167, Node 24.22.0, win32/x64 | `node node_modules/electron/install.js` (cache propia, checksums incluidos) | entorno filtrado | ZIP `41bd7900…ef91` y `electron.exe` `1432afee…13aa` | Ambos **coinciden** con el autor. Panel nativo **6/6**; `dist/index.html` `f9974cc5…0491` idéntico (build reproducible) |
| api-client | — | — | — | — | vitest y `tsc --noEmit` | 31/31; tipos OK |
| Python | 3.12; 7 directas; lock Linux | 3.12.10 Windows; bcrypt 5.0.0, FastAPI 0.156.2, pydantic 2.14.1, psycopg 3.3.6 | venv nuevo + `pip install -r requirements.txt` | — | `security-run python-config`; autocomprobación PIN/ventana sintética | 2 tests / 6 Settings; PIN 3/3 y capacidad/TTL OK. Lock Linux no instalado aquí (no portable) |
| Compose | — | Docker 29.9.2 / Compose v5.6.1 | — | sintéticas, `--env-file /dev/null`, `COMPOSE_DISABLE_ENV_FILE=1` | `config --quiet` de producción y local | exit 0 / exit 0; plantilla cubre las 21 obligatorias. No se levantó nada |
| PostgreSQL | 15 (imagen) | No verificado: no se tocó servidor/cliente | — | — | — | Pendiente |

Pruebas ejecutadas en la copia (secuenciales, sin red externa, sin `.env`): backup-db 2/2 · seed-safety 6/6 · main.test.cjs 3/3 · logging jest 8/8 (6+2) · sesión móvil 3/3 · security-boundaries e2e 6/6 · panel nativo 6/6. Probes propios: CORS (H3) y guard de seed con valores de plantilla (H2), en `C:\Users\gonza\AppData\Local\Temp\claude\c--Users-gonza-EMRGEN\0803ebd7-42cc-4733-a7a3-b9fa9a12bc8d\scratchpad\probes\cors-probe.cjs`. Evidencia anterior reutilizada sin repetir: imagen PIN `sha256:1235a7b2…` 2/2, huella de 26 entradas, integración con PostgreSQL nuevo, advisories. No se ejecutaron `security-db-check.mjs` ni `check-pin-image.mjs`.

### TLS / permisos / secretos / backups

| Área | Comprobado localmente | Preparado para destino | Pendiente de responsable/proveedor |
|---|---|---|---|
| TLS | Validadores Nest/FastAPI (6 Settings); Compose parsea con `verify-full` sintético | Variables, montaje CA `/run/emergen-ca`, runbook | Servidor PostgreSQL TLS real, conexión de ambos adaptadores y rechazo por CA/hostname incorrectos; ingreso HTTPS/DNS/renovación |
| Permisos | — (ningún grant aplicado) | PERMISOS_BD_PROPUESTA.md (matriz, secuencias, helpers) | Rol app sin owner/admin en BD nueva; flujos críticos y denegación DDL/TRUNCATE/catálogos |
| Secretos | Árbol limpio: 0 coincidencias de patrones en 98 archivos del candidato; D/.env 33/33 placeholders | Inventario por tipo/ubicación/responsable (OPERACION_SEGURA) | **Revocación real de lo publicado (H1)**; rotación JWT coordinada en ambas APIs y efecto en SOS nativo |
| Backup | VM 2/2 (colisión/manifiesto) | Runbook, ACL 0700/0600 | Dump y restauración en BD/volumen nuevo vacío, descifrado con clave aparte, RPO/RTO, custodios |

## 4. Archivos para el commit y exclusiones

**Revisar e incluir** (decisión del usuario): las 92 entradas `candidate_for_content_review` del manifiesto. También `D/.env`: la revisión redactada confirma 33/33 placeholders, y versionarlo así limpia la punta sin revocar. Además los dos entregables compañeros (manifiesto, prompt) y este informe, si el equipo los quiere versionados. Antes, aplicar H2–H5 y, opcionalmente, H6, H7, H9 y H10.

**Excluir por defecto:** `graphify-out/**`; según CLAUDE.md, el usuario lo descarta con `git restore graphify-out` antes del commit. Este revisor no lo hizo. También quedan fuera `docs/INFORME_REVALIDACION_QA_2026-10-29.md` y `docs/qa/revalidacion-2026-10-29.json` (QA previa sin revisar), `LEVANTAMIENTO_CIBERSEGURIDAD_EMERGEN.md` de la raíz (auditoría previa, revisión aparte), cualquier `.env` operativo, `node_modules/.cache/**` (evidencia/capturas/perfiles), `.venv`, backups, sesiones Baileys, firma, APK y bundles `security-check`. Usar `git add <rutas>` explícitas, nunca `-A`.

Límites: Android sin sync/build/APK ni prueba física (GPS, permisos, volumen, FileProvider). Ningún proveedor real (PayPal, WhatsApp, Maps, jsReport). El panel 6/6 usa APIs simuladas que responden ACAO `*`, así que no valida CORS real del backend con origen `file://`. Solo Windows x64.

## 5. Pasos para cada integrante tras incorporar el commit

1. Antes de actualizar: confirmar `git status` limpio o guardar el trabajo propio en commit en su rama (sin stash forzoso ni reset). Hacer `git fetch` y revisar diferencias con su rama.
2. Revisar conflictos semánticos aunque Git fusione limpio: llamadas a `api.maps`/`api.indicators` (ahora `accessToken` primero), `api.paypal`/`api.reports`/`renderPaypalButtons` (410), rutas `/payments/paypal` y `/reports` (404), consultas de reporte (413 sobre `API_REPORT_MAX_ROWS`) y errores 413/415 del body. En `package-lock.json` no elegir un lado a ciegas: resolver desde los manifiestos y regenerar solo con revisión.
3. `npm ci --no-audit --no-fund` en A. Después `node node_modules/electron/install.js` (H5); si se usa Cypress, `npx --workspace=mobile cypress install`.
4. Variables: **no sobrescribir** su `.env`. Añadir a mano las nuevas de `example.env` (bloque «Controles locales iniciales»). Producción usa `deploy/production.env.example` fuera de Git.
5. Python: en su `.venv` propio, `python -m pip install -r services/internal-api/requirements.txt` (bcrypt 5.0.0, H4). No copiar el `.venv` del autor ni usar el lock Linux en Windows.
6. Reconstruir los clientes que use. En Android, el responsable hace sync/build/reinstalación del APK; el APK anterior no lleva estos cambios. Con Docker local, `docker compose up -d --build backend internal-api` solo sobre su propio entorno, sin `down -v`.
7. Seed: hasta resolver H2, `seed-dev.cjs` bloquea con la configuración estándar. No forzarlo ni renombrar BD con datos.
8. No tocar datos, volúmenes, sesión WhatsApp, claves médicas ni `init.sql`.

## 6. Bloqueos, mejoras y pendientes externos

- **Correcciones locales antes de integrar:** H2 (seed y README), H3 (orden CORS), H4 (README §6.4 y paso pip), H5 (paso de instalación de Electron).
- **Mejoras opcionales:** H6, H7 (borrar código muerto), H8 (política de capacidad), H9 (Linux/macOS), H10 (digest de la base Python), H11.
- **Pendientes externos/decisión (siguen abiertos según las matrices):** revocación de secretos publicados (H1). Revocación de sesión común Nest/FastAPI: un borrado local de token no revoca en servidor. Política PIN cruzada (3/5 min Nest vs 5/15 min FastAPI). Cuotas compartidas para réplicas. Dispatcher y entregas ambiguas sin exactly-once. TLS, roles y restauración reales; hosting/ingreso/CSP; release Electron firmado y APK nuevo; aceptación con proveedores.

Orden: correcciones H2–H5 → commit revisado por el usuario → integración por el flujo acordado (PR hacia `main`) → staging.
