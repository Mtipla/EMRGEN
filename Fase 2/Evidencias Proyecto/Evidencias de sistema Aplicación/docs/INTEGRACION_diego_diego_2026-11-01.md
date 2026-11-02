# Integración diego → alonso — 01-11-2026

**Estado:** Node, Electron y el venv de la copia de trabajo (A) quedan alineados con la referencia; el venv pasó a Python 3.12.10 con autorización de Diego (§10). Las comprobaciones de esta sesión pasan en una copia aislada, sin `.env` y con egreso bloqueado. **Los contenedores `backend` e `internal-api`, recreados fuera de esta sesión a las 22:05, figuran `unhealthy` (P4).** No se corrigió código porque no apareció ninguna discrepancia que lo requiriera. No se aprueba integridad funcional completa ni «listo para hosting».

Operaciones Git de esta sesión: solo lectura (`ls-remote`, `log`, `diff`, `merge-base`, `merge-tree` sin escritura de refs). Sin staging, commit, merge, push, checkout, reset, restore, stash ni fetch. Índice vacío. `graphify-out/` no se regeneró, restauró ni modificó. La revisión histórica de Claude y el cierre del autor no se reescribieron.

---

## 1. Ramas y SHAs

Refs remotas confirmadas con `git ls-remote origin` el 01-11-2026, sin fetch; coinciden con las `origin/*` locales.

| Elemento | Valor | Nota |
|---|---|---|
| Rama fuente (integrante) | `diego` = `249a894c554ad7fb5f50329551d0a1ef6b3f6942` | Igual a `origin/diego`. Árbol limpio. |
| Destino | `origin/alonso` = `16059d80c0c9c607b13774319a4f0c8c572e94ae` | La ref local `alonso` está desactualizada (`746e029`); no usarla como referencia. |
| SHA del fortalecimiento | `d1026df66ef7c00aaf580ac553dc1f444192ad32` | «Ajuste completo de ciberseguridad, accesos, variables y credenciales» (AlonsoFGJ). Ancestro de `origin/alonso` y de `diego`. |
| Otras | `origin/gabriel` = `03a06ec`; `origin/graphify` = `7e35ae3`; `origin/main` = `3b6e209` | `origin/main` es ancestro de `diego`. |

**Dirección acordada:** rama del integrante → `alonso`, excepción expresa del responsable para esta integración. CONTRIBUTING sigue describiendo el flujo general hacia `main` y prohíbe merges entre ramas individuales; no se modificó esa regla.

**Estado de la incorporación**

| Dirección | Estado | Evidencia |
|---|---|---|
| `alonso` → `diego` (fortalecimiento) | **Ya presente** | `origin/alonso` es ancestro de `diego`, por `249a894`, anterior a esta sesión. No repetir. |
| `diego` → `alonso` | **Pendiente** | `diego` va 4 commits por delante y 0 por detrás. |

**Qué falta realmente en `alonso`:** `diego` no tiene contenido propio de producto pendiente. Sus 4 commits son 3 merges de Diego y `03a06ec` (enderus422, rama `gabriel`). Fuera de `graphify-out/`, `diego` y `origin/gabriel` son idénticos. Lo pendiente son 56 archivos, todos de `03a06ec`: tres de pruebas y configuración de tests, un reporte de Gabriel y la carpeta `auditoria-qa-seguridad/2026-10-30/`. No tocan lock, `init.sql`, `package.json`, migraciones ni requisitos Python.

### Decisión para el responsable: `graphify-out/`

`git merge diego` estando en `alonso` sería un **fast-forward** (la base común es `16059d8`) y cambiaría 258 archivos, no 56: los otros 202 son de `graphify-out/`. `diego` tiene `graphify-out/` idéntico a `origin/graphify`, y `alonso` difiere en esos 202. El resultado descartaría el grafo que `alonso` subió en `16059d8`.

| Opción | Efecto en `graphify-out/` de `alonso` | Valoración |
|---|---|---|
| A. Integrar `origin/gabriel` en `alonso` | Cambian 5 archivos (`.nudges`). Mismos 56 archivos de contenido | **Recomendada:** es la fuente real de `03a06ec`. Los 5 `.nudges` conviene excluirlos. `diego` no aporta contenido adicional. |
| B. Integrar `diego` por fast-forward | Queda igual a `origin/graphify` (202 archivos) | Coherente con «el grafo solo cambia en `graphify`», pero deja sin efecto `16059d8`. Solo si Alonso lo acepta. |
| C. Integrar `diego` con `--no-ff`, conservando `graphify-out/` de `alonso` | Sin cambios | Registra la integración de la rama de Diego; exige conservar a mano esa carpeta. |

