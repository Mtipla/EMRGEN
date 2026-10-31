# Alcance y entorno — Auditoría QA + Ciberseguridad EMERGEN

Fecha: 2026-10-30 · Zona de referencia: America/Santiago · Rama: `gabriel` · HEAD al iniciar: `16059d8`.

## 1. Objetivo y alcance

Comprobar el funcionamiento de EMERGEN frente a las historias de usuario (HU-01…HU-19), los
requisitos funcionales (RF1…RF25) y no funcionales (RNF1…RNF10); verificar las correcciones de
seguridad del compañero (commit `d1026df` de Alonso, 30-10-2026, "Ajuste completo de
ciberseguridad…", más la serie PRE-SEC-001…015 y H2–H5 descritas en
`docs/FORTALECIMIENTO_CIBERSEGURIDAD_EMERGEN.md`); y buscar vulnerabilidades adicionales.

Dentro de alcance: backend NestJS (64 rutas), API interna FastAPI (18 rutas), paquete
`api-client`, suites automatizadas existentes, configuración de arranque, límites de seguridad,
cifrado de datos médicos, autorización por rol/propiedad, y los clientes web/móvil/escritorio a
nivel de compilación y pruebas de componentes.

### Exclusión expresa — Bot de WhatsApp (Baileys)
**Fuera de alcance por indicación del usuario.** El usuario informa que las pruebas previas
fueron exitosas; no se verificó en esta ejecución por no disponer del dispositivo necesario. No
se marca como fallo ni como éxito comprobado por esta auditoría. En todas las pruebas el
transporte WhatsApp se sustituyó por un doble que registra metadatos y no envía mensajes.

## 2. Reglas respetadas

- `init.sql` **no se editó, regeneró ni reformateó**. SHA-256 verificado antes y después de usarlo:
  `d4e71a576baaab8192e9482eb7304d9f69bacc82d3c1be361830cee0c8e78f68` (idéntico; evidencia
  `evidencias/00-bd-aislada-up.log`). Solo se leyó para poblar una BD desechable.
- **Sin commits, push ni publicación.** Todos los artefactos nuevos quedan sin preparar para que
  el usuario los revise. Lo único creado es la carpeta `auditoria-qa-seguridad/` y los scripts de
  prueba; no se modificó código de producción.
- **Cambios del equipo preservados** (modificación previa de
  `apadrinados.service.spec.ts` y el doc de integración intactos).
- No se generaron imágenes, capturas ni video. Evidencia textual/registros sanitizados.
- No se expusieron contraseñas, tokens, cookies ni datos personales. El registro de pruebas
  sanea JWT, hashes bcrypt y tokens de Firebase antes de escribir.
- Pruebas solo en entorno **local/aislado**. No se atacaron servicios externos ni se ejecutaron
  pruebas destructivas sobre datos reales.

## 3. Entorno de pruebas levantado por la auditoría

Para no tocar los servicios activos del equipo ni sus datos, se construyó un entorno aislado:

| Componente | Detalle | Evidencia |
|---|---|---|
| BD desechable | PostgreSQL 15-alpine en contenedor `emergen-aud-claude-db`, `tmpfs` (sin volumen persistente), publicado solo en `127.0.0.1:55710`, etiqueta `emergen.purpose=claude-qa-audit-2026-10-30`. Esquema = `init.sql` + 3 migraciones de `migrations/`, aplicados por stdin (sin seeds). | `scripts/bd-aislada.mjs`, `evidencias/00-bd-aislada-up.log` |
| Backend NestJS | Código **real** de `apps/backend/src` compilado a una caché ignorada y arrancado con `EMERGEN_ENVIRONMENT=test`, CORS/boundedJson/ValidationPipe idénticos a `main.ts`, en `127.0.0.1:3710`. Proveedores externos (Firebase, PayPal, jsReport, Google Maps, mindicador, WhatsApp) sustituidos por dobles sin red. | `scripts/backend-aislado.cjs`, `evidencias/backend.log` |
| FastAPI | `app.main:app` real vía uvicorn en `127.0.0.1:3711`, mismo JWT_SECRET efímero que NestJS. | `scripts/levantar-apis.mjs`, `evidencias/fastapi.log` |
| Secretos | JWT y claves de cifrado médico **aleatorios por ejecución**, guardados solo fuera del repositorio (scratchpad). Nunca el `.env` del equipo. | `scripts/levantar-apis.mjs` |
| Datos | Cuentas sintéticas de personal (`aud.*@example.invalid`) sembradas por script; cuentas de usuario final creadas vía API con Firebase falso. | `scripts/sembrar-sintetico.mjs`, `evidencias/01-siembra-sintetica.log` |

Versiones: Node 24.21.0, npm 11.19.1, Docker CLI 29.9.2. Para FastAPI se creó un venv **Python
3.12.10** propio de la auditoría con `requirements.txt` (bcrypt 5.0.0), porque el `.venv`
versionado del equipo está en Python 3.14 y sin bcrypt (ver hallazgo QA-ENV-01).

## 4. Servicios preexistentes observados (no modificados)

`docker ps` mostró, además de la BD de auditoría: `nestjs_emergen_backend` (0.0.0.0:3001),
`fastapi_emergen_internal` (0.0.0.0:8000), `postgres_emergen_db` (127.0.0.1:5433) y `jsreport`.
**Las imágenes de backend/internal-api se construyeron el 2026-10-29 21:29, antes del commit de
seguridad `d1026df` (2026-10-30 10:13)**: los contenedores en ejecución NO contienen el
fortalecimiento. No se inició, detuvo ni reinició ninguno. También había un uvicorn del equipo en
`127.0.0.1:8100`. Esta auditoría no usó ninguno de ellos.

## 5. Procesos dejados activos / limpieza

Al cerrar la auditoría se detienen las APIs aisladas y el contenedor `emergen-aud-claude-db`
(`node scripts/bd-aislada.mjs down`). Ver estado final en `RESUMEN.md` §"Cierre". Los servicios
preexistentes del equipo quedan como estaban.
