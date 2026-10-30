# EMERGEN — Revisión independiente precommit para Claude Code

> **Prompt histórico de la revisión anterior a H2–H5.** Conservado el 30-10-2026 para explicar REVISION_INTEGRACION_EQUIPO_CLAUDE.md. Sus cantidades, huella y pendientes de instalación corresponden a aquel snapshot; no representan el candidato actual ni son una nueva orden de auditoría. Consultar el cierre vigente y MANIFIESTO_CANDIDATO_PRECOMMIT.json. Para acompañar al equipo usar [PROMPT_CLAUDE_ACTUALIZACION_EQUIPO_POSTMERGE.md](PROMPT_CLAUDE_ACTUALIZACION_EQUIPO_POSTMERGE.md).

Actúa como revisor independiente de reproducibilidad e integración de EMERGEN. Estamos en **PRE-HOSTING y PRE-COMMIT**. Comprueba que el equipo pueda incorporar e instalar el candidato conservando sus funciones. Entrega hallazgos y pasos concretos; no repitas la auditoría general ni realices ataques.

## 1. Fuentes, candidato y alcance

Localiza la raíz Git. En este snapshot, **A** = `Fase 2/Evidencias Proyecto/Evidencias de sistema Aplicación`, relativo a esa raíz. Las rutas `apps/`, `scripts/`, `docs/`, `services/` y los comandos siguientes se resuelven desde A.

Lee `AGENTS.md`, `CLAUDE.md` y `CONTRIBUTING.md` aplicables; README raíz, README de A y componentes afectados; y, bajo A:

- `docs/FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md`, desde **«Cierre vigente: Electron actualizado y panel nativo comprobado — 30-10-2026»**, sus matrices y cualquier cierre posterior.
- `docs/OPERACION_SEGURA.md` y `docs/PERMISOS_BD_PROPUESTA.md`.
- `docs/MANIFIESTO_CANDIDATO_PRECOMMIT.json` y las fuentes que enumera.

Snapshot al preparar este prompt: rama **alonso**, HEAD **6c228e6566487c265231c0f99dcc12de7a305557**, índice vacío; **64 entradas versionadas modificadas y 34 archivos nuevos** (98 entradas Git, incluyendo este prompt y su manifiesto). El manifiesto recoge 96 entradas y excluye esos dos entregables de su huella. **No existe un commit del fortalecimiento que pueda identificarse solo con ese HEAD.** No se ha verificado aquí un destino de integración acordado.

Huella **histórica** del inventario revisado: **d0f70f5aabc9fd5da13d47432766b231497446adaca30757638d079bd26f4da1**. Era SHA-256 del arreglo `files` del manifiesto, JSON UTF-8 con `ensure_ascii=false`, claves ordenadas y separadores coma/dos puntos. La huella actual y sus exclusiones están únicamente en MANIFIESTO_CANDIDATO_PRECOMMIT.json; no comparar el candidato posterior a H2–H5 contra esta huella anterior. En aquel snapshot se excluyeron el propio manifiesto y este prompt para evitar autorreferencia. Una huella no acredita instalación limpia, contenido libre de secretos o compatibilidad de ramas.

El manifiesto contiene tres entradas sin hash de contenido: un `.env` documental ya versionado y dos evidencias QA previas. Requieren revisión redactada separada; no se exportan automáticamente. El levantamiento y QA anteriores no se atribuyen a este lote ni se incluyen por defecto en el commit. Una ruta inventariada **no es una autorización de inclusión**.

El 30-10-2026 se liberó únicamente el helper QA identificado de EMERGEN, se instaló Electron 44.9.1 y se aprobaron seis casos en el ejecutable nativo con APIs simuladas. El resto de ensayos de prehosting sigue pendiente; verifica siempre el cierre más reciente. Revisa todo el delta: controles Nest/FastAPI, cliente compartido, móvil/Electron, dependencias, Compose, plantillas y documentación, incluyendo la limpieza documental fuera de A. Verifica especialmente que no falten estos archivos nuevos:

