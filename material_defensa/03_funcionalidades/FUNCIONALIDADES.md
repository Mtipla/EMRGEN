# Funcionalidades de EMERGEN

Escrito para: estudiante que debe explicar cada funcionalidad de punta a punta.

Cada funcionalidad responde a los 12 puntos de la Etapa 3: qué hace, para qué sirve, dónde está el código, qué archivo inicia la operación, funciones, servicios, rutas, comunicación, datos, errores, seguridad y dependientes. Las funcionalidades que no se leyeron en detalle están marcadas con **(solo rutas leídas)**.

## Agrupación por módulo y tipo de usuario

| Módulo | Usuario principal | Funcionalidades |
|---|---|---|
| Acceso | Todos | F1 Registro, F2 Inicio de sesión y perfiles |
| Cuenta | Usuario, apadrinado | F3 Perfil y contactos, F4 Apadrinados |
| Planes | Usuario | F5 Compra de planes y cupos |
| Emergencia | Usuario (móvil) | F6 SOS y cierre con PIN, F6b Envío por WhatsApp |
| Soporte | Usuario y personal | F7 Tickets, F8 Mensajes de contacto |
| Administración | Administrador, soporte | F9 Gestión de usuarios y planes, F10 Auditoría y reportes |
| Integraciones | Sistema | F11 Indicadores, mapas y Firebase |
| Operación | Sistema | F12 Salud y cierre automático de SOS |

## Recorrido general

```
Usuario → Interfaz (web / móvil / escritorio)
        → Evento (clic o envío de formulario)
        → Cliente HTTP (packages/api-client o axios / fetch)
        → API (NestJS :3001 o FastAPI :8000) con Authorization: Bearer
        → Guard (JWT, roles, Firebase)  →  Pipe de validación (DTO)
        → Controlador → Servicio → Transacción (si hay varias escrituras)
        → PostgreSQL (tablas del init.sql)
        → Respuesta JSON → Estado en la interfaz (React) → Pantalla
```

Ejemplo real: la web llama a `POST /usuarios/login`; `LoginController.login` pasa el cuerpo a `LoginService.iniciarSesion`; el servicio busca el usuario, compara la contraseña con bcrypt, firma el JWT (`login.service.ts:139`) y devuelve `{ access_token, usuario }`. La web guarda el token y lo envía en cada petición siguiente.

---

## F1. Registro de cuenta

1. **Qué hace:** crea una cuenta de usuario con correo verificado por Firebase.
2. **Para qué:** un visitante necesita una cuenta antes de comprar, crear contactos o emitir SOS.
3. **Código:** `apps/backend/src/login/login.controller.ts:34-46`; lógica en `login.service.ts` (`validarRegistro`, `crear`).
4. **Inicia:** `POST /usuarios/registro/validar` (público), después `POST /usuarios/registro` con token de Firebase.
5. **Funciones:** `validarRegistro` comprueba que el correo no exista (`ConflictException`) y devuelve los datos normalizados con la contraseña ya hasheada con bcrypt (`bcrypt.hash`). `crear` guarda el usuario.
6. **Servicios:** Firebase Auth (verificación del correo, `FirebaseAuthGuard`), bcrypt, TypeORM.
7. **Rutas:** `POST /usuarios/registro/validar`, `POST /usuarios/registro`, `POST /usuarios/password/firebase`, `GET /auth/me`.
8. **Comunicación:** la web usa `apps/web/src/features/auth/AuthForm.tsx` (`postUsuarios`, línea 81). Firebase se llama desde el navegador con `packages/api-client/src/firebase-auth.ts`.
9. **Datos:** entrada: nombre, correo, contraseña. Salida: usuario público. Tabla: `usuario`.
10. **Errores:** correo duplicado devuelve 409 con el mensaje "Ya existe una cuenta con ese correo". Ese mensaje permite saber si un correo está registrado (ver PUNTOS_CRITICOS).
11. **Seguridad:** contraseña con bcrypt; verificación de correo con Firebase; `ValidationPipe` con `forbidNonWhitelisted`.
12. **Dependientes:** F2 (el login necesita una cuenta), F5 (comprar requiere cuenta).

