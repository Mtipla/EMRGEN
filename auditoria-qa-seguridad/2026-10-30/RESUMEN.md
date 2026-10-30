# RESUMEN — Auditoría QA funcional + Ciberseguridad EMERGEN

Fecha: 2026-10-30 · Rama `gabriel` (HEAD `16059d8`) · Entorno aislado local, sin tocar servicios,
datos ni `.env` del equipo · `init.sql` intacto (SHA-256 verificado).

Documentos hermanos: `alcance-y-entorno.md`, `matriz-trazabilidad.md`, `resultados-qa.md`,
`resultados-seguridad.md`, `verificacion-correcciones-previas.md`, `guia-reproduccion.md`,
`evidencias/`, `scripts/`.

> **Actualización 2ª pasada (2026-10-30):** a petición del usuario se **aplicaron** las
> correcciones QA-REG-01, QA-REG-02 y QA-ENV-01/02, y se **re-ejecutaron** las pruebas levantando
> el **stack Docker construido desde el HEAD** (36/36 APROBADO; binding a loopback = PRE-SEC-003
> verificado). Detalle en **`reejecucion-2026-10-30-docker.md`**. Resumen de estado: QA-REG-01
> (backend unit 265/265) y QA-REG-02 (web 110/110) **corregidos**; `.venv` recreado en Python 3.12;
> PRE-SEC-003 demostrado desde el HEAD (los contenedores del equipo siguen en imagen previa, a
> reconstruir); **PRE-SEC-007 no implementado** (requiere esquema + decisión; `init.sql` congelado);
> nuevo hallazgo **QA-DEPLOY-01** (un `docker up` limpio queda `database: down` hasta correr las
> migraciones). Las secciones siguientes reflejan la 1ª pasada (línea base) salvo donde se indica.

---

## 1. Qué funciona bien (con evidencia)
Los flujos principales responden según las HU y los controles de seguridad del compañero están,
en su mayoría, operativos. Se ejecutaron **76 casos de API** (registro, login, PIN, perfiles,
contactos, ficha médica, SOS completo, compras, soporte) **todos APROBADO** contra el backend y la
API FastAPI reales (código del HEAD) con proveedores externos simulados —evidencia por caso en
`evidencias/casos-api.jsonl` y `casos-seguridad.jsonl`, y prueba de cero tráfico externo en
`evidencias/proveedores-falsos.jsonl`. Además pasaron **541 pruebas** de las suites automatizadas
del proyecto (backend unit 262, api-client 31, web 110, móvil 53, node 23, FastAPI pytest 62).

## 2. Qué funciona mal
- **QA-REG-02 (media):** la suite unitaria **web no corre** (`npm test` en web) porque
  `apps/web/vitest.config.ts` fusiona una config que ahora es una función (cambio del commit de
  seguridad). Con la config corregida pasan 110/110.
- **QA-REG-01 (baja):** `admin-tickets.service.spec.ts` falla; el commit de seguridad añadió un
  tope de filas al informe de tickets cerrados y el spec quedó contradictorio. Riesgo menor: un
  informe con > 2000 tickets cerrados devolvería 413 en vez del listado completo.
- **QA-ENV-01/02 (media, solo desarrollo):** el `.venv` del equipo está en Python 3.14 sin
  `bcrypt`; FastAPI no arranca localmente y el runner del compañero falla en su paso Python.

## 3. Vulnerabilidades confirmadas
**Ninguna nueva confirmada.** Las comprobaciones dinámicas de inyección SQL, XSS almacenado,
IDOR/BOLA, elusión de rol (JWT forjado), CORS, asignación masiva y límites **no** lograron eludir
ningún control (13 casos de seguridad APROBADO, `evidencias/casos-seguridad.jsonl`).

## 4. Riesgos y dudas pendientes
- **PRE-SEC-003 en runtime:** los contenedores activos (imagen del 2026-10-29, **anterior** al
  commit de seguridad) exponen `0.0.0.0:3001/8000`. El endurecimiento existe pero no está desplegado.
- **Revocación de sesión (PRE-SEC-007):** un JWT sigue válido hasta `exp` tras logout o cambio de
  contraseña; falta decisión de diseño.
- Pendiente del otro integrante (staging autorizado): ataque ofensivo amplio por rol/objeto, motor
  jsReport/SSRF, SQLi/XSS exhaustivos, carga/fuerza bruta, perímetro TLS/red, artefactos firmados.

## 5. Cómo solucionar cada problema
- **QA-REG-02:** resolver la función de `vite.config.ts` antes de `mergeConfig` (patrón exacto en
  `resultados-seguridad.md` §5 y `scripts/vitest-web-aud.config.mjs`).
- **QA-REG-01:** actualizar el spec al nuevo tope y decidir la política de "informe completo" vs.
  cap (paginar o exportación operativa para históricos grandes).
- **QA-ENV-01/02:** recrear el `.venv` en Python 3.12 con `requirements.txt` (bcrypt 5.0.0).
- **PRE-SEC-003:** reconstruir imágenes desde el HEAD actual y aplicar `docker-compose.production.yml`
  / reglas de ingreso antes de exponer.
- **PRE-SEC-007:** definir revocación (versión de sesión / denylist) y su efecto en SOS.