- Backend: `src/config/{security.ts,security.spec.ts,auxiliary-cache.ts}`, `src/integrations/security-logging.spec.ts` y `test/security-{boundaries,functional}.e2e-spec.ts`, bajo `apps/backend/`.
- `apps/mobile/src/lib/session-security.test.ts` y `apps/desktop/electron/main.test.cjs`.
- `scripts/security-{run.mjs,test-preload.cjs,db-check.mjs,python-checks.py}`; `scripts/check-{pin-image,security-advisories}.mjs`; `scripts/seed-safety.{cjs,test.cjs}`; `scripts/backup-db.test.mjs`.
- `services/internal-api/Dockerfile.lock`, `app/core/security.py` y `locks/requirements-linux-py312.lock`, estos dos últimos bajo `services/internal-api/`.
- `docker-compose.production.yml`, `deploy/{.gitignore,production.env.example}`, los tres documentos de cierre/operación/permisos y el `.gitignore` de `Fase 2/Evidencias Proyecto/Evidencias de documentación/4.4 Docker/`.

Los helpers nuevos `scripts/check-electron-panel.mjs` y `scripts/electron-panel-fixture.cjs` también son necesarios para reproducir la evidencia nativa. Los README principal/desktop y OPERACION_SEGURA.md ya documentan la versión efectiva; compáralos con lo que observes.

Si el árbol cambió, registra la diferencia y delimita el candidato antes de atribuirle resultados. Si ya existe un commit, identifica el SHA real y los archivos incluidos; no inventes un SHA futuro.

## 2. Límites de la revisión

Puedes escribir el informe y usar una copia temporal independiente para instalar, compilar y comprobar. No modifiques fuentes/configuración de la copia del usuario; entrega correcciones propuestas. Conserva ramas, índice, procesos, contenedores, BD y volúmenes existentes. No staging, commit, push, merge efectivo, publicación, checkout/reset/clean/stash/restore, cierres automáticos de Electron/Node ni cambios globales de herramientas/configuración. Los ejemplos de flujo Git de otros documentos no autorizan esas operaciones en esta revisión. No regeneres Graphify en el árbol del usuario ni incorpores `graphify-out/` desde una rama individual.

Mantén `init.sql` intacto y `synchronize=false`. No cambies claves médicas/firma, sesión Baileys o credenciales reales. No imprimas valores privados, datos personales, hashes de usuarios, `.env`, conexiones o diffs sensibles. No envíos, pagos, proveedor real, emisor activo o `LIVE_APIS`.

Instalaciones solo locales desde locks y registros oficiales/autorizados, revisando scripts de instalación. Prohibidos `latest`, borrar locks, `--force` o `--legacy-peer-deps` para ocultar incoherencias. El cierre de Electron autorizado al ejecutor del prompt operativo anterior no se transfiere a esta revisión.

## 3. Reproducibilidad y estado realmente acreditado

| Componente | Estado al preparar el prompt | Qué contrastar |
|---|---|---|
| Node/npm | engines `^24.21.0` / `^11.19.0`; `packageManager` ausente | Versiones efectivas, raíz npm correcta e implicaciones para Turbo; no asumirlas instaladas en otros equipos |
| npm/Vite | `package-lock.json` v3; Vite **8.3.3** en manifiestos web/móvil/desktop, lock e instalación del autor | Coherencia del grafo e instalación sin regenerarlo; builds por workspace no acreditan todos los scripts raíz |
| Electron | Manifiesto/lock/paquete/dist/ejecutable **44.9.1**, comprobado en Windows x64; EBUSY cerrado | Reproducir versión efectiva en la copia limpia, ruta/OS/arquitectura y descarga/checksum; no asumir la versión en otros equipos |
| Python | Runtime objetivo Linux/Python 3.12; 7 dependencias directas y lock Linux de 25 paquetes con hashes; bcrypt 5.0.0 | Instalación en entorno propio o Dockerfile; no copiar `.venv` Windows ni asumir ese lock portable |
| PostgreSQL/Docker | Referencias PostgreSQL 15 y Compose distintos para local/producción | Versiones reales de cliente/servidor, Docker/Compose, CA, roles, volúmenes y topología; no inferirlas del YAML |

