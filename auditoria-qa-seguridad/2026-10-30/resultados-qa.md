# Resultados QA funcional

Fecha: 2026-10-30. Entorno aislado (ver `alcance-y-entorno.md`). Dos bloques:
**(A)** casos de API diseñados y ejecutados por esta auditoría; **(B)** suites automatizadas
existentes del proyecto reejecutadas.

## A. Casos de API ejecutados por la auditoría

76 casos secuenciales contra NestJS (`127.0.0.1:3710`) y FastAPI (`127.0.0.1:3711`), todos
APROBADO. Evidencia por caso (estado + respuesta observada, sanitizada): `evidencias/casos-api.jsonl`
(63) y `evidencias/casos-seguridad.jsonl` (13). Salida completa: `evidencias/02-pruebas-api-salida.log`,
`evidencias/03-pruebas-seguridad-salida.log`. Registro de los proveedores dobles (prueba de que no
hubo tráfico externo real): `evidencias/proveedores-falsos.jsonl`.

Conteo: **APROBADO 76 · FALLIDO 0 · BLOQUEADO 0**.

Cobertura funcional destacada (reproducción: ver `guia-reproduccion.md`):

- **Registro/identidad (HU-01, HU-02):** registro válido (201), rechazo de correo mal formado,
  contraseña corta, correo duplicado (409), token Firebase no verificado (403); login con JWT,
  rechazo con mensaje genérico y **no enumeración** (correo inexistente devuelve el mismo texto).
- **PIN y perfiles (HU-10):** configuración de PIN de 4 dígitos (201), rechazo de formato (400),
  login por perfil + PIN; **bloqueo tras 3 intentos** y además el PIN correcto durante el bloqueo
  también se rechaza (429) — contador en servidor confirmado (`SEC-PIN-01`).
- **Contactos (HU-03/04):** alta E.164 (201), rechazo de formato (400) y duplicado; un usuario
  **no puede modificar ni borrar** contactos de otro (404/403 y dato intacto, `SEC-IDOR-01/02`).
- **Ficha médica (HU-11):** guardado con consentimiento (200) y **cifrado en reposo verificado**:
  el valor en claro `O+AUDIT` no aparece en la columna `tipo_sangre` de ninguna fila (`SEC-CRYPTO-01`).
- **SOS (HU-06/07/08/14):** rechazo sin plan (409); alerta ACTIVA con envíos encolados;
  **idempotencia** (misma clave → misma alerta), **una activa por usuario** (409), **sin GPS** se
  acepta, cierre con PIN → FINALIZADA, cierre repetido idempotente, y un tercero no lee la alerta
  ajena (404). Prioridad fuera de rango y campo extra rechazados por esquema (FastAPI mapea 422→400).
- **Compras (HU-16):** orden de plan con precio del servidor (PayPal doble), captura → PAGADO con
  cupos aplicados, cantidad fuera de rango (400); `/compras/precio` sigue público.
- **Soporte/contacto (HU-18):** contacto público válido (201), correo inválido y descripción
  >500 rechazados; ticket de usuario; el PATCH de ticket y la bandeja son solo-staff.

### Nota de método
El limitador de identidad (`API_IDENTITY_PER_15_MINUTES`, por defecto 10/15 min por IP) se
agotó en la primera corrida por el volumen de altas, devolviendo 429 — lo que **confirma que el
rate-limit funciona**. Para la batería funcional se elevaron los límites por variable de entorno
(diseño previsto del código); el rate-limit se verifica aparte con `SEC-RATE-01` sobre
`/compras/precio` (límite por defecto 60/min → aparece 429 con `Retry-After`).

## B. Suites automatizadas existentes (reejecución / regresión)

Ejecutadas con el runner del propio proyecto (`scripts/security-run.mjs`, que filtra variables y
bloquea red) y, para FastAPI, con pytest contra la BD aislada. Evidencia: `evidencias/reg-*.log`.

