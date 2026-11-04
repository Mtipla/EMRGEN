# Matriz de rutas

Escrito para: estudiante que debe responder "¿dónde está esta ruta y qué la protege?".

Rutas de archivo relativas a `Evidencias de sistema Aplicación/`. Las líneas son de la declaración del decorador o de la ruta.

**Leyenda de estado**

- **V-exec**: verificada por ejecución (prueba que pasó en esta sesión).
- **I-lect**: implementada y leída en el código; no probada en ejecución.
- **Sin respaldo**: implementada, pero no aparece en los README ni contratos revisados (búsqueda de texto).
- **Riesgo**: implementada sin guard de autenticación; ver [PUNTOS_CRITICOS.md](../10_informes/PUNTOS_CRITICOS.md).

**Columna Doc**: "Sí" si la ruta exacta aparece en `readme.apis.internas.md`, `readme-apis.md`, `README.md` o `README_BDD.md`.

## A. NestJS (`apps/backend`)

El backend no tiene prefijo global. La ruta pública es la que aparece aquí.

### A1. Acceso, registro y cuenta (`apps/backend/src/login/`)

| Método | Ruta | Declaración | Protección | Rol | Estado | Doc |
|---|---|---|---|---|---|---|
| POST | `/usuarios/login` | `login.controller.ts:51` | Pública | Todos | V-exec (flujo de perfiles y PIN en `login-pin.spec.ts`) | Sí |
| POST | `/usuarios/registro/validar` | `login.controller.ts:34` | Pública | Todos | I-lect | No |
| POST | `/usuarios/registro` | `login.controller.ts:40` | `FirebaseAuthGuard` (`:39`) | Todos | I-lect | No |
| POST | `/usuarios/password/firebase` | `login.controller.ts:46` | `FirebaseAuthGuard` (`:45`) | Todos | I-lect | No |
| GET | `/usuarios/me` | `login.controller.ts:66` | `JwtAuthGuard` (`:65`) | Autenticado | I-lect | No |
| POST | `/usuarios/me/pin` | `login.controller.ts:57` | `JwtAuthGuard` (`:56`) | Autenticado | I-lect | No |
| PATCH | `/usuarios/me` | `login.controller.ts:79` | `JwtAuthGuard` (`:78`) | Autenticado (personal solo campos autorizados) | I-lect | No |
| PATCH | `/usuarios/me/password` | `login.controller.ts:88` | `JwtAuthGuard` (`:87`) | Autenticado | I-lect | No |
| GET | `/usuarios` | `login.controller.ts:73` | `JwtAuthGuard` + `RolesGuard` (`:71-72`) | Administrador | I-lect | No |
| DELETE | `/usuarios/:id` | `login.controller.ts:98` | `JwtAuthGuard` + `RolesGuard` (`:96-97`) | Administrador | I-lect | No |

### A2. Perfil y contactos (`apps/backend/src/perfil/perfil.controller.ts`)

Protección: `@UseGuards(JwtAuthGuard)` a nivel de clase (`:10`). Todas las rutas requieren sesión.

| Método | Ruta | Declaración | Estado | Doc |
|---|---|---|---|---|
| GET | `/usuarios/me/perfil` | `perfil.controller.ts:14` | I-lect · Sin respaldo | No |
| PUT | `/usuarios/me/perfil` | `perfil.controller.ts:19` | I-lect · Sin respaldo | No |
| POST | `/usuarios/me/contactos` | `perfil.controller.ts:24` | I-lect · Sin respaldo (el texto "contactos" sí aparece en la documentación, sin ruta) | No |
| PUT | `/usuarios/me/contactos/:id` | `perfil.controller.ts:29` | I-lect · Sin respaldo | No |
| DELETE | `/usuarios/me/contactos/:id` | `perfil.controller.ts:34` | I-lect · Sin respaldo | No |

### A3. Apadrinados (`apps/backend/src/apadrinados/apadrinados.controller.ts`)

Protección: `@UseGuards(JwtAuthGuard)` a nivel de clase (`:12`).