**Prueba una instalación desde un árbol limpio temporal con las fuentes actuales y archivos nuevos aprobados**, no solo desde HEAD. Exporta mediante selección revisada de archivos; no copies recursivamente el directorio del autor. Excluye `node_modules`, `.venv`, `.git`, privados, certificados/CA privadas, backups, sesiones, firma, APK, caches y bundles `security-check`. Revisa también privados ya versionados: `.gitignore` no los elimina. No selecciones el manifiesto como allowlist automática.

Desde A de esa copia, tras revisar los scripts, utiliza `npm ci --no-audit --no-fund` con el lock real y los scripts necesarios para Electron. Una instalación completa desde árbol limpio **sigue pendiente**: el lote actual realizó la reinstalación dirigida de Electron sin cambiar manifiestos/lock. No uses Electron global o `npx` que descargue otra versión. Si hay EBUSY, identifica archivo/PID/ruta sin terminar procesos; continúa las comprobaciones independientes.

Los scripts desktop observados solo ofrecen build frontend; no acreditan empaquetado/firma. Comprueba el runtime nuevo por separado, sin sesión real ni red a proveedores. Registra instalación, plataforma, comandos, resultados y limitaciones. Revisa las dependencias de plataforma del harness: `security-run.mjs python-config` usa `.venv/Scripts/python.exe` y el modo build busca npm respecto a `process.execPath`. No presentes esos comandos como verificados en Linux/macOS.

Evidencia anterior **registrada**, reutilizable únicamente si corresponde a las mismas fuentes/configuración:

- Backup VM **2/2**; fixture TLS **6 construcciones Settings**; logging **6/6** y control distinto de respuesta externa **2/2**.
- Sesión móvil/puente falso **3/3** y política renderer Electron/VM **3/3**. Ahora también panel nativo **6/6** en Electron 44.9.1: arranque/aislamiento, login inválido, login administrador/auditoría, monitor SOS de lectura, tickets de la segunda API y logout/recarga. Perfil temporal, renderer real compilado, HTTP/HTTPS en memoria y WebSockets denegados; sin servicios/proveedores reales.
- Build desktop posterior a la instalación con Vite 8.3.3 aprobado; web/móvil, tipos y casos previos reutilizados por no cambiar esas fuentes/dependencias. Integración previa con PostgreSQL nuevo y proveedores falsos. No comparación funcional global antes/después.
- Imagen PIN final `sha256:1235a7b2d5e21ff1a531df7fa9ff9ecc490ec6a777567111bbc8bb90608502f8`, válido/incorrecto **2/2**, sin red/montajes. Huella de 26 entradas `cf2f21d8f2fa89a5da415acc5eba63b2efee07deabbe321c44d8ed0f8683f698`: coincide al preparar este prompt. No prueba del servicio completo desplegado.
- Consulta previa de advisories limitada a versiones seleccionadas y al lock: no prueba ausencia global de vulnerabilidades. La actualización efectiva de Electron se acredita por separado con el ejecutable real; SHA-256 del ZIP oficial y del binario constan en el cierre vigente. Node embebido 24.22.0, distinto del Node 24.21.0 de npm.

## 4. Contratos, README y ramas del equipo

Busca consumidores y conflictos semánticos, incluso si Git fusiona sin conflictos:

- `api.maps`/`api.indicators` reciben `accessToken` primero y requieren JWT propio.
- Los wrappers PayPal/reportes genéricos rechazan **410 localmente**; las rutas genéricas ya no se registran (**404 HTTP**). Compras y reportes de negocio autorizados siguen siendo las vías legítimas.
- Firebase ID token no sustituye la sesión propia Nest/FastAPI. Preserva contraseña principal → perfil → PIN temporal/efectivo, roles/propiedad, parcial/SOS, vínculo y máximo cinco apadrinados, contactos/consentimiento, cifrado, compras/reserva/conciliación y soporte/reportes.
- Variables privadas de servidor frente a `VITE_*` públicas; ambos orígenes de API/deployment ID, TLS/proxy/cuotas y defaults por entorno. Conserva LAN/debug; distribución no debe caer silenciosamente en HTTP/IP local, `host.docker.internal` o ejemplos. Merge no actualiza un `.env` existente.
- Cambios de cliente/contrato/XML requieren reconstruir y, en Android, sync/build/reinstalación del artefacto actualizado por su responsable. Build web no prueba GPS/permisos/volumen/FileProvider; APK viejo y bundles sintéticos no acreditan distribución.
- README principal/componentes deben dar instalación y arranque reales en PowerShell y diferencias Linux/macOS; plantillas sin sobrescribir privados; ninguna migración/seed/reset automático al instalar. Contrasta cada script recomendado con sus efectos.

El manifiesto conserva referencias locales/remotas y fechas de sus commits, **sin fetch ni garantía de frescura**. Hay `origin/diego` y `origin/gabriel` disponibles; `main` local y `origin/main` difieren. La fecha del commit no es fecha de última actualización de la referencia ni acredita cambios sin publicar de compañeros. Identifica destino acordado, SHAs, antigüedad y referencias faltantes. `CONTRIBUTING.md` describe PR hacia main y prohíbe merge directo entre ramas personales; no lo conviertas en una orden de integrar ni asumas una referencia destino concreta.

Con commit y destino inequívocos, compara tres vías o simula solo en repositorio temporal independiente, sin escribir metadatos/objetos/refs en la copia del usuario. Sin commit, compara el snapshot completo con deltas disponibles: no llames «merge simulado» a revisar solo HEAD. Sin ramas/deltas actualizados del equipo, declara que la compatibilidad todavía no puede confirmarse. No elijas arbitrariamente un lado del lock ni reintroduzcas bypasses para resolver conflictos.

## 5. Ensayos locales y comprobaciones focalizadas

Separa **comprobado localmente**, **preparado para destino** y **pendiente de responsable/proveedor**:

| Área | Evidencia disponible al preparar el prompt | Evidencia todavía necesaria |
|---|---|---|
| TLS | Validadores/configuración y Compose sintético; no conexión PostgreSQL TLS real ensayada | BD NUEVA con CA/certificado sintéticos, hostname válido y servidor TLS; conexión desde adaptadores reales Nest/FastAPI y rechazo por CA/identidad incorrecta. Hosting/DNS/firewall/renovación siguen externos |
| Permisos | Propuesta estática de tablas/secuencias/helpers/triggers; no grants aplicados | Aprovisionamiento reproducible protegido por identidad de recurso, rol app sin owner/admin; flujos críticos y denegación controlada DDL/roles/TRUNCATE/catálogos en BD propia |
| Secretos | Limpieza documental y runbook; ninguna revocación real acreditada | Inventario por tipo/ubicación/responsable/mecanismo/evidencia; reemplazo JWT coherente en ambas APIs y efecto en SOS nativo ensayado solo con claves sintéticas. Revocaciones reales a cargo del responsable |
| Backup | VM/manifiesto/colisión; no restauración PostgreSQL ejecutada | Dump pequeño explícito y restauración en OTRA BD/volumen nuevo vacío; constraints/secuencias/fixtures/permisos y descifrado con clave sintética aparte. Versiones de herramientas, owners/grants y políticas RPO/RTO reales documentados |

No presupongas que los ensayos solicitados al siguiente ejecutor ya ocurrieron. Revisa cualquier evidencia nueva; si necesitas reproducir un hallazgo, solo en recursos propios nuevos, identificados y desechables. Lee `init.sql`/migraciones sin modificarlos y aplícalos exclusivamente a la BD nueva; fixtures revisadas, nunca `seed-dev`. No ejecutar init.sql sobre una restauración ni el backup local por defecto suponiendo que apunta al entorno nuevo. Claves/dumps/CA privadas fuera del candidato; no instalar CA en el almacén global. Limpia únicamente recursos creados por esta revisión y verificados por identidad.

