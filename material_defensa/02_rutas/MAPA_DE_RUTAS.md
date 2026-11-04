# Mapa de rutas (referencia rápida)

Escrito para: consulta rápida durante la defensa. Para estados y detalles, ver [MATRIZ_RUTAS.md](MATRIZ_RUTAS.md).

## Dónde busco...

| Quiero saber... | Archivo | Función o clase |
|---|---|---|
| Cómo entra un usuario | `apps/backend/src/login/login.controller.ts` | `LoginController` (`:30`) |
| La lógica del login y de los perfiles con PIN | `apps/backend/src/login/login.service.ts` | `iniciarSesion` (`:111`), `elegirPerfil` (`:151`) |
| Cómo se firma el JWT | `apps/backend/src/login/login.service.ts` | `signAsync` (`:139`) |
| Parámetros del JWT (secreto, emisor, duración) | `apps/backend/src/login/login.module.ts` | `JwtModule.registerAsync` (`:22`); `apps/backend/src/config/session.ts` |
| Cómo se valida cada petición con sesión | `apps/backend/src/login/jwt-auth.guard.ts` | `JwtAuthGuard.canActivate` (`:25`), `verifyAsync` (`:36`) |
| Control por rol | `apps/backend/src/login/roles.guard.ts`, `roles.decorator.ts` | `RolesGuard`, `@Roles` |
| Bloqueo del PIN de perfil (NestJS) | `apps/backend/src/login/pin-principal.ts` | `MAX_INTENTOS_PIN` (`:6`), bloqueo de 5 minutos (`:30`) |
| Validación global de entrada | `apps/backend/src/main.ts` | `ValidationPipe` (`:28-34`) |
| Registrar un SOS | `services/internal-api/app/api/routes/alertas.py` | `crear_alerta` (`:13`) → `services/alertas.py` `crear` (`:27`) |
| Cerrar un SOS con PIN | `services/internal-api/app/api/routes/alertas.py` | `cerrar_alerta` (`:22`) → `services/alertas.py` `cerrar` (`:72`) |
| Bloqueo del PIN de cierre de SOS (FastAPI) | `services/internal-api/app/services/alertas.py` | Línea `:92` (5 fallos, 15 minutos) |
| Cierre automático de SOS vencidos | `services/internal-api/app/services/alertas.py` `finalizar_vencidas` (`:98`); `core/scheduler.py` | Intervalo `intervalo_cierre_segundos` = 30 (`core/config.py:32`) |
| Envío de WhatsApp de SOS | `apps/backend/src/integrations/whatsapp/whatsapp-sos-dispatcher.service.ts` | Intervalo (`:47`), consulta con `SKIP LOCKED` (`:84-101`) |
| Autenticación de FastAPI | `services/internal-api/app/dependencies/auth.py` | `usuario_actual`, `solo_staff` |
| Tickets de soporte | `services/internal-api/app/api/routes/tickets_soporte.py` → `services/tickets.py` | Rutas `:17-70` |
| Mensajes de contacto | `services/internal-api/app/api/routes/mensajes_contacto.py` → `services/contacto.py` | Rutas `:18-66` |
| Compras con PayPal | `apps/backend/src/compras/compras.controller.ts` → `compras.service` | Rutas `:21-69` |
| Pagos PayPal directos (sin guard) | `apps/backend/src/integrations/paypal/paypal.controller.ts` → `paypal.service.ts` | `createOrder` (`:54`), `captureOrder` (`:93`) |
| Reportes PDF o Excel | `apps/backend/src/integrations/jsreport/jsreport.controller.ts` → `jsreport.service.ts` | `POST /reports` (`:16`) |
| Administración de usuarios | `apps/backend/src/admin/admin.controller.ts` → `admin.service.ts` | Rutas `:14-105` |
| Bitácora de auditoría | `apps/backend/src/auditoria/auditoria.controller.ts` → `auditoria.service.ts` | `EntradaBitacora` (`:51`) |
| Perfil y contactos | `apps/backend/src/perfil/perfil.controller.ts` → `perfil.service.ts` | Rutas `:9-34` |
| Apadrinados | `apps/backend/src/apadrinados/apadrinados.controller.ts` → `apadrinados.service.ts` | Rutas `:11-55` |
| Conexión a la base de datos (NestJS) | `apps/backend/src/app.module.ts` | `TypeOrmModule.forRootAsync` (`:46`) |
| Conexión a la base de datos (FastAPI) | `services/internal-api/app/core/db.py` | `get_db` |
| Esquema de la base | `init.sql` | `CREATE TABLE` (`:66` a `:425`; 34 tablas) |
| Cliente HTTP compartido | `packages/api-client/src/emergen-api.ts`, `http.ts` | `fetch` (`http.ts:30`) |
| Login de Firebase (registro) | `apps/backend/src/integrations/firebase-auth/` | `FirebaseAuthGuard` |

## Dónde cambiar la configuración (sin escribir secretos)

| Variable | Dónde se lee | Qué controla |
|---|---|---|
| `JWT_SECRET` | `login.module.ts` (mínimo 32 bytes); `services/internal-api/app/core/config.py` | Firma de sesiones. Debe ser igual en NestJS y FastAPI |
| `JWT_SESSION_HOURS` | `apps/backend/src/config/session.ts` | Duración de la sesión. Por defecto 2 horas, máximo 168 |
| `CORS_ORIGINS` | `apps/backend/src/main.ts:9-10` (valor por defecto); `docker-compose.yml:118` | Orígenes permitidos |
| `TRUSTED_PROXY_CIDRS` | `apps/backend/src/main.ts:16` | Confianza en el proxy para la IP |
| `WHATSAPP_ENABLED` | README §5 | Activa el envío por WhatsApp |
| `MEDICAL_DATA_KEYS` | README_BDD | Clave para cifrar la ficha médica |
| `intervalo_cierre_segundos` | `services/internal-api/app/core/config.py:32` | Cada cuántos segundos corre el cierre automático (30) |
| `max_body_bytes` | `services/internal-api/app/core/config.py:41` | Tamaño máximo del cuerpo (16 KB) |
| `docs_enabled` | `services/internal-api/app/core/config.py:40` | Publica `/docs` solo fuera de producción |
