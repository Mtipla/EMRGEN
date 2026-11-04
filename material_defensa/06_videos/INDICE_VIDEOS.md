# Storyboard de los videos previstos

Escrito para: quien vaya a grabar los videos a mano o con otra herramienta.

**Estado:** los 10 videos existen en esta carpeta (ver [README.md](README.md)). Este documento es el storyboard con el que se produjeron. Las duraciones reales están en el README. Cambio respecto al plan: el video 01 usa `apps/backend/src/app.module.ts` en la escena 3 en lugar de `docker-compose.yml`, y no lleva resaltados de Code Walkthrough.

Formato previsto: 1920 × 1080, MP4, español, código legible. Cada video sigue la metodología de la Etapa 6: nombre de la funcionalidad, propósito, archivo abierto, código destacado, funciones, otros archivos, flujo, rutas, comunicación y resumen.

## Video 01: arquitectura y estructura (≈ 6 min)

| Escena | Archivo a mostrar | Qué destacar | Narración |
|---|---|---|---|
| 1 | `package.json` (raíz) | `workspaces` y los scripts | Monorepo con npm workspaces y Turborepo |
| 2 | Árbol de `apps/` y `services/` | Las cuatro apps y la API FastAPI | Cuatro interfaces de usuario y dos servidores |
| 3 | `docker-compose.yml` | Puertos 5433, 3001, 8000 | Tres servicios y una base de datos |
| 4 | `apps/backend/src/main.ts` líneas 12 y 28-34 | `bootstrap` y `ValidationPipe` | Aquí empieza NestJS |
| 5 | `services/internal-api/app/main.py` | `FastAPI`, `include_router`, CORS | Aquí empieza FastAPI |

## Video 02: frontend y navegación (≈ 5 min)

| Escena | Archivo | Qué destacar | Narración |
|---|---|---|---|
| 1 | `apps/web/src/App.tsx` líneas 162-218 | Las `<Route>` y `privatePage` | Rutas de la web y su protección |
| 2 | `apps/web/src/App.tsx` líneas 135, 214-215 | `esPersonal` | Ocultar rutas al personal (solo en la interfaz) |
| 3 | `apps/mobile/src/App.tsx` líneas 70-105 | Rutas del móvil | Rutas del móvil y redirección a `/home` |
| 4 | `apps/desktop/src/admin/PanelAdmin.tsx` líneas 167-183 | `Routes` del panel | Secciones de administración |

## Video 03: backend y rutas API (≈ 8 min)

| Escena | Archivo | Qué destacar |
|---|---|---|
| 1 | `apps/backend/src/login/login.controller.ts` | `@Controller('usuarios')` y los guards por método |
| 2 | `apps/backend/src/admin/admin.controller.ts` líneas 14-16 | Guards a nivel de clase |
| 3 | `services/internal-api/app/api/routes/alertas.py` | Las cuatro rutas de SOS |
| 4 | `services/internal-api/app/api/routes/tickets_soporte.py` línea 69 | `solo_staff` |

## Video 04: base de datos y modelos (≈ 5 min)

| Escena | Archivo | Qué destacar |
|---|---|---|
| 1 | `init.sql` líneas 66-130 | Tablas de usuario, rol, PIN |
| 2 | `init.sql` líneas 245-300 | Tablas de alerta y envíos |
| 3 | `README_BDD.md` (reglas operativas) | Cupos, PIN y SOS |
| 4 | `migrations/` | Migraciones y por qué no se ejecutan en bloque |

**No ejecutar nada sobre la base real.** Solo leer.

## Video 05: autenticación y permisos (≈ 7 min)

| Escena | Archivo | Qué destacar |
|---|---|---|
| 1 | `apps/backend/src/login/login.service.ts` líneas 111-150 | Contraseña, perfiles y firma del JWT |
| 2 | `apps/backend/src/login/login.module.ts` líneas 22-40 | Secreto, emisor, audiencia y duración |
| 3 | `apps/backend/src/login/jwt-auth.guard.ts` líneas 25-50 | Verificación y relectura del usuario |
| 4 | `apps/backend/src/login/pin-principal.ts` líneas 6 y 30 | Tres fallos y cinco minutos |
| 5 | `services/internal-api/app/dependencies/auth.py` | Mismo JWT en FastAPI |