## F2. Inicio de sesión y perfiles con PIN

1. **Qué hace:** valida correo y contraseña, y si la cuenta tiene apadrinados, pide elegir perfil y PIN.
2. **Para qué:** un usuario con apadrinados entra como la cuenta principal o como uno de sus perfiles, sin correo propio para cada apadrinado.
3. **Código:** `apps/backend/src/login/login.service.ts:111` (`iniciarSesion`), `:151` (`elegirPerfil`); `login.controller.ts:51`.
4. **Inicia:** `POST /usuarios/login` con `correo_usuario`, `password` y, si aplica, `perfil_ID` y `PIN`.
5. **Funciones:**
   - Rechaza contraseñas demasiado largas para bcrypt (`passwordCabeEnBcrypt`).
   - Busca el usuario por correo y compara con bcrypt. Si no existe, compara contra un hash ficticio (`HASH_FICTICIO`), para no revelar si el correo existe por el tiempo de respuesta.
   - Si la cuenta es apadrinado (`usuario_principal_ID` distinto de nulo) devuelve 403: debe entrar con la cuenta principal.
   - Si es usuario con PIN, `elegirPerfil` devuelve la lista de perfiles o valida el PIN del perfil elegido.
   - Firma el JWT con `sub` (id) y `email`, y registra el acceso en `acceso_aplicacion` como `APLICACION.WEB`.
6. **Servicios:** `JwtService.signAsync` (`@nestjs/jwt`), bcrypt, `PinPrincipal` (`apps/backend/src/login/pin-principal.ts`) para los intentos de PIN.
7. **Rutas:** `POST /usuarios/login`, `POST /usuarios/me/pin` (configurar PIN), `GET /usuarios/me`.
8. **Comunicación:** los clientes guardan `access_token` y lo mandan en `Authorization: Bearer`.
9. **Datos:** tablas `usuario`, `pin`, `acceso_aplicacion`, `plan_usuario`. El JWT contiene `sub`, `email`, `iss = emergen-api`, `aud = emergen-web`, `exp`.
10. **Errores:** 401 credenciales incorrectas; 403 apadrinado que intenta entrar con su propio correo; 403 "PIN incorrecto. Te quedan N intentos." (`ForbiddenException` en `pin-principal.ts`); 429 con el mensaje de bloqueo de 5 minutos (`HttpException` con `TOO_MANY_REQUESTS`, mismo archivo).
11. **Seguridad:** JWT HS256 con secreto de 32 bytes o más (`login.module.ts`); duración según `JWT_SESSION_HOURS` (por defecto 2 horas, máximo 168; `apps/backend/src/config/session.ts`); bloqueo de PIN tras 3 fallos por 5 minutos.
12. **Dependientes:** todas las funcionalidades autenticadas (F3 a F12).

**Prueba que la respalda:** `apps/backend/src/login/login-pin.spec.ts`. Se ejecutó en esta sesión: 9 de 9 pruebas pasaron. Incluye "el tercer fallo bloquea 5 minutos", "apadrinado parcial: entra con su PIN fijo" y "administración y soporte entran sin selector".

## F3. Perfil y contactos de emergencia **(solo rutas leídas)**