`git merge-tree` no reporta conflictos para `diego` → `alonso`. Las operaciones Git quedan a cargo del usuario y del responsable.

**Llevar cambios a `alonso` no modifica `diego`:** la rama probada aquí es `diego` en `249a894`. Si `alonso` avanza después, esta evidencia no la cubre.

**Manifiesto `docs/MANIFIESTO_CANDIDATO_PRECOMMIT.json`:** su `base_head` (`6c228e6`) y su estado «sin commit» quedaron superados por `d1026df`. No se usa como evidencia de aceptación.

---

## 2. Plataforma y versiones

| Componente | Referencia | Observado | Estado |
|---|---|---|---|
| SO / arquitectura | Windows x64 | Windows 11 Home 10.0.26300, AMD64 | Registrado |
| Node | 24.21.0 (`^24.21.0`) | v24.21.0 | Coincide |
| npm | 11.19.0 (`^11.19.0`) | 11.19.1 | Dentro de engines |
| Python en PATH | 3.12 | No hay `python` ni `py` en PATH | Sin efecto en el venv; los comandos usan su intérprete directo o uv |
| Python 3.12 | 3.12.10 | 3.12.10 instalado en esta sesión con uv, a nivel de usuario | Coincide |
| Venv de A | 3.12 | 3.12.10 (antes 3.14.7; respaldo en §10) | Coincide |
| bcrypt Python | 5.0.0 | 5.0.0 (copia y venv de A) | Coincide |
| Electron | 44.9.1 | 44.9.1 en A y en la copia; `dist/version` = 44.9.1 | Coincide |
| Node embebido / Chromium | 24.22.0 | 24.22.0 / 152.0.7977.167 (ejecutable real, copia) | Coincide |
| Vite / TypeScript / Turbo | 8.3.3 / — / — | 8.3.3 / 6.0.3 / 2.11.2 | Coincide |
| Cypress | 13.17.0 opcional | 13.17.0 en paquete; binario no instalado | No necesario aquí |
| Docker / Compose | solo si se usan | 29.8.0 / v5.5.1 | Registrado |
| PostgreSQL | 15 | Imagen `postgres:15-alpine`; versión del servidor no consultada | Solo metadatos |
| `package-lock.json` | `2bcdf7d4…` | `2bcdf7d4d414a4b12a73ba862bda191344a2502946e35bfdf56b62918f78ebbf` | Coincide |
| Lock Linux Python | `64402c27…` | `64402c27eb9a659ce012b7ef0adb333e12cab299a4b345b14ca638d8c9395761` | Coincide; no aplica a Windows |
| `init.sql` | `d4e71a57…` | `d4e71a576baaab8192e9482eb7304d9f69bacc82d3c1be361830cee0c8e78f68` | Coincide; sin cambios |

**Servicios observados (solo metadatos; esta sesión no operó sobre ellos):**

| Momento | `postgres_emergen_db` | `nestjs_emergen_backend` | `fastapi_emergen_internal` |
|---|---|---|---|
| Al inicio (≈20:00) | En ejecución | Detenido (código 137) | No existía |
| 22:10, tras la recreación externa de las 22:05 | `healthy`, 0 reinicios | **`unhealthy`**, 18 fallos seguidos, 0 reinicios | **`unhealthy`**, 19 fallos seguidos, 0 reinicios |

Las tres recreaciones y las imágenes `backend` e `internal-api` (22:05) ocurrieron fuera de esta sesión. Los volúmenes siguen siendo `volumen_emergen_postgres_data` y `volumen_emergen_whatsapp_auth`. No se leyeron logs ni la causa del estado. Al inicio no había procesos `node`, `electron` ni `python` activos; VS Code sí estaba abierto. Las §5 y §6 no prueban estos contenedores.

---

## 3. Acciones e instalaciones

### En A (copia de trabajo)