| Método | Ruta | Declaración | Estado | Doc |
|---|---|---|---|---|
| GET | `/usuarios/me/vinculadas` | `apadrinados.controller.ts:16` | I-lect · Sin respaldo | No |
| GET | `/usuarios/me/informe` | `apadrinados.controller.ts:21` | I-lect | Sí (`readme-apis.md:247`) |
| POST | `/usuarios/me/apadrinados` | `apadrinados.controller.ts:31` | I-lect · Sin respaldo | No |
| PUT | `/usuarios/me/apadrinados/:id/pin` | `apadrinados.controller.ts:37` | I-lect · Sin respaldo | No |
| PUT | `/usuarios/me/apadrinados/:id/estado` | `apadrinados.controller.ts:46` | I-lect · Sin respaldo | No |
| DELETE | `/usuarios/me/apadrinados/:id` | `apadrinados.controller.ts:55` | I-lect · Sin respaldo | No |

### A4. Compras y planes (`apps/backend/src/compras/compras.controller.ts`)

| Método | Ruta | Declaración | Protección | Estado | Doc |
|---|---|---|---|---|---|
| GET | `/compras/precio` | `compras.controller.ts:21` | **Pública**, sin guard | I-lect | Sí (`readme-apis.md:116`) |
| GET | `/compras/apadrinados` | `compras.controller.ts:33` | `JwtAuthGuard` (`:29`) | I-lect | Sí (la usa `api-client`) |
| GET | `/compras/resumen` | `compras.controller.ts:38` | `JwtAuthGuard` | I-lect | Sí (`readme-apis.md:117`) |
| GET | `/compras/apadrinados/ventas/pendientes` | `compras.controller.ts:43` | `JwtAuthGuard` | I-lect | Sí (`packages/api-client/src/emergen-api.ts:50`) |
| POST | `/compras/apadrinados/ordenes` | `compras.controller.ts:46` | `JwtAuthGuard` | I-lect | Sí (`readme-apis.md:118`) |
| POST | `/compras/apadrinados/ordenes/:orderId/captura` | `compras.controller.ts:54` | `JwtAuthGuard` | I-lect | Sí (`readme-apis.md:119`) |
| POST | `/compras/apadrinados/ventas/:ventaId/conciliar` | `compras.controller.ts:63` | `JwtAuthGuard` | I-lect | Sí (`readme-apis.md:120`) |
| POST | `/compras/apadrinados/ordenes/:orderId/cancelar` | `compras.controller.ts:69` | `JwtAuthGuard` | I-lect | Sí (`readme-apis.md:121`) |

### A5. Administración (`apps/backend/src/admin/`)

Todas tienen `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles(ADMINISTRADOR)` a nivel de clase. Cuando un método declara `@Roles(ADMINISTRADOR, SOPORTE)`, ese método permite también al soporte, porque la metadata del método prevalece sobre la de la clase.