1. **Qué hace:** muestra y edita el perfil, y administra los contactos a los que se avisa en un SOS.
2. **Para qué:** un SOS necesita contactos con número válido; el perfil guarda datos que el envío de WhatsApp puede incluir.
3. **Código:** `apps/backend/src/perfil/perfil.controller.ts` (rutas `:14-34`), `perfil.service.ts`.
4. **Inicia:** `GET /usuarios/me/perfil`, `PUT /usuarios/me/perfil`, `POST /usuarios/me/contactos`, `PUT` y `DELETE /usuarios/me/contactos/:id`.
5. **Funciones:** no se leyeron los métodos del servicio en detalle.
6. **Servicios:** TypeORM; cifrado de la ficha médica con `MEDICAL_DATA_KEYS` (README_BDD).
7. **Rutas:** las cinco listadas. Protección de clase: `JwtAuthGuard`.
8. **Comunicación:** `apps/web/src/features/cuenta/` (pruebas de contactos, antecedentes y duplicados). En el móvil, el componente que la usa no lo identifiqué en esta revisión.
9. **Datos:** tablas `contacto_emergencia`, `antecedente_medico`, `usuario_mensaje_personalizado`. La regla de negocio "contacto sin número repetido" está en `migrations/003_contacto_unico.sql`.
10. **Errores:** no se revisó el detalle de los mensajes de error.
11. **Seguridad:** `JwtAuthGuard` en toda la clase; la ficha médica se guarda cifrada según README_BDD (CA-11.1).
12. **Dependientes:** F6 (SOS necesita al menos un contacto; `alertas.py:47`).

## F4. Apadrinados

1. **Qué hace:** la cuenta principal crea perfiles para personas sin correo propio (por ejemplo, familiares), con PIN y tipo de acceso.
2. **Para qué:** el plan de la cuenta principal cubre también a los apadrinados (cupos).
3. **Código:** `apps/backend/src/apadrinados/apadrinados.controller.ts` (rutas `:16-55`), `apadrinados.service.ts`.
4. **Inicia:** `POST /usuarios/me/apadrinados`; cambiar PIN con `PUT .../pin`; cambiar tipo con `PUT .../estado`; eliminar con `DELETE`.
5. **Funciones:** la creación interna de apadrinados completos exige PIN propio y lo guarda con hash (README_BDD). Los apadrinados parciales reciben un PIN fijo que no pueden cambiar; los completos reciben un PIN temporal que deben cambiar al entrar (`migrations/005_pin_temporal.sql`).
6. **Servicios:** bcrypt para el PIN; TypeORM.
7. **Rutas:** las seis de la sección A3 de la matriz.
8. **Comunicación:** `apps/web/src/features/cuenta/apadrinados-pin.test.tsx` describe el flujo del PIN; la UI de alta no se revisó.
9. **Datos:** tablas `usuario` (`usuario_principal_ID`, `PIN_ID`, `estado_ID`), `pin`, `plan_usuario`.
10. **Errores:** 403 si intenta cambiar contraseña un apadrinado (`login.service.ts`, `cambiarPassword`).
11. **Seguridad:** `JwtAuthGuard` en la clase; el PIN se guarda con hash, no en claro.
12. **Dependientes:** F2 (inicio de sesión por perfil), F6 (el apadrinado parcial usa el PIN del principal para cerrar un SOS).

## F5. Compra de planes y cupos con PayPal

1. **Qué hace:** vende el plan base y los cupos de apadrinados mediante PayPal.
2. **Para qué:** sin plan efectivo no se puede emitir SOS (`alertas.py:45`).
3. **Código:** `apps/backend/src/compras/compras.controller.ts` (`:21-69`), `apps/backend/src/integrations/paypal/paypal.service.ts`.
4. **Inicia:** `GET /compras/precio` (público), luego `POST /compras/apadrinados/ordenes` con JWT.
5. **Funciones (según README_BDD, §compras):** guarda una reserva de cupos **antes** de llamar a PayPal; no hace llamadas externas dentro de transacciones reintentables; una captura confirmada concede los cupos una sola vez. Si el resultado es incierto, conserva la reserva y la referencia externa.
6. **Servicios:** PayPal REST (SDK `@paypal/checkout-server-sdk`), mindicador.cl para convertir CLP a USD (`MINDICADOR_API_URL`).
7. **Rutas:** `GET /compras/precio`, `GET /compras/resumen`, `GET /compras/apadrinados/ventas/pendientes`, `POST .../ordenes`, `POST .../ordenes/:orderId/captura`, `POST .../ventas/:ventaId/conciliar`, `POST .../ordenes/:orderId/cancelar`.
8. **Comunicación:** `packages/api-client/src/emergen-api.ts:49-70`; la web (`apps/web/src/features/compra/`).
9. **Datos:** tablas `venta`, `detalle_venta`, `metodo_pago`, `estado_pago`, `plan`, `plan_usuario`, `reserva_cupos`. Migraciones: `001_compras_paypal.sql`, `002_precio_plan_base.sql`.
10. **Errores:** si la captura no se confirma, la venta queda pendiente y la web la recupera con `GET .../pendientes`. README_BDD indica una revisión manual después de 5 horas sin ID externo; **no encontré esa ventana en el código** con búsqueda de texto.
11. **Seguridad:** `JwtAuthGuard` en las rutas de compra. Las rutas de `payments/paypal` **no tienen guard** (ver F5b y PUNTOS_CRITICOS).
12. **Dependientes:** F6 (SOS requiere plan), F9 (administración de planes y ventas).

