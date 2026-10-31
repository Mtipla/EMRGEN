# Integración gabriel → alonso — 30-10-2026

**Estado:** copia aislada preparada y verificada para la matriz indicada. Entorno de la copia de trabajo (A) **pendiente de dos decisiones del integrante** (venv Python y modo de base de datos). Una suite unitaria **falla** y queda abierta para el responsable. No se aprueba integridad funcional completa ni «listo para hosting».

Operaciones Git: ninguna (sin staging, commit, merge, push, checkout, reset, restore ni stash). Índice vacío al cierre. Revisión histórica de Claude y cierre del autor no reescritos.

---

## 1. Ramas y SHAs

| Elemento | Valor observado | Nota |
|---|---|---|
| Rama fuente (integrante) | `gabriel` = `16059d8` | Cabecera de `gabriel` idéntica a `alonso`. |
| Destino | `alonso` = `16059d8` | Destino fijado por el responsable. |
| SHA del fortalecimiento | **`d1026df66ef7c00aaf580ac553dc1f444192ad32`** | «Ajuste completo de ciberseguridad, accesos, variables y credenciales». Autor del commit: AlonsoFGJ. Ancestro de `alonso` y `gabriel`. |
| Commit posterior | `16059d8` «Actualización de Graphify» (AlonsoFGJ) | Incluye cambios de `graphify-out/` en `alonso` (ver §9). |
| HEAD de `main` local | `3b6e209` | Sin verificar frente a origin. |
| Refs `origin/*` | No actualizadas en esta sesión (no se hizo fetch) | El manifiesto citaba otros SHAs de origin/*; no se toman como vigentes. |

**Dirección acordada:** rama del integrante → `alonso`, excepción expresa del responsable para esta integración. CONTRIBUTING sigue describiendo el flujo general hacia `main` y prohíbe merges entre ramas individuales; no se modificó esa regla.

**Incorporación:** ya presente.
- `b41848c` (último commit propio de `gabriel`) es ancestro de `alonso` (incorporado en `81d4692`).
- `gabriel` y `alonso` apuntan al mismo SHA. El reflog de `gabriel` muestra avances «merge origin/alonso: Fast-forward». Esto ocurrió antes de esta sesión y no se revierte. **Para el responsable:** `gabriel` contiene ahora el fortalecimiento de Alonso por fast-forward, no por `main`.
- No se ejecutó ningún merge inverso.

**Manifiesto `docs/MANIFIESTO_CANDIDATO_PRECOMMIT.json`:** su `base_head` (6c228e6) y su estado «sin commit» quedaron superados por `d1026df`. Comprobación de hashes frente a HEAD: 94 entradas con hash; 36 coinciden exactamente, 58 no. Frente a disco, 57 coinciden en bytes y 36 de las diferencias desaparecen al normalizar CRLF/LF (`core.autocrlf=true`). Queda 1 diferencia sin explicar y ediciones documentales posteriores. **Conclusión:** el manifiesto no prueba el contenido del commit y no se usa como evidencia de aceptación.

---

## 2. Plataforma y versiones

| Componente | Referencia (manifiesto / encargo) | Observado | Estado |
|---|---|---|---|
| SO / arquitectura | Windows x64 | Windows 10 Pro 10.0.19045, x86_64, shell Git Bash (MINGW64) | Registrado |
| Node (sistema) | 24.21.0 | v24.21.0 | Coincide |
| npm | 11.19.0 (engines ^11.19.0) | 11.19.1 | Dentro de engines; diferencia de parche |
| Python (launcher por defecto) | 3.12 | **3.14.7** | No coincide |
| Python de prueba (copia) | 3.12.10 | CPython 3.12.10 instalado con uv (perfil de usuario) | Usado para el venv de la copia |
| `.venv` existente en A | 3.12 | **Creado con 3.14.7** (`pyvenv.cfg`) | **Pendiente de decisión** (§8) |
| bcrypt Python | 5.0.0 | 5.0.0 en venv de la copia | Coincide |
| bcrypt Node (backend) | — | 6.0.0 | Script de instalación omitido por política de npm; las pruebas que lo cargan pasan |
| Electron | 44.9.1 | 44.9.1 (dist/version 44.9.1) | Coincide |
| Node embebido de Electron | 24.22.0 | 24.22.0 (Chromium 152.0.7977.167) | Coincide |
| Vite | 8.3.3 | 8.3.3 | Coincide |
| TypeScript / Turbo | — | 6.0.3 / 2.11.2 | Registrado |
| Docker / Compose | solo si se usa | Docker 29.8.0 / Compose v5.5.1 detectados | No usados en esta sesión |
| PostgreSQL | 15 (referencia) | No consultado | No verificado (sin conexión a BD, por aislamiento) |
| Lock npm | `2bcdf7d4…` | `package-lock.json` = `2bcdf7d4d414a4b12a73ba862bda191344a2502946e35bfdf56b62918f78ebbf` | Coincide |
| Lock Linux Python | `64402c27…` | No instalado (es runtime Linux; no aplica a Windows) | Sin cambios |
| `init.sql` | `d4e71a57…` | Coincide | Protegido, sin cambios |

---

## 3. Instalaciones (copia aislada)

Copia aislada creada con `git archive` de HEAD (`16059d8`) de A, fuera de OneDrive, en la carpeta temporal de sesión. Sin `.env`, `node_modules`, `.venv`, backups ni datos del autor. La copia contiene el mismo lock que A.

| Paso | Resultado |
|---|---|
| `npm ci --no-audit --no-fund` | EXIT 0, 1485 paquetes. npm 11 omitió los scripts de 9 dependencias (p. ej. `bcrypt@6.0.0`, `@parcel/watcher`, `@firebase/util`, `@whiskeysockets/baileys`). No se habilitaron globalmente. |
| `npm ls electron --workspace=apps/desktop` | `electron@44.9.1` |
| `node node_modules/electron/install.js` | EXIT 0; dist presente; versión 44.9.1 |
| Venv Python 3.12.10 + `pip install -r services/internal-api/requirements.txt` | EXIT 0 (venv propio de la copia) |
| Verificación bcrypt | 5.0.0; PIN sintético válido/incorrecto 2/2 (sin red, sin BD) |

A (copia de trabajo) **no se reinstaló**: sus `node_modules` y `.venv` pueden estar en uso y no se eliminaron. Las instrucciones de §8 la actualizan cuando el integrante decida.

---

## 4. Correcciones mínimas

| # | Archivo | Origen | Antes | Después | Estado |
|---|---|---|---|---|---|
| C1 | `apps/backend/src/apadrinados/apadrinados.service.spec.ts` | `d1026df` (código: `LIMIT $2` con `reportLimit()+1`); spec sin cambios desde `0ebbbb4` | 2 pruebas fallaban: el spec esperaba solo los IDs como parámetros | Importa `reportLimit` y espera `[ids, reportLimit() + 1]`. 3 líneas añadidas, 2 eliminadas. Sin cambios en el servicio. | **Aplicada** en A (sin stage). Suite: 13/13 suites, 103/103 pruebas |

**Abierta, no corregida (decisión del responsable):**

| # | Archivo | Situación |
|---|---|---|
| D1 | `apps/backend/src/admin/admin-tickets.service.spec.ts` | Dos pruebas («…sin límite de página», pdf y xlsx) exigen que la consulta de tickets cerrados no tenga `LIMIT`/`OFFSET`. `d1026df` añadió `LIMIT $1` con `reportLimit()+1`, que lanza 413 si se supera (`completeRows`), sin truncar. Es una política de exportación, no un valor a actualizar. **Opciones:** (a) mantener el tope y reescribir la aserción (sin `OFFSET`, con `LIMIT` = tope+1 y prueba del 413); (b) retirar el tope de este informe (decisión de seguridad). Recomendación: (a), porque la respuesta sigue siendo completa o rechazada. Requiere decisión de Alonso o del responsable. |

Nota: C1 supone que el tope `reportLimit()+1` sigue vigente en los informes administrativos. Si el responsable elige (b) para `admin-tickets`, C1 debe revisarse en el mismo criterio.

---

## 5. Comandos y resultados

Todos desde la copia aislada, salvo indicación. Evidencia **nueva** = ejecutada en esta sesión.

| Comando / comprobación | Resultado | Evidencia |
|---|---|---|
| `node --test scripts/seed-safety.test.cjs` | 7/7, EXIT 0 (H2) | Nueva |
| `node scripts/security-run.mjs jest --config test/jest-e2e.json --runTestsByPath test/security-boundaries.e2e-spec.ts --testNamePattern CORS` | **6 aprobados, 6 omitidos, 12 en total**, EXIT 0. El 414 no se ejecutó. | Nueva |
| `node scripts/security-run.mjs build backend` | EXIT 0 | Nueva |
| `node scripts/security-run.mjs build desktop` | EXIT 0 (aviso de chunk >500 kB) | Nueva |
| `node scripts/check-electron-panel.mjs` | 6/6 casos, EXIT 0. Ejecutable, `main.cjs` e `index.html` con los mismos hashes del cierre anterior. Mocks en memoria. | Nueva |
| `node scripts/security-run.mjs python-config` | 2 tests / 6 casos de Settings, EXIT 0 | Nueva |
| `node scripts/security-run.mjs build web` | EXIT 0 (aviso de chunk) | Nueva |
| `node scripts/security-run.mjs build mobile` | EXIT 0 (no se generó APK) | Nueva |
| `node scripts/security-run.mjs build @repo/api-client` | EXIT 0 (check-types) | Nueva |
| `node --test` (test:environment: android-lan-env, api-environment, expected-schema) | 11/11, EXIT 0 | Nueva |
| `security-run.mjs jest --testPathPatterns` (13 suites dirigidas, sin BD) | Antes de C1: 2 fallos (apadrinados). Después de C1: **13/13 suites, 103/103 pruebas** | Nueva |
| `security-run.mjs jest --testPathPatterns` (16 suites más: admin-tickets, admin.service, security, health, http-client, perfil.dto, whatsapp-connection, etc.) | **15 suites OK; 1 fallida (admin-tickets, 2 pruebas = D1)**; 142/144 pruebas | Nueva |
| `security-run.mjs vitest run packages/api-client/src/emergen-api.test.ts` | Contrato de cliente: 13/13. Vitest también recogió un spec de Jest (`describe is not defined`); es un artefacto del filtro, no un fallo del producto. | Nueva |
| Comprobación bcrypt sintética (venv de la copia) | Válido/incorrecto 2/2 | Nueva (mínima; no ejecuta FastAPI) |
| Comparación de nombres `example.env` ↔ `.env` | Ver §7. Solo nombres y estado; no se imprimieron valores. | Nueva |

Lo que **no** se ejecutó: 414; CORS con origen nativo real (`file://` / `Origin: null`); servicios activos; BD; seed; migraciones; pytest completo; proveedores reales; firma; APK; prueba física Android.

---

## 6. Matriz funcional

Estados: aprobado, fallido, no ejecutado, pendiente manual. «Dobles» = pruebas unitarias con dependencias simuladas, sin BD ni proveedor real.

| Función | Caso / comando | Estado | Evidencia | Límite |
|---|---|---|---|---|
| Identidad / login → perfil → PIN | `login-pin.spec`, `firebase-auth.guard.spec`, `firebase-auth.service.spec` (dobles); PIN bcrypt sintético | Aprobado (dobles) | Nueva | Sesión real, recuperación y PIN temporal/efectivo sobre BD: no ejecutado. |
| Roles / parcial / apadrinados | `apadrinados.service.spec` (tras C1), `admin-acceso.spec` (dobles) | Aprobado (dobles) | Nueva | Propiedad y máximo de cinco con BD: no ejecutado. |
| Perfil / contactos / consentimiento | `cifrado-medico.spec` (claves sintéticas), `perfil.dto.spec` | Aprobado (dobles) | Nueva | Consentimiento y contactos reales: no ejecutado. |
| SOS con y sin GPS | `whatsapp-sos-dispatcher.service.spec`, `whatsapp-alert.service.spec`, `emergency-alert.message.spec`, `whatsapp-connection.service.spec` (dobles; despacho falso) | Aprobado (dobles) | Nueva | Creación/idempotencia/historial sobre BD: no ejecutado. GPS con/sin permiso, segundo plano: **pendiente manual** (dispositivo). |
| Compras | `paypal.service.spec`, `compras.constants.spec` (proveedor falso) | Aprobado (dobles) | Nueva | Precio de servidor, reserva/cupos, captura y conciliación de extremo a extremo: no ejecutado. |
| Soporte / contacto / reportes | `jsreport.service.spec`, `admin.service.spec` (dobles) | Aprobado (dobles) | Nueva | **`admin-tickets` «sin límite de página»: fallido (D1)**. Entrada inválida y exportación completa con BD: no ejecutado. |
| Reportes y pagos retirados | Módulos `payments/paypal` y `reports` sin controlador registrado (estructura); cliente devuelve 410 local (`emergen-api.test.ts`) | Aprobado (estructura y contrato) | Nueva | Respuesta HTTP 404 real: no ejecutado (no hay servidor activo). |
| Arranque / health / clientes | `health.controller.spec`, `app.controller.spec`; builds de backend, web, mobile, desktop, api-client; panel Electron 6/6 | Aprobado (build y panel con mocks) | Nueva | Health no prueba todos los flujos. Login/logout contra backend real: no ejecutado. |
| CORS / consumidores | H3: 6 aprobados y 6 omitidos por selector (12 en total); cliente 13/13; `maps`/`indicators` con `accessToken` primero | Aprobado parcial | Nueva | 414 y CORS nativo real: pendiente. Sin llamadas a `api.maps`/`api.indicators` en apps; no se encontraron llamadas a `api.paypal`/`api.reports` en apps. |
| Configuración y arranque (H2) | `seed-safety` 7/7; `runtime-config.spec` incluido en las suites aprobadas | Aprobado | Nueva | Demo en BD nueva: no ejecutada. |
| Android / dispositivo / proveedores | — | **Pendiente manual** | — | APK no reconstruido (cambios en `apps/mobile`). GPS, volumen, segundo plano, FileProvider: dispositivo. Proveedores: no contactados. |

---

## 7. Configuración: variables y credenciales faltantes

Comparación local de **nombres** entre `example.env` y el `.env` privado de A. Ningún valor se imprimió ni se copió. Estado «presente» significa que existe un valor no vacío y que no coincide con la plantilla ni con un patrón de marcador; **su validez no se comprobó** y no se contactó ningún proveedor.

**A. Faltantes o vacíos que afectan a una función**

| Variable | Componente / función | Estado | Necesaria | Archivo privado | Siguiente paso |
|---|---|---|---|---|---|
| `WHATSAPP_ENABLED` | SOS por WhatsApp (envío real) | Ausente | No para pruebas con dobles; sí para despacho real (fuera de alcance) | `.env` (raíz de A) | Integrante decide; no activar sin plan |
| `WHATSAPP_SENDER_PHONE` | SOS por WhatsApp | Ausente | Obligatoria en staging/production; opcional en desarrollo | `.env` | Responsable, para destino |
| `WHATSAPP_AUTH_DIR` | Sesión WhatsApp (Baileys) | Ausente | Obligatoria en staging/production; opcional en desarrollo | `.env` | Responsable, para destino; no tocar la sesión existente |
| `WHATSAPP_DEFAULT_COUNTRY_CODE` | SOS / números | Ausente | Verificar en código si tiene valor por defecto (no comprobado) | `.env` | Integrante |
| `EMERGEN_DEPLOYMENT_ID` | Health (`deployment`) y validación de staging/production | Ausente | Opcional en desarrollo (health muestra `local`); obligatoria en staging/production | `.env` | Responsable, al definir el destino |
| `VITE_DEPLOYMENT_ID` | Metadato `deployment` de `android-build.json` | Ausente | Opcional en desarrollo (valor `local`); debe coincidir con `EMERGEN_DEPLOYMENT_ID` en destino | `.env` | Responsable, al generar APK de destino |
| `VITE_INTERNAL_API_URL` | Web, móvil y desktop hacia la API interna | Ausente | Usa `http://localhost:8000` si no se define; verificar que el servicio interno escucha en 8000 | `.env` | Integrante |
| `EMERGEN_ENVIRONMENT` | Modo de validación | Ausente | No: por defecto `development` | `.env` | Ninguna en local |
| `DB_SSLMODE` | TLS a PostgreSQL | Ausente | No en desarrollo (por defecto `disable`); obligatoria explícita en staging/production | `.env` | Responsable, para destino |
| `DB_SSL_CA_FILE` | TLS `verify-full` | Ausente | Solo con `verify-full` | `.env` | Responsable, para destino |
| `EMERGEN_SEED_EXPECTED_DB` | Seed de demostración | Ausente | No: el seed no se ejecuta | `.env` | No aplica |

**B. Presentes, validez no comprobada**

| Variable | Componente / función | Necesaria | Nota |
|---|---|---|---|
| `DB_PASSWORD` | Backend y servicio interno sobre BD | Modo local con BD | No verificada contra la BD. |
| `JWT_SECRET` | Sesión (`login.module` exige ≥32 bytes al arrancar) | Sí | Longitud no comprobada. |
| `MEDICAL_DATA_KEYS` | Cifrado de ficha médica | Sí, al usar perfil médico | Formato (clave base64 de 32 bytes) no comprobado. |
| `CORS_ORIGINS` | CORS | Sí | Valor no comprobado frente a orígenes reales. |
| `FIREBASE_PROJECT_ID` | Validación de ID token | Sí, en login con Firebase | No se encontró credencial de cuenta de servicio en el código. |
| `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET` | Compras con proveedor real | Solo compras reales | Pruebas usan proveedor falso. No contactado. |
| `GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY` | Mapas | Solo mapas | No validada. |
| `JSREPORT_USERNAME`, `JSREPORT_PASSWORD` | Reportes PDF/Excel | Solo reportes reales | No validados. |
| `VITE_FIREBASE_*`, `VITE_PAYPAL_CLIENT_ID` | Configuración pública del cliente | Sí | Públicas por diseño. |

**C. Valor con patrón de marcador:** `VITE_GOOGLE_MAPS_MAP_ID` (opcional; mapa de la interfaz). Revisar.

**D. Valores iguales a la plantilla (revisar, no son credenciales):** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME`, `PORT`, `PAYPAL_MODE`, `JSREPORT_URL`, `JSREPORT_URL_DOCKER`, `MINDICADOR_API_URL`, `DOLAR_CLP_RESPALDO`, `VITE_API_URL`.
- **`DB_HOST`:** coincide con el nombre de servicio interno de Docker de la plantilla. Si el backend corre en el host, debe usar loopback y el puerto publicado (ver README §6.3). **Confirmar el modo de ejecución; no se cambió el archivo.**
- `DB_PORT`: el `Settings` de Python usa 5433 cuando no está definido; la plantilla usa 5432 y el compose publica 5433 en el host. Confirmar el puerto de la instancia local.

**E. Sobrantes:** `AUTH0_ISSUER_URL`, `AUTH0_AUDIENCE` están en `.env` pero no tienen uso en el código revisado. Candidatas a retirar, decisión del integrante.

**Faltantes que impiden arrancar o probar una función:** ninguno detectado para el modo de desarrollo con dobles. Para ejecutar el backend contra BD local hacen falta `DB_HOST`/`DB_PORT` correctos (§D).

**Conclusión sobre credenciales:** no se detectaron faltantes para el alcance revisado (desarrollo y pruebas con dobles). Las credenciales presentes no se han validado; no se comprobó ninguna contra un proveedor.

---

## 8. Pendientes con responsable y siguiente paso

| # | Pendiente | Responsable | Siguiente paso |
|---|---|---|---|
| P1 | D1: aserción «sin límite de página» frente al tope de exportación | Alonso / responsable | Elegir opción (a) o (b) de §4 |
| P2 | `.venv` de A creado con Python 3.14.7 | Integrante | Cuando no haya servicios activos: renombrar o eliminar el venv, crear con Python 3.12 (`uv python install 3.12.10` y `uv venv`), luego `pip install -r services/internal-api/requirements.txt`. Requiere su autorización expresa. |
| P3 | `node_modules` de A anterior al lock actual | Integrante | Con servicios detenidos: `npm ci` en A. No se hizo aquí. |
| P4 | `DB_HOST` / `DB_PORT` del `.env` | Integrante | Confirmar modo de ejecución (contenedor o host) y ajustar el archivo privado |
| P5 | Reconstruir frontend, sincronizar Capacitor, generar e instalar APK | Responsable | Cambiaron fuentes de `apps/mobile` y configuración pública. Seguir el README. No reutilizar APK anterior. |
| P6 | Aceptación física Android (GPS, permisos, volumen, segundo plano, FileProvider) | Responsable | Registrar pasos y resultados en dispositivo |
| P7 | CORS nativo con backend real (`file://` / `Origin: null`) y caso 414 | Responsable | Ejecutar con servicio aislado y puerto propio; no debilitar allowlist |
| P8 | Flujos con BD (compras, SOS, roles, cuotas) | Responsable | BD nueva, desechable y sintética; no usar datos existentes |
| P9 | Manifiesto de pre-commit con 58 hashes no alineados con HEAD | Responsable | Regenerar tras el commit del usuario o marcar como histórico |
| P10 | `graphify-out/` versionado en `16059d8` (y `.nudges` en `d1026df`) en la rama `alonso`, contrario a CLAUDE.md | Responsable | Revisar y decidir; no se tocó |
| P11 | `gabriel` contiene el fortalecimiento por fast-forward desde `origin/alonso`, no por `main` | Responsable | Registrar la excepción; no revertir sin decisión |
| P12 | `renderPaypalButtons` exportado en `@repo/api-client` llama al wrapper retirado (410) | Responsable | Ninguna app lo importa (búsqueda). Decidir retirar o migrar. |
| P13 | Controladores de PayPal y reportes sin registrar (`paypal.controller.ts`, `jsreport.controller.ts`) | Responsable | Código muerto; retirar en su momento |
| P14 | H1 (revocación/rotación) antes de hosting | Responsable | Sin cambios en esta sesión |
| P15 | Integridad funcional, TLS/ingreso/CSP, roles efectivos, restauración, cuotas entre réplicas, entregas ambiguas, firma y hosting | Responsable | Fuera de alcance de esta sesión |

**Próximo paso del integrante:** decidir P2 y P4; revisar los archivos de §9; hacer el commit cuando lo considere (el SHA lo asigna Git).

---

## 9. Archivos revisables y exclusiones

**Cambio de esta sesión (sin stage):**
- `apps/backend/src/apadrinados/apadrinados.service.spec.ts` (C1).
- `docs/INTEGRACION_gabriel_gabriel_2026-10-30.md` (este reporte).

**Del fortalecimiento (`d1026df`), a revisar por el responsable:** ya integrados en HEAD; ver `docs/FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md`.

**Excluidos de cualquier commit de esta integración:**
- `graphify-out/` (incluye `cache/hook_sessions/*.nudges` creados por los hooks). No se regeneró, restauró, borró ni incluyó.
- `node_modules/`, `.venv/`, `dist/`, `build/` y la copia aislada.
- `.env` y cualquier archivo privado; `.env` no está versionado.
- Backups, sesiones de WhatsApp (Baileys), material de firma Android, APK, bundles `security-check`, capturas y cachés.
- QA ajena y documentos de otros integrantes.
- Copias de manifiestos previos.

---

## 10. Límites de la evidencia

- **Comprobado localmente:** builds y tests indicados en §5; aislamiento sin red en las pruebas Jest y Python (preload y socket bloqueados); instalación limpia de la copia; panel Electron con APIs simuladas.
- **Preparado para destino:** variables de staging/production identificadas (§7A); validaciones de `runtime-config.ts` y `Settings` revisadas.
- **Pendiente externo o manual:** §8 (P5–P15).
- No se afirma integridad total, ni «listo para hosting», ni aceptación de Android, proveedores o firma.
- Las pruebas de dobles no reemplazan la prueba con BD ni con servicios reales.