| Método | Ruta | Declaración | Roles efectivos | Estado | Doc |
|---|---|---|---|---|---|
| GET | `/admin/alertas` | `admin-alertas.controller.ts:14` | Administrador | I-lect | Sí (`readme.apis.internas.md:13`) |
| GET | `/admin/tickets/reporte` | `admin-tickets.controller.ts:21` | Administrador | I-lect | Sí (`readme-apis.md:249`) |
| GET | `/admin/ventas` | `admin-ventas.controller.ts:24` | Administrador y soporte (`:25`) | I-lect | Sí (`readme.apis.internas.md:53`) |
| GET | `/admin/ventas/reporte` | `admin-ventas.controller.ts:31` | Administrador | I-lect | Sí (`readme-apis.md:248`) |
| GET | `/admin/usuarios` | `admin.controller.ts:20` | Administrador y soporte (`:21`) | I-lect | Sí (`readme.apis.internas.md:53`) |
| GET | `/admin/usuarios/planes` | `admin.controller.ts:26` | Administrador | I-lect | Sin respaldo |
| GET | `/admin/usuarios/trabajadores` | `admin.controller.ts:31` | Administrador | I-lect | Sin respaldo |
| POST | `/admin/usuarios/soporte` | `admin.controller.ts:36` | Administrador | I-lect | Sin respaldo |
| GET | `/admin/usuarios/:id` | `admin.controller.ts:44` | Administrador y soporte (`:45`) | I-lect | Sí (`readme.apis.internas.md:53`) |
| PATCH | `/admin/usuarios/trabajadores/:id` | `admin.controller.ts:53` | Administrador | I-lect | Sin respaldo |
| DELETE | `/admin/usuarios/trabajadores/:id` | `admin.controller.ts:62` | Administrador | I-lect | Sin respaldo |
| PATCH | `/admin/usuarios/:id` | `admin.controller.ts:70` | Administrador | I-lect | Sin respaldo |
| PUT | `/admin/usuarios/:id/plan` | `admin.controller.ts:79` | Administrador | I-lect | Sí (`README_BDD.md`) |
| PUT | `/admin/usuarios/:id/estado` | `admin.controller.ts:88` | Administrador | I-lect | Sin respaldo |
| DELETE | `/admin/usuarios/apadrinado/:id` | `admin.controller.ts:97` | Administrador | I-lect | Sin respaldo |
| DELETE | `/admin/usuarios/soporte/:id` | `admin.controller.ts:105` | Administrador | I-lect | Sin respaldo |
| GET | `/admin/auditoria` | `auditoria.controller.ts:17` | Administrador | I-lect | Sin respaldo (solo aparece `/reporte`) |
| GET | `/admin/auditoria/reporte` | `auditoria.controller.ts:23` | Administrador | I-lect | Sí (`readme-apis.md:250`) |

### A6. Salud (`apps/backend/src/health/health.controller.ts`)

| Método | Ruta | Declaración | Protección | Estado | Doc |
|---|---|---|---|---|---|
| GET | `/health` | `health.controller.ts:13` | Pública | I-lect | No |
| GET | `/health/ready` | `health.controller.ts:19` | Pública | I-lect | No |
| GET | `/health/sos` | `health.controller.ts:44` | **Pública**; devuelve 503 si el SOS no está listo | I-lect · Sin respaldo | No |

### A7. Integraciones

| Método | Ruta | Declaración | Protección | Estado | Doc |
|---|---|---|---|---|---|
| GET | `/` | `app.controller.ts:8` | Pública | I-lect | No |
| GET | `/auth/me` | `integrations/firebase-auth/firebase-auth.controller.ts:7` | `FirebaseAuthGuard` (`:8`) | I-lect | Sí (`readme-apis.md`) |
| GET | `/maps/geocode` | `integrations/google-maps/google-maps.controller.ts:15` | `JwtAuthGuard` (clase, `:11`) | I-lect | Sí (`readme-apis.md`) |
| GET | `/maps/reverse-geocode` | `integrations/google-maps/google-maps.controller.ts:20` | `JwtAuthGuard` | I-lect | Sin respaldo |
| POST | `/reports` | `integrations/jsreport/jsreport.controller.ts:16` | **Sin guard** | I-lect | Sí (`readme-apis.md:252`) |
| GET | `/indicators` | `integrations/mindicador/mindicador.controller.ts:15` | `JwtAuthGuard` (clase, `:11`) | I-lect | Sí (`readme-apis.md`) |
| GET | `/indicators/:code` | `integrations/mindicador/mindicador.controller.ts:20` | `JwtAuthGuard` | I-lect | Sí (`readme-apis.md`) |
| POST | `/payments/paypal/orders` | `integrations/paypal/paypal.controller.ts:22` | **Sin guard** | I-lect | No |
| POST | `/payments/paypal/orders/:orderId/capture` | `integrations/paypal/paypal.controller.ts:27` | **Sin guard** | I-lect | No |
| GET | `/notifications/whatsapp/status` | `integrations/whatsapp/whatsapp.controller.ts:36` | `JwtAuthGuard` + administrador (clase, `:28-29`) | I-lect | Sí |
| GET | `/notifications/whatsapp/qr` | `integrations/whatsapp/whatsapp.controller.ts:42` | Administrador | I-lect | Sí |
| POST | `/notifications/whatsapp/pairing-code` | `integrations/whatsapp/whatsapp.controller.ts:55` | Administrador | I-lect | Sí |
| POST | `/notifications/whatsapp/logout` | `integrations/whatsapp/whatsapp.controller.ts:63` | Administrador | I-lect | Sí |
| POST | `/notifications/whatsapp/alerts` | `integrations/whatsapp/whatsapp.controller.ts:70` | Administrador | I-lect | Sin respaldo |