### F5b. Ruta PayPal directa sin guard **(hallazgo)**

- `POST /payments/paypal/orders` (`apps/backend/src/integrations/paypal/paypal.controller.ts:22`) y `POST /payments/paypal/orders/:orderId/capture` (`:27`) no tienen `@UseGuards`.
- El módulo está importado en `AppModule` (`app.module.ts:75`), así que las rutas están activas.
- Ningún frontend las llama.
- `createOrder` recibe `amount`, `currency`, `description` y `referenceId` (DTO `create-paypal-order.dto.ts`). No recibe usuario, y en `paypal.service.ts` no encontré referencias a usuario (búsqueda de texto). Por tanto no hay asociación de la orden con una cuenta.

## F6. Emisión y cierre de SOS

1. **Qué hace:** registra una alerta de emergencia, avisa a los contactos y se cierra con el PIN del usuario.
2. **Para qué:** es la función central del sistema.
3. **Código:** `services/internal-api/app/api/routes/alertas.py` (`:13` crear, `:22` cerrar, `:31` listar, `:44` detalle); lógica en `services/internal-api/app/services/alertas.py` (`crear` `:27`, `cerrar` `:72`, `_finalizar` `:66`).
4. **Inicia:** móvil → `POST /internal/v1/alertas` con `clave_idempotencia`, mensaje opcional, `prioridad_id` y ubicación opcional.
5. **Funciones de `crear`:**
   - Bloquea la fila del usuario (`FOR UPDATE`).
   - **Idempotencia:** si llega una `clave_idempotencia` ya usada por el mismo usuario con la misma huella (SHA-256 del cuerpo), devuelve la alerta existente. Si la huella cambia, responde 409. Si la clave pertenece a otro usuario, responde 404 (no revela que existe).
   - Finaliza las alertas de más de 24 horas (`interval '24 hours'`).
   - Rechaza si hay una alerta activa (409), si no hay plan del principal (409) o si no hay contactos (409).
   - Crea `detalle_alerta`, `ubicacion_alerta` (opcional), `alerta` e `historial_alerta`, y una fila de `envio_alerta` por contacto (`ON CONFLICT DO NOTHING`), todo en una transacción.
6. **Funciones de `cerrar`:** exige el PIN efectivo (el del usuario, o el del principal si el emisor es apadrinado parcial). Si el PIN falla, incrementa `intentos_fallidos`; al quinto fallo bloquea 15 minutos (`:92`). Si es correcto, pasa la alerta a `FINALIZADA` y registra el cambio en `historial_alerta`.
7. **Servicios:** PostgreSQL (`psycopg`), `verify_pin` (`core/pin.py`), `core/limite.py` para límites de tasa.
8. **Rutas:** las cuatro de la sección B de la matriz.
9. **Datos:** `alerta`, `detalle_alerta`, `ubicacion_alerta`, `historial_alerta`, `envio_alerta`, `pin`, `contacto_emergencia`, `plan_usuario`, `usuario_mensaje_personalizado`.
10. **Errores:** 401 sesión inválida; 403 apadrinado parcial que intenta mensaje propio; 404 alerta inexistente; 409 alerta activa, sin plan, sin contactos o falta de PIN configurado; 429 bloqueo de PIN.
11. **Seguridad:** `usuario_actual` en todas las rutas; idempotencia; `FOR UPDATE` para evitar carreras; el PIN se verifica con hash (`core/pin.py`).
12. **Dependientes:** F6b (WhatsApp), F12 (cierre automático), la pantalla `apps/mobile/src/components/AlertaSos.tsx` y el panel de alertas del escritorio (`VistaAlertas.tsx`).