| Paso | Resultado |
|---|---|
| Revisión previa | Sin scripts de ciclo de vida en raíz ni workspaces. `.npmrc` sin flags inseguros. Sin procesos usando las dependencias. |
| `npm ci` | **No se ejecutó, por innecesario:** `node_modules/.package-lock.json` (escrito hoy a las 19:52, antes de esta sesión) coincide con el lock: 0 faltantes, 0 diferencias, 0 sobrantes. El lock no cambió después. |
| `node node_modules/electron/install.js` | EXIT 0. Es la dependencia local 44.9.1, con `checksums.json`. SHA-256 del ejecutable `1432afee…`, igual al del cierre vigente. |
| Sustitución del venv (§10), autorizada por Diego | Sin procesos del venv activos. Venv 3.14.7 movido a respaldo; venv nuevo 3.12.10 con `requirements.txt`, EXIT 0; `pip check` sin problemas; bcrypt 5.0.0. |
| `node scripts/security-run.mjs python-config` en A | 2 tests / 6 casos de Settings, EXIT 0, sin BD ni archivos env. |
| PIN sintético con `verify_pin` real (socket bloqueado) | Válido/incorrecto correctos en 3.12.10. |

### En el equipo (nivel de usuario)

`uv python install 3.12.10`. Añade el intérprete a la carpeta de uv y `python3.12.exe` a `.local\bin` del perfil. Reversible con `uv python uninstall 3.12.10`.

### En la copia aislada

Copia con `git archive` de `249a894` en la carpeta temporal de la sesión, fuera del repositorio. Como el árbol estaba limpio, HEAD representa todas las fuentes. Sin `.env`, `node_modules` ni `.venv` del autor. Se puede borrar; ocupa 1,1 GB.

| Paso | Resultado |
|---|---|
| `npm ci --no-audit --no-fund` | EXIT 0, 1485 paquetes, lock intacto. npm omitió scripts de 9 dependencias sin aprobar en `allowScripts`; no se habilitaron. |
| `node node_modules/electron/install.js` | EXIT 0, 44.9.1. |
| Venv Python 3.12.10 + `pip install -r requirements.txt` | EXIT 0, `pip check` sin problemas, bcrypt 5.0.0. |

---

## 4. Correcciones mínimas

**Ninguna en esta sesión.** Sin cambios de código, plantillas ni configuración privada; el único archivo nuevo es este reporte.

Los pendientes del reporte de Gabriel (`INTEGRACION_gabriel_gabriel_2026-10-30.md`) ya están resueltos en `03a06ec`, comprobados aquí:

| Punto anterior | Estado en `diego` |
|---|---|
| C1 `apadrinados.service.spec.ts` | Incluido; pasa. |
| D1 `admin-tickets.service.spec.ts` | Resuelto con la opción (a): conserva el tope y añade la prueba del 413; pasa. |
| `apps/web/vitest.config.ts` (QA-REG-02) | Incluido; carga y pasa. |

**Observación no corregida (O1):** `security-run.mjs vitest` no aporta `VITE_FIREBASE_*` sintéticas, así que varias suites web y móvil fallan en un entorno sin `.env` (§5). No es un defecto de producto ni figura en el menú del encargo. Se propone añadirlas en esa rama del harness si se quiere usar para estas suites; queda a decisión del responsable.

---

## 5. Comandos y resultados

Todo desde la copia aislada y con evidencia **nueva** del 01-11-2026, salvo indicación.