## B. FastAPI (`services/internal-api/app/`)

Prefijo `/internal/v1` (`api/routes/__init__.py:8`). `/health` y `/health/ready` no tienen prefijo. `/docs` y `/openapi.json` solo se publican si `docs_enabled` (`core/config.py:40`).

Dependencias: `usuario_actual` verifica el JWT y carga el usuario (`dependencies/auth.py`). `solo_staff` exige rol administrador o soporte con estado completo.

| Método | Ruta | Declaración | Protección | Estado | Doc |
|---|---|---|---|---|---|
| POST | `/internal/v1/alertas` | `api/routes/alertas.py:13` | `usuario_actual` | I-lect | Sí (`readme.apis.internas.md:17`) |
| POST | `/internal/v1/alertas/{alerta_id}/cerrar` | `api/routes/alertas.py:22` | `usuario_actual` | I-lect | Sí (`readme.apis.internas.md:20`) |
| GET | `/internal/v1/alertas` | `api/routes/alertas.py:31` | `usuario_actual`; sin ser staff, solo ve sus alertas | I-lect | Sí (`readme.apis.internas.md:18`) |
| GET | `/internal/v1/alertas/{alerta_id}` | `api/routes/alertas.py:44` | `usuario_actual` | I-lect | Sí (`readme.apis.internas.md:19`) |
| GET | `/internal/v1/mensajes-contacto/tipos` | `api/routes/mensajes_contacto.py:18` | Pública | I-lect | Sí (`readme.apis.internas.md:61`) |
| POST | `/internal/v1/mensajes-contacto` | `api/routes/mensajes_contacto.py:27` | Pública, con límite de 5 envíos por IP cada 15 minutos (`:24`, `:30`) | I-lect | Sí (`readme.apis.internas.md:62`) |
| GET | `/internal/v1/mensajes-contacto/estados` | `api/routes/mensajes_contacto.py:36` | `solo_staff` | I-lect | Sí (`readme.apis.internas.md:63`) |
| GET | `/internal/v1/mensajes-contacto` | `api/routes/mensajes_contacto.py:41` | `solo_staff` | I-lect | Sí (`readme.apis.internas.md:64`) |
| GET | `/internal/v1/mensajes-contacto/{mensaje_id}` | `api/routes/mensajes_contacto.py:52` | `solo_staff` | I-lect | Sí (`readme.apis.internas.md:65`) |
| PATCH | `/internal/v1/mensajes-contacto/{mensaje_id}` | `api/routes/mensajes_contacto.py:60` | `solo_staff` | I-lect | Sí (`readme.apis.internas.md:66`) |
| GET | `/internal/v1/tickets-soporte/categorias` | `api/routes/tickets_soporte.py:17` | `usuario_actual` | I-lect | Sí (`readme.apis.internas.md:44`) |
| GET | `/internal/v1/tickets-soporte/estados` | `api/routes/tickets_soporte.py:22` | `usuario_actual` | I-lect | Sí (`readme.apis.internas.md:45`) |
| POST | `/internal/v1/tickets-soporte` | `api/routes/tickets_soporte.py:27` | `usuario_actual` | I-lect | Sí (`readme.apis.internas.md:46`) |
| GET | `/internal/v1/tickets-soporte` | `api/routes/tickets_soporte.py:40` | `usuario_actual` | I-lect | Sí (`readme.apis.internas.md:47`) |
| GET | `/internal/v1/tickets-soporte/{ticket_id}` | `api/routes/tickets_soporte.py:53` | `usuario_actual` | I-lect | Sí (`readme.apis.internas.md:48`) |
| PATCH | `/internal/v1/tickets-soporte/{ticket_id}` | `api/routes/tickets_soporte.py:65` | `solo_staff` | I-lect | Sí (`readme.apis.internas.md:49`) |
| GET | `/health` | `main.py:35` | Pública | I-lect | No |
| GET | `/health/ready` | `api/health.py:9` | Pública | I-lect | No |