**Nota:** el README dice que el SOS "no requiere PIN para emitirlo". El código de `crear` no pide PIN; sí lo pide `cerrar`. Coincide.

## F6b. Envío de avisos por WhatsApp

1. **Qué hace:** envía a cada contacto el tipo de emergencia, el mensaje y la ubicación, y avisa el cierre.
2. **Para qué:** el contacto recibe el aviso aunque no tenga la aplicación.
3. **Código:** `apps/backend/src/integrations/whatsapp/whatsapp-sos-dispatcher.service.ts` (cola con `setInterval` en `:47`; consulta con `FOR UPDATE SKIP LOCKED` en `:84-101`; actualiza el estado en `:74` y `:122`); conexión en `whatsapp-connection.service.ts`.
4. **Inicia:** el temporizador del dispatcher (no una petición HTTP). El administrador vincula el número con `GET /notifications/whatsapp/qr` o `POST .../pairing-code`.
5. **Funciones:** toma las filas pendientes de `envio_alerta` con las alertas activas y las envía con la sesión de Baileys.
6. **Servicios:** Baileys (WhatsApp Web no oficial). README §5 advierte que no es una API oficial.
7. **Rutas:** `GET .../status`, `GET .../qr`, `POST .../pairing-code`, `POST .../logout` (todas de administrador).
8. **Comunicación:** el móvil muestra el estado de cada envío (README §5).
9. **Datos:** `envio_alerta` (cola), `estado_envio` (pendiente, enviado, fallido), `contacto_emergencia`.
10. **Errores:** reintentos con `retry.ts`; reconexión con temporizador (`whatsapp-connection.service.ts:271`).
11. **Seguridad:** rutas de gestión solo para administración; la sesión de Baileys no se transfiere por commit (`.gitignore`: `auth_info_baileys/`).
12. **Dependientes:** F6 (sin FastAPI no hay filas en la cola).

## F7. Tickets de soporte

1. **Qué hace:** un usuario abre una solicitud de soporte; el personal la responde y cambia su estado.
2. **Para qué:** canal de atención dentro de la aplicación.
3. **Código:** `services/internal-api/app/api/routes/tickets_soporte.py` (`:17-70`), `services/tickets.py`, `schemas/tickets.py`.
4. **Inicia:** `POST /internal/v1/tickets-soporte`.
5. **Funciones:** consulta catálogos (`categoria_soporte`, `estado_ticket`), crea el ticket, lista y actualiza. Solo el personal puede cambiar el estado o la solución (`solo_staff`, `:69`).
6. **Servicios:** PostgreSQL.
7. **Rutas:** las seis de la sección B de la matriz.
8. **Comunicación:** `apps/web/src/features/administracion/admin-soporte.test.tsx`; el panel de escritorio (`VistaTickets`, con `esAdministrador`).
9. **Datos:** `ticket_soporte`, `soporte`, `categoria_soporte`, `estado_ticket`. Migración `20261028_tickets_responsable.sql`.
10. **Errores:** 401, 403 para cambios de personal, 404 si no existe.
11. **Seguridad:** lectura por `usuario_actual`; escritura por `solo_staff`.
12. **Dependientes:** la pantalla `/soporte` de web y móvil.

## F8. Mensajes de contacto (sitio público)