| Suite | Resultado | Nota |
|---|---|---|
| Backend Jest unitarias | **262 passed / 2 failed** (264) | Los 2 fallos = `admin-tickets.service.spec.ts` → **QA-REG-01** (regresión del commit de seguridad) |
| Backend Jest e2e | Mixto | Fallos por **expectativas desactualizadas** (no por producto): `integrations.e2e` espera 400 sin token en `/maps` e `/indicators` pero ahora exige JWT (403, PRE-SEC-001); suites `*.db.e2e` hacen `describe.skip` sin `DB_E2E=1` y además fallan al importar bajo el preload que bloquea `.env` (`load-root-env.ts`). Ver resultados-seguridad.md |
| api-client Vitest | **31 passed (4 files)** | OK |
| Web Vitest | **config rota → 110 passed tras arreglo** | Con la config original falla al cargar (**QA-REG-02**); con config equivalente que resuelve la función (`scripts/vitest-web-aud.config.mjs`) pasan 110/110 |
| Móvil Vitest | **53 passed**; 1 archivo requiere `VITE_FIREBASE_API_KEY` | `App.test.tsx` falla por falta de clave Firebase; con clave sintética pasa (1/1). No es defecto de producto |
| `node --test` scripts | **21 passed** | seed-safety, api-environment, android-lan, expected-schema, electron main |
| `node --test` backup | **2 passed** | VM temporal, Docker/env falsos |
| FastAPI pytest | **62 passed / 1 failed** | 7 fallos iniciales por PIN de fixture; tras aprovisionar el PIN del admin de fixture, 62/63. El 1 restante (`test_parcial_pin_tutor_completo_pin_propio`) depende de una cuenta "Apadrinado Completo" ausente en BD limpia — **dependencia de datos de seed**, no defecto de producto |

## Regresiones funcionales confirmadas (introducidas por el commit de seguridad `d1026df`)

- **QA-REG-02 (media):** `apps/web/vite.config.ts` pasó a exportar una **función**; pero
  `apps/web/vitest.config.ts` hace `mergeConfig(viteConfig, …)` y Vitest no puede fusionar una
  config en forma de callback → **toda la suite unitaria web falla al cargar** (`npm test` en web).
  El build de producción no se ve afectado. Línea: `apps/web/vitest.config.ts:5`.
  Evidencia: `evidencias/reg-vitest-web.log`. Solución en `resultados-seguridad.md`.
- **QA-REG-01 (baja):** `admin-tickets.service.spec.ts:35` afirma que la consulta del informe de
  tickets cerrados **no** lleva `LIMIT/OFFSET`, pero el commit de seguridad añadió `LIMIT $1` +
  `completeRows()` (tope de filas, PRE-SEC-006) en `admin-tickets.service.ts:56`. El spec quedó en
  contradicción con el nuevo comportamiento. Riesgo adicional: un informe con > `API_REPORT_MAX_ROWS`
  (2000) tickets cerrados **lanzará 413** en vez de devolver todo (tensión con HU-19 "informe
  completo"; hay escape documentado: exportación operativa). Evidencia: `evidencias/reg-jest-backend-unit.log`.

## No ejecutado y por qué

- **UI viva (click-through) web/móvil/escritorio:** BLOQUEADO. La app web sirve correctamente
  (`http://localhost:5181`, HTTP 200, `<title>EMERGEN</title>`) y su capa de componentes pasa
  (Vitest 110), pero el daemon de `agent-browser` no retornó al abrir la página en este host
  Windows (headed y headless), pese a instalar Chrome 156. Se registra como bloqueo de la
  herramienta, no de la aplicación. HU-17 (marcador 131/132/133), navegación, responsividad real
  (RNF1) y compatibilidad entre navegadores (RNF2) quedan **NO EJECUTADO** por este motivo.
- **Carga/latencia SOS (RNF6), resiliencia distribuida, fuerza bruta/fuzzing:** fuera de alcance
  (corresponden al otro integrante, con staging y presupuesto definidos).
- **Borrado de datos al eliminar cuenta (RNF9) y accesibilidad WCAG (RNF10):** NO EJECUTADO.
- **Bot de WhatsApp:** FUERA DE ALCANCE (ver `alcance-y-entorno.md`).