| Comando | Resultado |
|---|---|
| `node --test scripts/seed-safety.test.cjs` | 7/7, EXIT 0 |
| `security-run.mjs jest --config test/jest-e2e.json --runTestsByPath test/security-boundaries.e2e-spec.ts --testNamePattern CORS` | **6 aprobados, 6 omitidos**, EXIT 0. El 414 no se ejecutó. |
| El mismo spec, sin selector | 12/12, EXIT 0. Incluye los 3 casos 404 de rutas retiradas y los de mapas con y sin sesión. |
| `security-run.mjs jest` (unitarias de backend) | **30/30 suites, 265/265 pruebas**, EXIT 0 |
| `security-run.mjs python-config` | 2 tests / 6 casos de Settings, EXIT 0 (Python 3.12.10) |
| `node --test` android-lan-env, api-environment, expected-schema | 11/11, EXIT 0 |
| `security-run.mjs vitest --root packages/api-client` | 4 archivos, 31/31, EXIT 0 |
| `security-run.mjs vitest --root apps/web` | **EXIT 1:** 4 archivos con fallos, 26 pruebas fallidas, 76 aprobadas. `auth/invalid-api-key` y `Unable to find a label… Correo`. Ver O1. |
| `security-run.mjs vitest --root apps/mobile` | **EXIT 1:** `App.test.tsx` no carga (`auth/invalid-api-key`); 53 aprobadas. Ver O1. |
| Vitest web, con preload de seguridad y `VITE_*` sintéticas | **15 archivos, 110/110**, EXIT 0 |
| Vitest móvil, con preload de seguridad y `VITE_*` sintéticas | **10 archivos, 54/54**, EXIT 0 |
| `security-run.mjs build backend` / `@repo/api-client` / `web` / `mobile` / `desktop` | Los 5 con EXIT 0 (aviso de chunk >500 kB en web y desktop). No se generó APK. |
| `node scripts/check-electron-panel.mjs` | **6/6**, EXIT 0, Windows x64, 7 peticiones simuladas, WebSockets denegados. `main.cjs` e `index.html` con los mismos hashes del cierre vigente. |
| `verify_pin` real con PIN sintético y socket bloqueado | Válido/incorrecto correctos en 3.12.10 y 3.14.7 |
| Búsqueda de 6 valores privados de `.env` en los 56 archivos pendientes | 0 coincidencias; no se imprimió ningún valor |

**Comprobación sobre URLs reales (fuera de la copia):** `npm run check:environment`, equivalente `node scripts/check-environment.mjs --mode development|docker|android-lan`, ejecutado una vez desde A. Intentó conectar a las URLs configuradas en el equipo y terminó con EXIT 1, «no se pudo conectar», porque las APIs están detenidas. No creó SOS, no envió mensajes y no contactó a terceros. Sirve solo para constatar que el entorno integrado **no está en marcha**; no es una prueba de aceptación.

**No ejecutado:** 414; CORS nativo real (`file://` / `Origin: null`); servicios activos; BD; seed; migraciones; `verify-schema`; pytest completo; panel Electron en A (escribiría un bundle sintético en su `dist`); proveedores reales; firma; APK; Android físico.

---

## 6. Matriz funcional

«Dobles» = dependencias simuladas, sin BD ni proveedor real. Toda la evidencia es nueva, de la copia aislada.

| Función | Caso / comando | Estado | Límite |
|---|---|---|---|
| Identidad / login → perfil → PIN | `login-pin`, `firebase-auth.guard`, `firebase-auth.service`, `session` (dobles); `verify_pin` sintético | Aprobado (dobles) | Sesión real, recuperación y PIN temporal/efectivo sobre BD: no ejecutado |
| Roles / parcial / apadrinados | `apadrinados.service`, `admin-acceso` (dobles); sesión parcial en e2e | Aprobado (dobles) | Propiedad, vínculo y máximo de cinco con BD: no ejecutado |
| Perfil / contactos / consentimiento | `cifrado-medico` (claves sintéticas), `perfil.dto`, `phone-number` | Aprobado (dobles) | Consentimiento y contactos con BD: no ejecutado |
| SOS con y sin GPS | `whatsapp-sos-dispatcher`, `whatsapp-alert`, `whatsapp-connection`, `emergency-alert.message`; despacho falso | Aprobado (dobles), solo despacho | Creación, idempotencia, cierre e historial con BD: no ejecutado. GPS real: pendiente manual |
| Compras | `paypal.service`, `compras.constants`, `mindicador.service` (proveedor falso) | Aprobado (dobles), parcial | Precio de servidor, reserva/cupos, captura y conciliación de extremo a extremo: no ejecutado |
| Soporte / contacto / reportes | `admin-tickets` (servicio y controlador), `admin.service`, `jsreport.service`, `auditoria.service`; suites web de soporte y contacto (`VITE_*` sintéticas) | Aprobado (dobles) | Exportación completa con BD real y entrada inválida de extremo a extremo: no ejecutado |
| Arranque / health / clientes | `health.controller`, `app.controller`, `runtime-config`; 5 builds; panel 6/6 simulado; web 110 y móvil 54 | Aprobado (build, panel simulado, dobles) | Health no prueba todos los flujos. Login/logout contra backend real: no ejecutado |
| CORS / consumidores | H3 6 aprobados y 6 omitidos con selector; spec completo 12/12; api-client 31/31 | Aprobado parcial | 414 y CORS nativo real: pendiente. El panel simulado no acredita CORS real |
| Rutas retiradas | 404 HTTP en `/payments/paypal/*` y `/reports` (e2e); 410 local en wrappers (api-client) | Aprobado | Retirada intencional; no restaurar |
| Configuración (H2) | `seed-safety` 7/7; `runtime-config`; `python-config` | Aprobado | Demo en BD nueva no ejecutada; no hace falta para actualizar |
| Android / dispositivo / proveedores | — | **Pendiente manual** | Ver P6 |