1. **Qué hace:** un visitante envía un mensaje desde el sitio público; el personal lo lee y responde.
2. **Para qué:** formulario de contacto sin cuenta.
3. **Código:** `services/internal-api/app/api/routes/mensajes_contacto.py` (`:18-66`), `services/contacto.py`.
4. **Inicia:** `POST /internal/v1/mensajes-contacto` (público).
5. **Funciones:** la ruta pública aplica un límite de **5 envíos por IP cada 15 minutos** (`LimiteVentana(maximo=5, segundos=15*60)`, `:24`, `:30`). Las rutas de lectura y cambio de estado son de personal.
6. **Servicios:** PostgreSQL; `core/limite.py` (ventana deslizante en memoria).
7. **Rutas:** las seis de la sección B.
8. **Comunicación:** el formulario de la web; el panel de escritorio (`VistaContacto`).
9. **Datos:** `mensaje_contacto`, `respuesta_contacto`, `tipo_contacto`, `estado_contacto`. Migración `003` y `004` (máximo de 160 caracteres en el mensaje personalizado).
10. **Errores:** 429 si supera el límite.
11. **Seguridad:** límite por IP en memoria: se reinicia al reiniciar el proceso y no sirve si hay varias instancias.
12. **Dependientes:** el panel de escritorio.

## F9. Administración de usuarios, planes y alertas (escritorio)

1. **Qué hace:** el panel de escritorio permite administrar cuentas, trabajadores, planes, compras, tickets, contactos, alertas y bitácora.
2. **Para qué:** operación interna del negocio.
3. **Código:** `apps/desktop/src/admin/PanelAdmin.tsx` (rutas `:167-183`); backend `apps/backend/src/admin/admin.controller.ts` (`:14-105`) y `admin.service.ts`.
4. **Inicia:** el usuario elige una sección del menú del panel; cada sección llama a su ruta.
5. **Funciones:** cambiar estado (`PUT /admin/usuarios/:id/estado`), asignar plan y cupos (`PUT /admin/usuarios/:id/plan`), eliminar apadrinados o personal.
6. **Servicios:** TypeORM; el cliente `apps/desktop/src/admin/api.ts` usa axios con `VITE_API_URL` y `VITE_INTERNAL_API_URL` (por defecto `http://localhost:8000`).
7. **Rutas:** las de la sección A5 y las de tickets y contactos de FastAPI.
8. **Comunicación:** Electron (`apps/desktop/electron/main.cjs`) abre la ventana y carga React.
9. **Datos:** `usuario`, `plan`, `plan_usuario`, `venta`, `alerta`, `ticket_soporte`, `bitacora_sistema`.
10. **Errores:** 403 para acciones que el soporte no puede hacer (`@Roles`).
11. **Seguridad:** `JwtAuthGuard` y `RolesGuard` en toda la clase; el soporte tiene permisos reducidos en la interfaz y en el backend.
12. **Dependientes:** F10 (cada acción queda en la bitácora).

## F10. Auditoría y reportes

1. **Qué hace:** registra cada cambio de administración en la bitácora y genera informes PDF o Excel.
2. **Para qué:** trazabilidad. Quién cambió qué y cuándo.
3. **Código:** `apps/backend/src/auditoria/auditoria.controller.ts` (`:17`, `:23`), `auditoria.service.ts` (`EntradaBitacora` `:51`; en la línea `:144` el parámetro `aplicacion_ID` tiene por defecto `APLICACION.ESCRITORIO`), `apps/backend/src/integrations/jsreport/`.
4. **Inicia:** `GET /admin/auditoria` y `GET /admin/auditoria/reporte`.
5. **Funciones:** `auditoria.service` escribe en `bitacora_sistema` con `TipoAccion`, `EntidadAuditada` y `ResultadoAccion` (`bitacora.entity.ts`).
6. **Servicios:** jsReport (`JSREPORT_URL`) para generar el PDF o Excel.
7. **Rutas:** `GET /admin/auditoria/reporte`, `GET /admin/ventas/reporte`, `GET /admin/tickets/reporte`, `GET /usuarios/me/informe`. Además, `POST /reports` (sin guard, ver F5b).
8. **Comunicación:** el escritorio (`SeccionBitacora.tsx`) y la web (`apps/web/src/features/cuenta/informe.test.tsx`).
9. **Datos:** `bitacora_sistema`, `aplicacion` (WEB, MOVIL, ESCRITORIO).
10. **Errores:** no revisé cómo responde el servicio si jsReport no está disponible.
11. **Seguridad:** las rutas de auditoría son solo para administración.
12. **Dependientes:** informes y cumplimiento.