## Video 06: SOS, funcionalidad central (≈ 8 min)

| Escena | Archivo | Qué destacar |
|---|---|---|
| 1 | `services/internal-api/app/services/alertas.py` líneas 27-65 | Idempotencia, reglas y transacción |
| 2 | Mismo archivo líneas 72-96 | Cierre con PIN y bloqueo de 15 minutos |
| 3 | `services/internal-api/app/core/scheduler.py` | Cierre automático cada 30 segundos |
| 4 | `apps/backend/src/integrations/whatsapp/whatsapp-sos-dispatcher.service.ts` líneas 47 y 84-101 | Cola con `SKIP LOCKED` |
| 5 | `apps/mobile/src/components/AlertaSos.tsx` | Pantalla del SOS |

## Video 07: compras y planes (≈ 6 min)

| Escena | Archivo | Qué destacar |
|---|---|---|
| 1 | `apps/backend/src/compras/compras.controller.ts` | Rutas y guard de clase |
| 2 | `packages/api-client/src/emergen-api.ts` líneas 49-70 | Cómo llama la web a las compras |
| 3 | `README_BDD.md` (sección de reglas de compra) | Reserva antes de PayPal |
| 4 | `apps/backend/src/integrations/paypal/paypal.controller.ts` | Rutas sin guard (**mostrar como hallazgo**) |

## Video 08: administración y auditoría (≈ 5 min)

| Escena | Archivo | Qué destacar |
|---|---|---|
| 1 | `apps/backend/src/admin/admin.controller.ts` líneas 36-45 | `@Roles` por método |
| 2 | `apps/backend/src/auditoria/auditoria.service.ts` líneas 51 y 144 | Bitácora |
| 3 | `apps/desktop/src/admin/SeccionBitacora.tsx` | Lectura de la bitácora |

## Video 09: integraciones externas (≈ 4 min)

| Escena | Archivo | Qué destacar |
|---|---|---|
| 1 | `apps/backend/src/integrations/*/` | Cinco integraciones |
| 2 | `README.md` §5 | Tabla de servicios externos |

## Video 10: simulación breve de defensa (≈ 8 min)

Formato: preguntas de [PREGUNTAS_DEFENSA.md](../08_preguntas_defensa/PREGUNTAS_DEFENSA.md) (cinco de ellas, una por tema). Respuesta corta de 30 segundos y, después, abrir el archivo de la evidencia.

## Mapa video → materiales

| Video | Funcionalidades | Documentos | Rutas | Archivos |
|---|---|---|---|---|
| 01 | Arquitectura | [ARQUITECTURA.md](../01_arquitectura/ARQUITECTURA.md) | — | `package.json`, `main.ts`, `main.py` |
| 02 | Navegación | [MATRIZ_RUTAS.md](../02_rutas/MATRIZ_RUTAS.md) §C | — | `App.tsx` de web, móvil y escritorio |
| 03 | API | [MATRIZ_RUTAS.md](../02_rutas/MATRIZ_RUTAS.md) §A y §B | Todas | Controladores y routers |
| 04 | Base de datos | [TRAZABILIDAD_DOCUMENTACION.md](../04_documentacion/TRAZABILIDAD_DOCUMENTACION.md) | — | `init.sql`, `migrations/` |
| 05 | Autenticación | [FUNCIONALIDADES.md](../03_funcionalidades/FUNCIONALIDADES.md) F2 | `POST /usuarios/login` | `login/` |
| 06 | SOS | F6 y F6b | `/internal/v1/alertas*` | `alertas.py`, `dispatcher` |
| 07 | Compras | F5 y F5b | `/compras/*`, `/payments/paypal/*` | `compras/`, `paypal/` |
| 08 | Administración | F9 y F10 | `/admin/*` | `admin/`, `auditoria/` |
| 09 | Integraciones | F11 | `/indicators`, `/maps/*`, `/auth/me` | `integrations/` |
| 10 | Defensa | [PREGUNTAS_DEFENSA.md](../08_preguntas_defensa/PREGUNTAS_DEFENSA.md) | — | Según la pregunta |