Antes de importar/arrancar apps: entorno test sin `.env` heredado, fixtures/dobles antes del bootstrap y egreso a terceros bloqueado. Sin localhost:5433, BD/volúmenes/credenciales existentes, emisor real o proveedor. Casos secuenciales, máximo seis dirigidos por riesgo/control; sin fuzzing, fuerza bruta, carga o resiliencia extensa. Reutiliza pruebas pertinentes; no ejecutes toda la batería por defecto.

Comandos existentes para seleccionar **en la copia aislada**, después de revisar scripts y prerrequisitos:

```text
node --experimental-vm-modules --test scripts/backup-db.test.mjs
node --test scripts/seed-safety.test.cjs
node --test apps/desktop/electron/main.test.cjs
node scripts/security-run.mjs python-config
node scripts/security-run.mjs jest --runTestsByPath src/integrations/security-logging.spec.ts
node scripts/security-run.mjs vitest --root apps/mobile --config vite.config.ts --mode security-check --maxWorkers 1 --no-file-parallelism src/lib/session-security.test.ts
node scripts/security-run.mjs build web
node scripts/security-run.mjs build mobile
node scripts/security-run.mjs build desktop
node scripts/check-electron-panel.mjs
```

`python-config` necesita el entorno Python propio y tiene la limitación Windows indicada. Los seis casos de logging y dos de bytes corresponden a controles distintos. Para Compose, entorno sintético explícito y `config --quiet` con env-file vacío (`NUL` Windows, `/dev/null` Unix); no imprimir configuración resuelta ni levantar el Compose existente. `security-db-check.mjs` y `check-pin-image.mjs` requieren revisión y recursos aislados propios; no relanzarlos por rutina ni asumir que la imagen local del autor existe en otra máquina.

## 6. Entrega y orden de uso

Escribe bajo A `docs/REVISION_INTEGRACION_EQUIPO_CLAUDE.md`; si existe un informe ajeno, usa nombre fechado sin sobrescribirlo. Incluye:

1. Snapshot/huella exactos, candidato sin commit o SHA real, archivos/ramas/ref revisados, faltantes y plataforma.
2. Hallazgos por severidad con archivo/línea, escenario, efecto y corrección propuesta; distingue fallo probado, incompatibilidad inferida y evidencia pendiente. No modifiques silenciosamente el producto.
3. Matriz componente → versión requerida/resuelta/ejecutable → comando de instalación → variables → comprobación → resultado; y tabla TLS/permisos/secretos/backups con los tres estados anteriores.
4. Manifiesto de archivos que deberían revisarse para commit y exclusiones privadas; instalación limpia, evidencia ejecutada/reutilizada y límites Android/proveedores/plataformas.
5. Pasos de cada integrante tras incorporar el commit: preservar cambios propios, revisar conflictos semánticos y locks, reinstalar, configurar variables, preparar Python/Electron y reconstruir clientes. No copiar entornos del autor ni tocar datos existentes.
6. Bloqueos locales, mejoras y pendientes externos separados. Revocación/sesión/PIN, réplicas/cuotas y dispatcher ambiguo siguen abiertos según matrices; un borrado local de token no es revocación servidor.

Dictamen limitado: **«candidato preparado para revisión/commit local con pendientes externos»**, **«requiere correcciones antes de integrar»** o **«evidencia insuficiente para las ramas indicadas»**. No declarar listo para publicar o que todas las ramas funcionan por pasar una copia.

Orden: **revisión Claude del candidato → correcciones si corresponden → commit revisado por el usuario → integración del equipo por su flujo acordado → preparación/aceptación de staging**. Hosting, firma/publicación, proveedores reales y ataques/pruebas amplias quedan en sus etapas y responsables. Empieza identificando el candidato real y revisa sin repetir el historial completo.