**Nota:** la bitácora registra el campo `aplicacion_ID`, pero el login siempre escribe `WEB` (ver F2). Por eso el escritorio no aparece como origen de los accesos del personal.

## F11. Integraciones de consulta

1. **Qué hace:** consulta indicadores económicos (dólar, UF, etc.), geocodifica coordenadas y valida el token de Firebase.
2. **Para qué:** mostrar valores en CLP y USD en la compra, y mostrar direcciones en el SOS.
3. **Código:** `integrations/mindicador/mindicador.controller.ts` (`:15`, `:20`), `integrations/google-maps/google-maps.controller.ts` (`:15`, `:20`), `integrations/firebase-auth/firebase-auth.controller.ts` (`:7`).
4. **Inicia:** `GET /indicators`, `GET /maps/geocode`, `GET /maps/reverse-geocode`, `GET /auth/me`.
5. **Funciones:** pasan la petición al proveedor externo y devuelven el resultado. `DOLAR_CLP_RESPALDO` evita fallar si mindicador no responde (README §5).
6. **Servicios:** mindicador.cl, Google Maps Platform (`GOOGLE_MAPS_API_KEY` en servidor), Firebase.
7. **Rutas:** las cuatro de la sección A7.
8. **Comunicación:** el README §5 describe el uso de Google Maps y mindicador. No identifiqué en esta revisión qué componente de la interfaz llama a cada ruta.
9. **Datos:** ninguno persistente.
10. **Errores:** 503 si falta la configuración (README §5).
11. **Seguridad:** `JwtAuthGuard` en mindicador y Google Maps; la clave de Google se guarda en el servidor.
12. **Dependientes:** F5 y F6 (ubicación).

## F12. Salud y cierre automático de SOS

1. **Qué hace:** cierra solas las alertas de 24 horas y expone el estado del servicio.
2. **Para qué:** evita alertas abiertas indefinidamente. README §5: "El job de FastAPI recupera al arrancar y cada 30 segundos las alertas con 24 horas transcurridas".
3. **Código:** `services/internal-api/app/core/scheduler.py` (`loop` `:15`, `lifespan` `:29`), `services/alertas.py` (`finalizar_vencidas` `:98`); configuración `core/config.py:32`.
4. **Inicia:** el arranque de FastAPI (`lifespan`) lanza el bucle. El intervalo es de 30 segundos (`intervalo_cierre_segundos`).
5. **Funciones:** `finalizar_vencidas` toma las alertas activas de más de 24 horas con `FOR UPDATE SKIP LOCKED` y las cierra. Cada cierre registra su historial.
6. **Servicios:** PostgreSQL.
7. **Rutas:** `GET /health`, `GET /health/ready` (FastAPI), `GET /health`, `GET /health/ready`, `GET /health/sos` (NestJS). Todas públicas.
8. **Comunicación:** Docker (`docker-compose.yml:135`) comprueba `/health/ready` cada cierto tiempo.
9. **Datos:** `alerta`, `historial_alerta`.
10. **Errores:** si el cierre falla, el bucle registra el error y sigue (no verificado en detalle).
11. **Seguridad:** las rutas de salud no exponen datos personales; `/health/sos` devuelve 503 si no está listo.
12. **Dependientes:** F6 (el "EXPIRADA" está reservado, README).