## C. Rutas de navegación de los frontends

### C1. Web (`apps/web/src/App.tsx`)

| Ruta | Línea | Acceso | Notas |
|---|---|---|---|
| Rutas públicas (`RUTAS_PUBLICAS`) | `:165` | Pública | Mapa de vistas del sitio público |
| `/login` | `:170` | Pública | Formulario de acceso y registro |
| `/comprar` | `:194` | Con sesión | Compra de planes |
| `/inicio` | `:209` | Con sesión | Página de inicio |
| `/perfil` | `:211` | Con sesión | Perfil |
| `/cuentas` | `:214` | Con sesión, **oculta para administración y soporte** | Cuentas y apadrinados |
| `/soporte` | `:215` | Con sesión, **oculta para administración y soporte** | Tickets |
| `*` | `:218` | Pública | Redirige a `/` |

Nota: `privatePage` (`App.tsx`) exige sesión y, si se indica, un permiso de la matriz de acciones. Ocultar una ruta en la interfaz no sustituye la autorización del backend.

### C2. Móvil (`apps/mobile/src/App.tsx`)

| Ruta | Línea | Acceso |
|---|---|---|
| `/login` | `:70` | Pública |
| `/registro` | `:71` | Pública |
| `/pin` | `:72` | Pública (pide PIN) |
| `/home` | `:74` | Con sesión |
| `/perfil` | `:82` | Con sesión |
| `/cuentas` | `:90` | Con sesión |
| `/soporte` | `:98` | Con sesión |
| `/` | `:105` | Redirige a `/home` |

### C3. Escritorio (`apps/desktop/src/admin/PanelAdmin.tsx`)

| Ruta | Línea | Acceso |
|---|---|---|
| `/` | `:168` | Bitácora. Oculta para soporte |
| `/perfil` | `:170` | Perfil |
| `/administracion/cuentas` | `:173` | Cuentas |
| `/administracion/compras` | `:174` | Compras |
| `/administracion/tickets` | `:175` | Tickets (cambia permisos según `esAdministrador`) |
| `/administracion/contacto` | `:176` | Mensajes de contacto |
| `/administracion/planes` | `:177` | Planes. Oculta para soporte |
| `/administracion/alertas` | `:178` | Alertas. Oculta para soporte |
| `/administracion/trabajadores` | `:180` | Trabajadores (revisar la condición de la línea `:179`) |
| `*` | `:183` | Respuesta de ruta no encontrada |

## D. Resumen de la matriz

| Estado | Cantidad aproximada | Ejemplos |
|---|---|---|
| V-exec (verificada por ejecución) | 1 ruta, cubierta por 9 pruebas | `POST /usuarios/login` |
| I-lect (leída, sin ejecutar) | Todas las demás | Ver las tablas |
| Documentada y encontrada | Todas las rutas que los README citan | `POST /internal/v1/alertas`, `GET /compras/resumen` |
| Documentada pero no encontrada | 0 rutas. Sí faltan 5 documentos citados (ver [TRAZABILIDAD_DOCUMENTACION.md](../04_documentacion/TRAZABILIDAD_DOCUMENTACION.md)) | — |
| Implementada sin respaldo documental | 39 rutas (no aparecen en los documentos revisados) | `/usuarios/me/perfil`, `/health/sos`, `/admin/usuarios/planes` |
| Riesgo: sin guard de autenticación | 3 | `POST /reports`, `POST /payments/paypal/orders`, `POST /payments/paypal/orders/:orderId/capture` |
| Inaccesible o pendiente | Ninguna confirmada | El código de rutas está registrado en sus módulos |

**Cómo se verificó el guard de cada ruta:** se listaron todos los `@Controller`, `@UseGuards`, `@Roles` y decoradores HTTP de `apps/backend/src` sin truncar la salida, y se revisó a mano cada controlador sin guard visible. Después se comprobó que los módulos estén importados en `AppModule` (`apps/backend/src/app.module.ts:72-83`).