## 6. Prioridad sugerida
1. **Alta/operativa:** PRE-SEC-003 (exposición en runtime) y reconstruir imágenes desde HEAD antes de cualquier publicación.
2. **Media:** QA-REG-02 (suite web), QA-ENV-01/02 (venv), decisión PRE-SEC-007.
3. **Baja:** QA-REG-01 (spec + política de informe), reconciliar expectativas de `integrations.e2e`.
4. **Etapa posterior (otro integrante):** ataques amplios, carga, perímetro, artefactos nativos.

## 7. Qué no se pudo probar y por qué
- **UI viva (click-through) web/móvil/escritorio:** BLOQUEADO — el daemon de `agent-browser` no
  retornó al abrir la página en este host Windows (headed y headless), pese a instalar Chrome. La
  web sí sirve (HTTP 200, `<title>EMERGEN</title>`) y sus componentes pasan (Vitest 110). Por esto
  quedan NO EJECUTADO: HU-17 (marcador 131/132/133), responsividad real (RNF1), compatibilidad
  entre navegadores (RNF2).
- **Carga/latencia SOS (RNF6), resiliencia distribuida, fuerza bruta/fuzzing:** fuera de alcance.
- **Borrado al eliminar cuenta (RNF9), accesibilidad WCAG (RNF10):** NO EJECUTADO.
- **Hosting/TLS/perímetro, permisos efectivos de BD, artefactos Android/Electron firmados:**
  requieren entorno/decisiones no disponibles.

## 8. Cobertura alcanzada
- **Historias de usuario:** 15 de 19 con al menos un caso ejecutado y aprobado por la auditoría
  (HU-01,02,03,04,05,06,07,08,10,11,13,14,16,18 + 09 por unidad). Parciales/indirectas: HU-15, HU-19.
  Sin ejecución directa: **HU-17** (UI nativa) y la capa UI de varias (bloqueo de navegador).
- **Requisitos:** RF1–RF3, RF6–RF8, RF10–RF14, RF16, RF18, RF23–RF25 cubiertos por API; RNF3,4,5,7,8
  verificados dinámicamente; RNF1 a nivel de componentes; RNF2,6,9,10 no ejecutados.
- **Controles del compañero:** 11 de 15 PRE-SEC verificados (total o acotadamente); el resto
  incompletos por operación/decisión. Detalle en `verificacion-correcciones-previas.md`.

## 9. Estado de las correcciones de seguridad previas
Verificadas por regresión: PRE-SEC-001, 004, 006, 008, 011 y H2/H3 (núcleo del fortalecimiento:
rutas genéricas, límites, PIN, autorización, cabeceras, cifrado médico). Incompletas por acción
operativa o decisión: PRE-SEC-002, 003, 005, 007, 009, 010, 012, 013, 014, 015. **Ninguna resultó
NO EFECTIVA.** Tabla completa en `verificacion-correcciones-previas.md`.

## 10. Exclusión del bot de WhatsApp
**Fuera de alcance por indicación del usuario.** El usuario informa que las pruebas previas fueron
exitosas; no se verificó en esta ejecución por falta del dispositivo. No se marca como fallo ni
como éxito comprobado por esta auditoría. El transporte WhatsApp se sustituyó por un doble en todas
las pruebas de SOS (que sí verificaron la creación de alerta, el encolado de envíos y el cierre).

---

## Conteo de pruebas (no se cuentan recomendaciones como pruebas)

| Grupo | APROBADO | FALLIDO | BLOQUEADO | NO EJECUTADO | FUERA DE ALCANCE |
|---|---|---|---|---|---|
| Casos de API de la auditoría (funcional + seguridad) | 76 | 0 | 0 | — | — |
| Suites automatizadas del proyecto (nº de pruebas) | 541 | 3 | — | — | — |
| UI viva (navegador) | — | — | 1 (click-through) | — | — |
| RNF2 / RNF6 / RNF9 / RNF10 / HU-17 UI | — | — | — | 5 | — |
| Bot de WhatsApp | — | — | — | — | 1 |

- Los 3 fallos de suite = QA-REG-01 (2 casos del spec de informe de tickets) + 1 caso pytest por
  dependencia de datos de seed. **No** son defectos de lógica de producto (ver `resultados-qa.md`).
- La suite unitaria **web** no corre con su config original (QA-REG-02); los 541 incluyen sus 110
  casos ejecutados con la config corregida. La suite **backend e2e** quedó **no concluyente** por
  expectativas desactualizadas frente a PRE-SEC-001 y por el preload que bloquea `.env`.

## Cierre y estado del entorno
- Coherencia entre informes verificada; cada hallazgo tiene evidencia o una limitación explícita.
- **Procesos que pueden quedar activos:** las APIs aisladas (`levantar-apis.mjs`), el servidor web
  de prueba (`vite` en 5181) y el contenedor `emergen-aud-claude-db`. Para detener todo:
  `node scripts/bd-aislada.mjs down` y cerrar los procesos de Node/Vite de la auditoría. Las sesiones
  de `agent-browser` ya se cerraron.
- **Cambios para preparar el entorno:** creación de la carpeta `auditoria-qa-seguridad/` y sus
  scripts; venv Python 3.12 y caché de compilación del backend en directorios temporales/ignorados.
  **No** se modificó código de producción, `init.sql`, datos, `.env`, volúmenes ni servicios del
  equipo. Todo queda **sin commit** para tu revisión.