**Consumidores:** ninguna app llama a `api.maps`, `api.indicators`, `api.paypal` ni `api.reports`; solo aparecen en pruebas de `packages/api-client`. El contrato de `accessToken` primero está cubierto por esas pruebas. `renderPaypalButtons` sigue exportado y llama al wrapper retirado, sin importadores en apps (P9).

---

## 7. Credenciales y variables faltantes

Comparación local de nombres entre `example.env`, `apps/backend/.env.local.example`, `services/internal-api/.env.example`, `.env.android-lan.example`, `deploy/production.env.example` y los archivos privados de A. **No se imprimieron valores ni se modificó ningún archivo privado.** No pegues secretos en el chat; complétalos directamente en el archivo indicado.

Modo revisado: desarrollo local, con PostgreSQL en Docker y APIs en host o Docker.

### 7.1 Impiden arrancar o probar una función en desarrollo

**Ninguna detectada.** Las variables requeridas por `docker-compose.yml` (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`) están presentes, y las pruebas con dobles no usan ninguna credencial privada.

### 7.2 Faltantes opcionales en desarrollo

| Variable | Componente / función | Estado | Necesidad | Archivo privado | Responsable / siguiente paso |
|---|---|---|---|---|---|
| `WHATSAPP_SENDER_PHONE` | SOS por WhatsApp: valida la cuenta emisora | Vacía | Opcional en desarrollo; obligatoria en staging/production | `.env` | Responsable del emisor, antes de una prueba real |
| `WHATSAPP_AUTH_DIR` | Sesión Baileys | Ausente | Opcional: valor por defecto en local y fijado por Compose; obligatoria en destino | `.env` | Responsable del destino; no tocar la sesión existente |
| `VITE_GOOGLE_MAPS_MAP_ID` | Estilo de mapa en clientes | Placeholder | Opcional | `.env` | Integrante o responsable del proyecto Google |
| `VITE_DEPLOYMENT_ID`, `EMERGEN_DEPLOYMENT_ID` | Identidad de despliegue en clientes y health | Ausentes | Opcionales (`local`); obligatorias e iguales en destino | `.env` | Responsable, al definir el destino |
| `EMERGEN_ENVIRONMENT` | Modo de validación | Ausente | Opcional: `development` por defecto | `.env` | Ninguno en local |
| `EMERGEN_SEED_EXPECTED_DB` | Seed de demo | Ausente | **Correcto:** no se ejecuta seed sobre la BD existente | No aplica | Ninguno |

Los límites y ajustes `API_*`, `DB_POOL_MAX`, `DB_STATEMENT_TIMEOUT_MS` e `INTERNAL_API_*` también están ausentes y usan valores por defecto, igual que `HOST`. `services/internal-api/.env` no existe y no es necesario.

### 7.3 Solo para destino futuro (no aplican en local)

Archivo privado del servidor, a partir de `deploy/production.env.example`. Responsable del despliegue:

`BACKEND_IMAGE`, `INTERNAL_API_IMAGE`, `DB_BOOTSTRAP_USER`, `DB_BOOTSTRAP_PASSWORD`, `APP_DB_USER`, `APP_DB_PASSWORD`, `DB_SSLMODE`, `DB_SSL_CA_FILE`, `CA_DIRECTORY`, `PRODUCTION_DB_VOLUME`, `PRODUCTION_WHATSAPP_VOLUME`, `TRUSTED_PROXY_CIDRS`, `FORWARDED_ALLOW_IPS`.

Todas ausentes en el `.env` local, como corresponde.

### 7.4 Presentes; validez no comprobada

No se contactó a ningún proveedor ni se usaron contra la BD. Las pruebas con dobles no las necesitan.

| Variable | Función | Comprobación local |
|---|---|---|
| `JWT_SECRET` | Sesión de ambas APIs | Formato correcto: ≥32 bytes y mismo valor efectivo en NestJS y FastAPI |
| `MEDICAL_DATA_KEYS` | Cifrado de ficha | Formato correcto (1 clave). No se comprobó que descifre los datos existentes |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | BD local | Presentes; `DB_NAME` es la estándar. No probadas |
| `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `VITE_PAYPAL_CLIENT_ID` | Compras reales | Presentes; `PAYPAL_MODE` en sandbox |
| `GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY` | Mapas | Presentes |
| `FIREBASE_PROJECT_ID`, `VITE_FIREBASE_*` | Registro y recuperación | Presentes |
| `JSREPORT_USERNAME`, `JSREPORT_PASSWORD` | Reportes PDF/Excel | Presentes |

### 7.5 Coherencia de configuración (revisar; no se cambió nada)

| Punto | Observación | Siguiente paso |
|---|---|---|
| Conexión a BD | `.env` usa el servicio interno de Docker y `apps/backend/.env.local` lo sobrescribe con loopback y puerto publicado. El valor efectivo es correcto para host y Docker | Ninguno |
| `VITE_API_URL`, `VITE_INTERNAL_API_URL` | Mismo host y puertos 3000/8000, pero en `.env` apuntan a una **IP privada de LAN**, igual que `.env.android-lan.local`. El README propone `localhost` para desarrollo | Integrante: si cambia de red, web y panel locales dejarán de conectar. Decidir si `.env` vuelve a loopback y dejar la LAN solo en `.env.android-lan.local` |
| `WHATSAPP_ENABLED` | Está en `true` | Arrancar el backend intentará usar la sesión real. Mantener una sola instancia; usar `false` si solo se prueba |
| `CORS_ORIGINS` | 5 orígenes, sin comodín, incluye los locales y `https://localhost` | Ninguno. No acredita CORS nativo real |
| Sobrantes | `AUTH0_ISSUER_URL`, `AUTH0_AUDIENCE` no están en la plantilla. `INTERNAL_API_CORS_ORIGINS` tampoco, pero sí se usa en el código | Integrante puede retirar las de `AUTH0` si no las usa |
| Android | `.android.local.json` sin claves faltantes; `.env.android-lan.local` con ambas URLs | Ninguno |

**Conclusión:** no hay faltantes que impidan el alcance revisado. Eso no valida las credenciales presentes ni garantiza todas las funciones. H1 (revocación y rotación) sigue excluido y pendiente antes de hosting.

---

## 8. Pendientes

| # | Pendiente | Responsable | Siguiente paso |
|---|---|---|---|
| P1 | **Cerrado:** venv de A en Python 3.12.10 | Diego | Solo queda decidir cuándo borrar el respaldo de §10, tras arrancar FastAPI local una vez |
| P2 | Dirección de integración y `graphify-out/` (§1) | Responsable / Alonso | Elegir opción A, B o C. Git queda a su cargo |
| P3 | `auditoria-qa-seguridad/2026-10-30/scripts/aud-docker-secrets.env` versionado por `03a06ec`, con nombres `JWT_SECRET` y `MEDICAL_DATA_KEYS`; la documentación lo declara sintético y sus valores no coinciden con el `.env` de este equipo. Los logs traen rutas absolutas de otro equipo | Gabriel / responsable | Confirmar que es sintético y decidir si esa carpeta entra en `alonso` |
| P4 | Backend y FastAPI en Docker **`unhealthy`** tras la recreación externa de las 22:05; causa no revisada; procedencia de imágenes sin comprobar | Diego | Revisar el estado de salud sin exponer configuración ni logs completos en reportes. Si el backend quedó activo, considerar `WHATSAPP_ENABLED=true` (§7.5). Esta sesión no los reinició |
| P5 | Migraciones de la BD existente sin verificar (`init.sql` no se toca) | Diego / responsable | Con respaldo y APIs detenidas, seguir `docs/DESPLIEGUE.md`. No ejecutar seed. No se hizo aquí |
| P6 | APK no reconstruido; GPS con/sin permiso, segundo plano, volumen, FileProvider | Responsable Android | Cambiaron fuentes móviles respecto de versiones anteriores: reconstruir frontend, sincronizar Capacitor e instalar según README §11. No reutilizar un APK antiguo |
| P7 | CORS nativo real y caso 414 | Responsable | Probar con servicio aislado y puerto propio; no debilitar la allowlist |
| P8 | Flujos con BD (compras, SOS, roles, cuotas, exportación) | Responsable | BD nueva, desechable y sintética. No usar los datos existentes ni pytest completo con `conftest` contra ellos |
| P9 | `renderPaypalButtons` y controladores sin registrar de PayPal/reportes | Responsable | Decidir retirada o migración. No restaurar rutas |
| P10 | O1: harness Vitest sin configuración pública sintética | Responsable | Decidir si se amplía `security-run.mjs` |
| P11 | Manifiesto de pre-commit superado por `d1026df` | Responsable | Marcarlo como histórico o regenerarlo |
| P12 | H1 antes de hosting; TLS/ingreso/CSP, roles efectivos, restauración/descifrado, política común de sesión/PIN, cuotas entre réplicas, entregas ambiguas, proveedores, firma y publicación | Responsable | Fuera de esta sesión; sujeto a decisión y evidencia propias |

---

## 9. Plan para servicios propios (no ejecutado por esta sesión; requiere autorización)

Plan previo a la recreación externa de las 22:05; se conserva como referencia para futuras reconstrucciones. Impacto: reconstruye las imágenes `backend` e `internal-api`, y conserva PostgreSQL.

- **Recursos:** proyecto `evidenciasdesistemaaplicacin`; volúmenes `volumen_emergen_postgres_data` y `volumen_emergen_whatsapp_auth`, que deben conservarse.
- **Antes:** respaldo con `npm run backup:db`, verificar P5 y decidir `WHATSAPP_ENABLED`. Con `true` se usará la sesión real.
- **Comando:** `docker compose up -d --build backend internal-api`, desde A.
- **Nunca:** `down -v`, `volume rm`, seed ni renombrar la BD.

---

## 10. Sustitución del venv (P1; ejecutada con autorización de Diego)

Ejecutada desde A, sin procesos del venv activos. El contenedor FastAPI no usa este venv. El venv anterior se movió fuera del repositorio porque otro nombre dentro de la carpeta no quedaría ignorado por Git:

```powershell
$respaldo = Join-Path $env:LOCALAPPDATA 'emergen-venv-py314-respaldo'
Move-Item -LiteralPath services/internal-api/.venv -Destination $respaldo
uv venv --python 3.12.10 --seed services/internal-api/.venv
.\services\internal-api\.venv\Scripts\python.exe -m pip install -r services/internal-api/requirements.txt
.\services\internal-api\.venv\Scripts\python.exe -c "import bcrypt; print(bcrypt.__version__)"
```

El respaldo se conserva en `%LOCALAPPDATA%\emergen-venv-py314-respaldo`. FastAPI completo no se arrancó con el venv nuevo.

---

## 11. Archivos revisables y exclusiones

**Nuevo en esta sesión (sin stage):** `docs/INTEGRACION_diego_diego_2026-11-01.md`.

**Excluidos de cualquier commit de esta integración:**
- `graphify-out/` y sus cachés.
- `node_modules/`, `.venv/`, `dist/`, `build/` y la copia aislada.
- `.env`, `.env.*.local`, `apps/backend/.env.local`, `.android.local.json` y cualquier archivo privado.
- Backups, sesión de WhatsApp, material de firma, APK, bundles `security-check`, capturas y cachés.
- QA ajena (`auditoria-qa-seguridad/`) como trabajo de Diego: pertenece a `03a06ec` (ver P3).

---

## 12. Límites de la evidencia

**Comprobado localmente**
- Copia aislada: instalación limpia, suites y builds de §5, y panel nativo con APIs simuladas.
- A: Node y lock alineados, Electron 44.9.1 instalado, venv 3.12.10 con configuración Python y PIN sintético correctos.

**Preparado para destino**
- Variables de staging y production identificadas (§7.3); no configuradas ni probadas.

**Pendiente externo o manual**
- P2–P12.

**Conclusión:** la copia aislada y las herramientas de A (Node, Electron y venv) están en condición de **entorno local preparado para testing con la cobertura indicada**. Esto no incluye los contenedores `backend` e `internal-api`, `unhealthy` a las 22:10 (P4). Los flujos con BD, proveedores y Android siguen sin ejecutar. Las pruebas con dobles no sustituyen la prueba con BD ni con servicios reales. No se afirma integridad total ni «listo para hosting».
