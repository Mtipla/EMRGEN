# Banco de preguntas de defensa

Escrito para: estudiante que practica para la comisión.

**Cómo usarlo:** lee la pregunta, responde en voz alta con la respuesta corta (20 a 40 segundos), y luego compara con la respuesta técnica. Abre el archivo de la evidencia para confirmarlo. Las preguntas marcadas como **Crítica** son las que una comisión suele hacer para medir si entiendes el código.

Niveles: **Básica**, **Intermedia**, **Avanzada**, **Crítica**.

---

## Objetivo del proyecto

### P01. ¿Qué problema resuelve EMERGEN? — Básica
- **Respuesta corta:** Permite avisar a personas de confianza en una emergencia, con un botón SOS desde el móvil. El sistema registra la alerta y envía aviso por WhatsApp.
- **Respuesta técnica:** Registro transaccional de la alerta con idempotencia en FastAPI, cola de envíos en la tabla `envio_alerta` y dispatcher en NestJS que envía por WhatsApp (Baileys).
- **Evidencia:** `README.md` (introducción); `services/internal-api/app/services/alertas.py:27`; `apps/backend/src/integrations/whatsapp/whatsapp-sos-dispatcher.service.ts:47`.
- **Repregunta:** ¿Por qué el aviso no se envía desde la misma petición del SOS?
- **Dificultad:** básico

### P02. ¿Quiénes son los usuarios del sistema? — Básica
- **Respuesta corta:** Usuario, apadrinado, administrador y soporte. Los dos últimos son personal y tienen roles 1 y 2.
- **Respuesta técnica:** `rol_ID` 1 administrador, 2 soporte, 3 usuario. Apadrinado no es un rol numérico: es un usuario con `usuario_principal_ID` distinto de nulo. El estado 1 es completo y el 2 es parcial.
- **Evidencia:** `services/internal-api/app/dependencies/auth.py` (constantes); `apps/backend/src/login/login.service.ts:111-146`; `README_BDD.md` (estados).
- **Repregunta:** ¿Qué pasa si un apadrinado intenta entrar con su propio correo?
- **Dificultad:** básico

### P03. ¿Qué funcionalidades principales tiene? — Básica
- **Respuesta corta:** Registro e inicio de sesión, perfil y contactos, apadrinados, compra de planes, SOS con WhatsApp, tickets, contacto, administración y auditoría.
- **Respuesta técnica:** Doce funcionalidades agrupadas por módulo; ver el detalle en FUNCIONALIDADES.md.
- **Evidencia:** [FUNCIONALIDADES.md](../03_funcionalidades/FUNCIONALIDADES.md).
- **Repregunta:** ¿Cuál es la más importante y por qué?
- **Dificultad:** básico

### P04. ¿Cuál es la diferencia entre un apadrinado y un usuario? — Intermedia
- **Respuesta corta:** El apadrinado no tiene correo ni contraseña propios. Entra desde la cuenta principal y elige su perfil con un PIN.
- **Respuesta técnica:** Ambos son filas de `usuario`. El apadrinado tiene `usuario_principal_ID` distinto de nulo; `iniciarSesion` lo rechaza con 403 si intenta entrar con su correo y el `PIN` se valida con `elegirPerfil`. El plan se consume del principal (`alertas.py:45`).
- **Evidencia:** `apps/backend/src/login/login.service.ts:111-150`; `services/internal-api/app/services/alertas.py:39-47`.
- **Repregunta:** ¿Qué tipo de acceso tiene el apadrinado parcial al SOS?
- **Dificultad:** intermedio

---

## Arquitectura

### P05. ¿Cómo está construido el sistema? — Básica
- **Respuesta corta:** Tres interfaces (web, móvil, escritorio), dos APIs (NestJS y FastAPI) y una base PostgreSQL compartida.
- **Respuesta técnica:** Monorepo con npm workspaces y Turborepo. NestJS atiende cuentas y compras; FastAPI atiende SOS y tickets. Ambos hablan con la misma base con SQL y TypeORM.
- **Evidencia:** `package.json`; `turbo.json`; [ARQUITECTURA.md](../01_arquitectura/ARQUITECTURA.md) §1.
- **Repregunta:** ¿Por qué no hay una sola API?
- **Dificultad:** básico

### P06. ¿Por qué hay dos servicios de backend? — Intermedia
- **Respuesta corta:** Separar el SOS, que es crítico y debe ser simple, del resto del negocio. Permite escalarlo o reemplazarlo sin tocar NestJS.
- **Respuesta técnica:** Análisis, no decisión documentada. Ventajas: aislamiento y lenguaje con validación Pydantic. Costos: dos despliegues, dos conjuntos de dependencias y acoplamiento por base y por secreto JWT.
- **Evidencia:** `services/internal-api/app/main.py`; `docker-compose.yml`; [TRAZABILIDAD_DOCUMENTACION.md](../04_documentacion/TRAZABILIDAD_DOCUMENTACION.md) (no hay acta que lo justifique).
- **Repregunta:** ¿Qué pasa si las dos APIs usan una base distinta?
- **Dificultad:** intermedio

### P07. ¿Cómo se comunican NestJS y FastAPI? — Intermedia
- **Respuesta corta:** No se llaman entre sí. Comparten la base y el secreto JWT. El SOS que registra FastAPI lo envía NestJS leyendo una tabla.
- **Respuesta técnica:** FastAPI escribe `alerta` y `envio_alerta` en la misma transacción. El dispatcher de NestJS consulta `envio_alerta` con `FOR UPDATE SKIP LOCKED` cada pocos segundos.
- **Evidencia:** `services/internal-api/app/services/alertas.py:27-64`; `apps/backend/src/integrations/whatsapp/whatsapp-sos-dispatcher.service.ts:47`, `:84-101`.
- **Repregunta:** ¿Qué pasa si NestJS está apagado durante una hora?
- **Dificultad:** intermedio

### P08. ¿Por qué se usa una tabla como cola y no Redis o RabbitMQ? — Avanzada
- **Respuesta corta:** Porque el envío nace en la misma transacción que la alerta. Si la alerta se confirma, el envío queda registrado; no hay forma de perder el aviso entre dos sistemas.
- **Respuesta técnica:** Escritura atómica en la base (outbox). Costo: sondeo y latencia de unos segundos. Alternativa: cola externa, con el riesgo de inconsistencia entre base y cola si no se usa un outbox.
- **Evidencia:** `services/internal-api/app/services/alertas.py:50-64` (INSERT de `envio_alerta` dentro de la transacción); `whatsapp-sos-dispatcher.service.ts:47`.
- **Repregunta:** ¿Qué pasa si el dispatcher envía el mensaje pero no alcanza a actualizar el estado?
- **Dificultad:** avanzado

### P09. ¿Qué pasa si se cambia el nombre de la tabla `envio_alerta`? — Crítica
- **Respuesta corta:** El envío de WhatsApp deja de funcionar. Ningún compilador lo detecta, porque el acoplamiento es por SQL.
- **Respuesta técnica:** FastAPI y NestJS escriben y leen la tabla con SQL escrito a mano. TypeORM con `synchronize: false` no lo detecta. Solo las pruebas de integración lo detectarían, y no se ejecutaron en esta revisión.
- **Evidencia:** `whatsapp-sos-dispatcher.service.ts:84-88`; `services/alertas.py`; `apps/backend/src/health/health.controller.ts:24`.
- **Repregunta:** ¿Cómo lo evitarías?
- **Dificultad:** avanzado

---

## Frontend

### P10. ¿Cómo se organiza la web? — Básica
- **Respuesta corta:** Un `BrowserRouter` con rutas públicas, de inicio de sesión y privadas que exigen sesión.
- **Respuesta técnica:** `apps/web/src/main.tsx` monta `App`; `App.tsx` define rutas con `Route` y la función `privatePage`, que redirige a `/login` si no hay sesión.
- **Evidencia:** `apps/web/src/main.tsx`; `apps/web/src/App.tsx:162-218`.
- **Repregunta:** ¿Ocultar una ruta en la interfaz la protege?
- **Dificultad:** básico

### P11. ¿Cómo se oculta algo al personal en la web? — Intermedia
- **Respuesta corta:** Con la variable `esPersonal` y condicionales en las rutas de cuentas y soporte.
- **Respuesta técnica:** `esPersonal` se calcula desde el perfil (`perfilDe`). Las rutas `/cuentas` y `/soporte` solo existen si no es personal. Eso es seguridad de interfaz, no de servidor: el backend debe rechazar la petición igualmente.
- **Evidencia:** `apps/web/src/App.tsx:135`, `:214-215`.
- **Repregunta:** ¿Cómo se rechaza en el servidor una petición de cuentas hecha por personal?
- **Dificultad:** intermedio

### P12. ¿Qué comparten web, móvil y escritorio? — Básica
- **Respuesta corta:** El cliente HTTP (`packages/api-client`), los tipos (`packages/api-types`) y los componentes (`packages/ui`).
- **Respuesta técnica:** Son paquetes del workspace. Cambiar un tipo en `api-types` obliga a revisar los tres frontends.
- **Evidencia:** `packages/api-client/src/emergen-api.ts`; `packages/ui/package.json`.
- **Repregunta:** ¿Qué pasa si el backend cambia una ruta y el cliente no?
- **Dificultad:** básico

### P13. ¿Por qué el móvil usa Capacitor? — Intermedia
- **Respuesta corta:** Para empaquetar la misma aplicación web como APK y acceder a geolocalización y háptica.
- **Respuesta técnica:** Capacitor es un puente nativo. Los plugins `@capacitor/geolocation`, `haptics` y `status-bar` están en `apps/mobile/package.json`. Ionic da componentes con apariencia móvil.
- **Evidencia:** `apps/mobile/package.json`; `apps/mobile/android/`.
- **Repregunta:** ¿Qué pasa con la ubicación si el usuario no da permiso?
- **Dificultad:** intermedio

### P14. ¿Por qué el escritorio usa Electron? — Intermedia
- **Respuesta corta:** Para tener una aplicación de escritorio con la misma tecnología React que la web.
- **Respuesta técnica:** `apps/desktop/electron/main.cjs` crea la ventana y carga la interfaz de Vite. El panel llama al backend con axios y las variables `VITE_API_URL` e `VITE_INTERNAL_API_URL`.
- **Evidencia:** `apps/desktop/electron/main.cjs`; `apps/desktop/src/admin/api.ts:18-24`.
- **Repregunta:** ¿Qué diferencia hay entre el proceso principal y el de la interfaz?
- **Dificultad:** intermedio

---

## Backend

### P15. ¿Dónde empieza la ejecución de NestJS? — Básica
- **Respuesta corta:** En `bootstrap()` de `main.ts`.
- **Respuesta técnica:** Crea la app, configura CORS antes del parser, fija timeouts del servidor, registra `ValidationPipe` global y escucha en el puerto.
- **Evidencia:** `apps/backend/src/main.ts:12-41`.
- **Repregunta:** ¿Por qué CORS debe ir antes del parser?
- **Dificultad:** básico

### P16. ¿Qué hace `ValidationPipe` con `whitelist` y `forbidNonWhitelisted`? — Intermedia
- **Respuesta corta:** Elimina los campos que no están en el DTO y rechaza la petición si los hay.
- **Respuesta técnica:** `whitelist` quita propiedades sin decorador de validación; `forbidNonWhitelisted` devuelve 400; `transform` convierte tipos. Protege contra asignación masiva.
- **Evidencia:** `apps/backend/src/main.ts:28-34`.
- **Repregunta:** ¿Qué vulnerabilidad evita?
- **Dificultad:** intermedio

### P17. ¿Cómo funciona un guard? — Intermedia
- **Respuesta corta:** Es una clase que decide si la petición puede seguir antes del controlador.
- **Respuesta técnica:** Implementa `canActivate`. `JwtAuthGuard` lee el `Authorization`, verifica el JWT (`verifyAsync`, `jwt-auth.guard.ts:36`), carga el usuario activo y lo deja en `request.user`.
- **Evidencia:** `apps/backend/src/login/jwt-auth.guard.ts:25-50`.
- **Repregunta:** ¿Por qué releer el usuario en cada petición?
- **Dificultad:** intermedio

### P18. ¿Cómo se controla el rol? — Intermedia
- **Respuesta corta:** Con `@Roles` y `RolesGuard`.
- **Respuesta técnica:** `@Roles` guarda metadatos en la clase o el método; `RolesGuard` los lee. El método prevalece sobre la clase, por eso en `admin.controller.ts:21` el soporte puede listar usuarios.
- **Evidencia:** `apps/backend/src/admin/admin.controller.ts:15-21`, `:45`; `apps/backend/src/login/roles.guard.ts`.
- **Repregunta:** ¿Cómo se escribiría una ruta solo para administrador dentro de una clase que permite soporte?
- **Dificultad:** avanzado

### P19. ¿Por qué el login devuelve un mensaje genérico ante correo o contraseña incorrectos? — Intermedia
- **Respuesta corta:** Para no revelar cuál de los dos datos falló.
- **Respuesta técnica:** Ambos casos lanzan `UnauthorizedException('Correo o contraseña incorrectos')`. Además, si el usuario no existe, se compara contra `HASH_FICTICIO`, así el tiempo de respuesta es parecido.
- **Evidencia:** `apps/backend/src/login/login.service.ts:111-130`.
- **Repregunta:** ¿Y el registro? ¿Revela si un correo existe?
- **Dificultad:** intermedio

### P20. ¿Qué pasa si se apaga el backend de NestJS? — Básica
- **Respuesta corta:** No hay login, compras ni administración, y el WhatsApp deja de enviarse. FastAPI sigue funcionando para SOS con sesiones ya emitidas.
- **Respuesta técnica:** FastAPI verifica el JWT sin llamar a NestJS, así que sigue aceptando tokens válidos mientras la base esté disponible.
- **Evidencia:** `services/internal-api/app/dependencies/auth.py:42-72`.
- **Repregunta:** ¿Qué parte depende de la base y cuál de NestJS?
- **Dificultad:** básico

---

## APIs

### P21. ¿Qué es una API REST y cómo la usa EMERGEN? — Básica
- **Respuesta corta:** Un conjunto de rutas HTTP con verbos (GET, POST, PATCH…) que devuelven JSON.
- **Respuesta técnica:** Recursos como `/usuarios`, `/compras`, `/admin/usuarios/:id`. Verbos según la acción: POST para crear, PATCH o PUT para actualizar, DELETE para borrar.
- **Evidencia:** [MATRIZ_RUTAS.md](../02_rutas/MATRIZ_RUTAS.md).
- **Repregunta:** ¿Por qué `PUT` en `/admin/usuarios/:id/plan` y no `PATCH`?
- **Dificultad:** básico

### P22. ¿Por qué POST para el login? — Intermedia
- **Respuesta corta:** Porque el login crea una sesión y envía credenciales en el cuerpo, no en la URL.
- **Respuesta técnica:** Las credenciales en la URL quedan en los registros del servidor y del navegador. POST además permite un cuerpo validado por DTO.
- **Evidencia:** `apps/backend/src/login/login.controller.ts:51`.
- **Repregunta:** ¿Qué código HTTP devuelve el login exitoso?
- **Dificultad:** intermedio

### P23. ¿Qué devuelve el SOS si se envía dos veces? — Avanzada
- **Respuesta corta:** La misma alerta, sin duplicarla, si la clave de idempotencia y el cuerpo coinciden.
- **Respuesta técnica:** `crear` busca la clave; si existe y la huella coincide, devuelve la alerta (`services/alertas.py:31-35`). Si la huella cambia, responde 409. Si la clave es de otro usuario, responde 404.
- **Evidencia:** `services/internal-api/app/services/alertas.py:27-37`.
- **Repregunta:** ¿Por qué 404 y no 403 cuando la clave es de otro usuario?
- **Dificultad:** avanzado

### P24. ¿Qué códigos de error devuelve el SOS? — Intermedia
- **Respuesta corta:** 401 sesión inválida, 404 alerta inexistente, 409 conflictos de negocio, 429 bloqueo de PIN, 403 permisos.
- **Respuesta técnica:** `HTTPException` en el servicio con el código correspondiente. Un 409 indica que la regla de negocio no se cumple (plan, contactos o alerta activa).
- **Evidencia:** `services/internal-api/app/services/alertas.py:29-93`.
- **Repregunta:** ¿Cuál es la diferencia entre 401 y 403?
- **Dificultad:** intermedio

### P25. ¿Qué formato tienen las fechas y los montos? — Intermedia
- **Respuesta corta:** Los montos del DTO de PayPal son texto con hasta dos decimales. Las fechas las pone la base con `clock_timestamp()`.
- **Respuesta técnica:** `create-paypal-order.dto.ts` valida el monto con expresión regular para evitar errores de redondeo. Usar la hora de la base evita diferencias entre servidores.
- **Evidencia:** `apps/backend/src/integrations/paypal/dto/create-paypal-order.dto.ts`; `services/alertas.py:39`.
- **Repregunta:** ¿Por qué no usar `float` para dinero?
- **Dificultad:** intermedio

---

## Rutas

### P26. ¿Cuántas rutas tiene el sistema? — Básica
- **Respuesta corta:** 82 rutas de API: 64 en NestJS y 18 en FastAPI, más las de navegación de los frontends.
- **Respuesta técnica:** Conteo de decoradores `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete` y de rutas de FastAPI.
- **Evidencia:** [MATRIZ_RUTAS.md](../02_rutas/MATRIZ_RUTAS.md).
- **Repregunta:** ¿Cuántas de ellas están documentadas?
- **Dificultad:** básico

### P27. ¿Qué rutas no tienen protección? — Crítica
- **Respuesta corta:** Tres: `POST /reports`, `POST /payments/paypal/orders` y `POST /payments/paypal/orders/:orderId/capture`. Además hay rutas públicas por diseño, como el login y el precio.
- **Respuesta técnica:** Sus controladores no tienen `@UseGuards`. Sus módulos están importados en `AppModule`, así que están activas. Ningún frontend las llama. La de PayPal no asocia la orden a un usuario.
- **Evidencia:** `apps/backend/src/integrations/jsreport/jsreport.controller.ts:11-16`; `apps/backend/src/integrations/paypal/paypal.controller.ts:18-27`; `apps/backend/src/app.module.ts:75`, `:80`.
- **Repregunta:** ¿Qué harías hoy con esas rutas?
- **Dificultad:** avanzado

### P28. ¿Quién puede consultar el historial de alertas? — Intermedia
- **Respuesta corta:** Cada usuario ve sus propias alertas. El personal puede filtrar por cualquier usuario.
- **Respuesta técnica:** `listar_alertas` pone `filtro = usuario_id if usuario.es_staff else usuario.id`. El filtro de SQL `%(u)s IS NULL OR a.usuario_id = %(u)s` hace el resto.
- **Evidencia:** `services/internal-api/app/api/routes/alertas.py:40`; `services/internal-api/app/services/alertas.py:104-111`.
- **Repregunta:** ¿Qué pasa si un usuario envía `usuario_id` en la consulta?
- **Dificultad:** intermedio

### P29. ¿Por qué `GET /compras/precio` es pública? — Intermedia
- **Respuesta corta:** Porque el precio del plan base es información comercial que cualquier visitante debe ver antes de registrarse.
- **Respuesta técnica:** Así lo declara el controlador `PrecioPublicoController` (`compras.controller.ts:17-26`) sin guard. Es un análisis de intención: no hay un documento que lo confirme.
- **Evidencia:** `apps/backend/src/compras/compras.controller.ts:17-26`.
- **Repregunta:** ¿Qué información expone y cuál no?
- **Dificultad:** intermedio

### P30. ¿Qué rutas de salud existen y para qué? — Básica
- **Respuesta corta:** `/health` (vivo), `/health/ready` (listo) y `/health/sos` (listo para SOS, 503 si no).
- **Respuesta técnica:** Docker Compose llama a `/health/ready` de FastAPI para decidir si el contenedor está sano.
- **Evidencia:** `apps/backend/src/health/health.controller.ts:13-44`; `services/internal-api/app/api/health.py:9`; `docker-compose.yml:135`.
- **Repregunta:** ¿Qué información revela `/health/sos`?
- **Dificultad:** básico

---

## Base de datos

### P31. ¿Cuántas tablas tiene y cómo se crean? — Básica
- **Respuesta corta:** 34 tablas. `init.sql` las crea, solo cuando el volumen de Docker está vacío.
- **Respuesta técnica:** `init.sql` define el esquema y los catálogos (`:66` a `:425`). Un volumen existente no se actualiza; los cambios van en `migrations/`.
- **Evidencia:** `init.sql`; `README_BDD.md` (arranque y conservación de datos).
- **Repregunta:** ¿Qué pasa si cambias `init.sql` sin recrear el volumen?
- **Dificultad:** básico

### P32. ¿Por qué `synchronize: false`? — Intermedia
- **Respuesta corta:** Para que TypeORM no cambie la base por su cuenta y perder datos.
- **Respuesta técnica:** Con `synchronize: true`, TypeORM modifica el esquema al arrancar. En producción eso puede borrar columnas. Los cambios se aplican con SQL controlado.
- **Evidencia:** `README_BDD.md`; `apps/backend/src/app.module.ts:46-65`.
- **Repregunta:** ¿Cómo aplicarías un cambio nuevo en una base con datos?
- **Dificultad:** intermedio

### P33. ¿Qué es `FOR UPDATE` y por qué se usa? — Avanzada
- **Respuesta corta:** Bloquea la fila hasta terminar la transacción, para que otra petición no la cambie a la vez.
- **Respuesta técnica:** En `crear`, la fila de usuario queda bloqueada mientras se revisan las reglas. Así dos SOS simultáneos no crean dos alertas activas. `SKIP LOCKED` en el dispatcher permite que varios procesos tomen filas distintas.
- **Evidencia:** `services/internal-api/app/services/alertas.py:28`; `whatsapp-sos-dispatcher.service.ts:101`.
- **Repregunta:** ¿Qué pasa si dos procesos hacen `FOR UPDATE` sin `SKIP LOCKED`?
- **Dificultad:** avanzado

### P34. ¿Cómo se garantiza que un envío de contacto no se duplique? — Avanzada
- **Respuesta corta:** Con una restricción única sobre alerta, contacto y tipo, y `ON CONFLICT DO NOTHING`.
- **Respuesta técnica:** `INSERT ... SELECT ... ON CONFLICT (alerta_id, contacto_emergencia_id, tipo_notificacion) DO NOTHING`. Así un reintento de la misma transacción no crea filas repetidas.
- **Evidencia:** `services/internal-api/app/services/alertas.py` (inserción de `envio_alerta`).
- **Repregunta:** ¿Dónde está declarada esa restricción única?
- **Dificultad:** avanzado

### P35. ¿Cómo se protege la ficha médica? — Intermedia
- **Respuesta corta:** Se guarda cifrada con una clave de entorno, `MEDICAL_DATA_KEYS`.
- **Respuesta técnica:** `scripts/cifrar-fichas.cjs` cifra las fichas existentes; NestJS las descifra al enviar el WhatsApp (README §5). No revisé el algoritmo en detalle.
- **Evidencia:** `scripts/cifrar-fichas.cjs`; `README_BDD.md` (CA-11.1); `README.md` §5.
- **Repregunta:** ¿Qué pasa si se pierde `MEDICAL_DATA_KEYS`?
- **Dificultad:** intermedio

### P36. ¿Qué cambios de datos quedan registrados? — Intermedia
- **Respuesta corta:** Los cambios de administración van a `bitacora_sistema`, y los cambios de estado de una alerta a `historial_alerta`.
- **Respuesta técnica:** `auditoria.service.ts` escribe con el tipo de acción, la entidad y el resultado. `historial_alerta` guarda cada transición con su hora.
- **Evidencia:** `apps/backend/src/auditoria/auditoria.service.ts:51`, `:144`; `services/internal-api/app/services/alertas.py:66-70`.
- **Repregunta:** ¿Por qué `aplicacion_ID` tiene por defecto ESCRITORIO en la bitácora?
- **Dificultad:** intermedio

### P37. ¿Qué es `init.sql` frente a las migraciones? — Básica
- **Respuesta corta:** `init.sql` es el esquema completo para una base nueva. Las migraciones son cambios para bases que ya existen.
- **Respuesta técnica:** `init.sql` ya incluye los cambios consolidados del 21 de octubre. Las migraciones se aplican una a una y solo cuando un procedimiento lo indica.
- **Evidencia:** `README_BDD.md`; `migrations/`.
- **Repregunta:** ¿Por qué no se ejecutan todas las migraciones juntas?
- **Dificultad:** básico

---

## Seguridad

### P38. ¿Cómo se autentica un usuario? — Básica
- **Respuesta corta:** Con correo y contraseña, y después recibe un JWT que manda en cada petición.
- **Respuesta técnica:** `POST /usuarios/login` verifica bcrypt y firma el JWT con `sub` y `email`. Los clientes lo mandan como `Authorization: Bearer`.
- **Evidencia:** `apps/backend/src/login/login.service.ts:111-146`.
- **Repregunta:** ¿Dónde guarda el cliente el token?
- **Dificultad:** básico

### P39. ¿Cómo se firma el JWT y qué lo hace válido? — Avanzada
- **Respuesta corta:** Con HS256 y un secreto de al menos 32 bytes; el emisor y la audiencia deben coincidir.
- **Respuesta técnica:** `JwtModule` configura `secret`, `issuer: 'emergen-api'`, `audience: 'emergen-web'` y `expiresIn`. El guard verifica `algorithms: ['HS256']`, emisor y audiencia.
- **Evidencia:** `apps/backend/src/login/login.module.ts:22-40`; `jwt-auth.guard.ts:36-43`.
- **Repregunta:** ¿Qué riesgo tiene HS256 frente a RS256?
- **Dificultad:** avanzado

### P40. ¿Cuánto dura una sesión y cómo se revoca? — Intermedia
- **Respuesta corta:** Por defecto 2 horas. No hay revocación inmediata en la lista, pero cada petición relee el usuario, así que un cambio de estado o rol surte efecto de inmediato.
- **Respuesta técnica:** `JWT_SESSION_HOURS` entre 1 y 168 (`config/session.ts`). `JwtAuthGuard` consulta `buscarActivo`. Un token de un usuario eliminado o inactivo deja de funcionar.
- **Evidencia:** `apps/backend/src/config/session.ts`; `jwt-auth.guard.ts:36-50`.
- **Repregunta:** ¿Qué pasa si un administrador desactiva una cuenta con una sesión abierta?
- **Dificultad:** intermedio

### P41. ¿Cómo se limita el número de intentos de PIN? — Intermedia
- **Respuesta corta:** En el login, 3 fallos bloquean 5 minutos. En el cierre de SOS, 5 fallos bloquean 15 minutos.
- **Respuesta técnica:** Contador en `pin.intentos_fallidos` y marca de tiempo `bloqueado_hasta`, actualizadas con `clock_timestamp()`. Los dos servicios usan políticas distintas.
- **Evidencia:** `apps/backend/src/login/pin-principal.ts:6`, `:30`; `services/internal-api/app/services/alertas.py:86-93`.
- **Repregunta:** ¿Por qué no es la misma política en los dos?
- **Dificultad:** intermedio

### P42. ¿Cómo se guardan las contraseñas? — Básica
- **Respuesta corta:** Con bcrypt; nunca en claro.
- **Respuesta técnica:** `bcrypt.hash` al registrar y `bcrypt.compare` al iniciar sesión. El costo de trabajo está en README_BDD.
- **Evidencia:** `apps/backend/src/login/login.service.ts` (`validarRegistro`, `iniciarSesion`).
- **Repregunta:** ¿Por qué bcrypt y no SHA-256?
- **Dificultad:** básico

### P43. ¿Qué pasa si alguien envía contraseñas muy largas? — Avanzada
- **Respuesta corta:** Se rechaza antes de hacer el hash.
- **Respuesta técnica:** `passwordCabeEnBcrypt` (usado en `iniciarSesion`) evita que bcrypt trunque la contraseña. Así dos contraseñas largas distintas no se consideran iguales.
- **Evidencia:** `apps/backend/src/login/login.service.ts:111-113`.
- **Repregunta:** ¿Cuál es el límite de bcrypt?
- **Dificultad:** avanzado

### P44. ¿Qué datos viajan en el JWT? — Intermedia
- **Respuesta corta:** El id del usuario y su correo, además de los campos estándar.
- **Respuesta técnica:** El JWT no está cifrado; cualquiera que lo lea puede ver el correo. Es una observación de bajo riesgo, pero se debe conocer.
- **Evidencia:** `apps/backend/src/login/login.service.ts:139-141`.
- **Repregunta:** ¿Qué campo quitarías y por qué?
- **Dificultad:** intermedio

### P45. ¿Cómo se protege el envío de mensajes de contacto? — Intermedia
- **Respuesta corta:** Con un límite de 5 envíos por IP cada 15 minutos.
- **Respuesta técnica:** `LimiteVentana` en memoria. Se reinicia al reiniciar el proceso y no se comparte entre instancias.
- **Evidencia:** `services/internal-api/app/api/routes/mensajes_contacto.py:24`, `:30`; `services/internal-api/app/core/limite.py:7`.
- **Repregunta:** ¿Qué pasa si hay dos instancias de FastAPI?
- **Dificultad:** intermedio

### P46. ¿Qué información se expone en `/health/sos`? — Avanzada
- **Respuesta corta:** Un resumen del estado de los servicios necesarios para el SOS. Es público.
- **Respuesta técnica:** No revisé todos los campos. Revela el estado de WhatsApp y de la base. Es un riesgo bajo, pero conviene restringirlo.
- **Evidencia:** `apps/backend/src/health/health.controller.ts:44-49`.
- **Repregunta:** ¿Qué harías para protegerlo sin romper los monitores?
- **Dificultad:** avanzado

---

## Requisitos

### P47. ¿Qué requisitos cubre el sistema? — Básica
- **Respuesta corta:** Los que describe el documento de requisitos (ERS). Este material no lo revisó porque es un archivo `.docx`.
- **Respuesta técnica:** Los criterios de aceptación aparecen con códigos CA en `README_BDD.md` (por ejemplo CA-03.1, CA-05.1, CA-11.1). Úsalos como referencia, y revisa el ERS antes de la defensa.
- **Evidencia:** `README_BDD.md`; `Evidencias de documentación/1.4 Documento ERS/Informe ERS.docx` (no leído).
- **Repregunta:** ¿Qué requisito del ERS no está implementado?
- **Dificultad:** básico

### P48. ¿Qué es la regla de acceso por plataforma y se cumple? — Crítica
- **Respuesta corta:** Según el equipo, administración y soporte solo deben entrar por escritorio. **No se cumple**: el login no distingue plataforma.
- **Respuesta técnica:** `iniciarSesion` no compara el rol con la plataforma y registra siempre `APLICACION.WEB`. En la web solo se ocultan dos rutas al personal, y no hay bloqueo en el móvil.
- **Evidencia:** `apps/backend/src/login/login.service.ts:111`, `:145`; `apps/web/src/App.tsx:135`; `apps/backend/src/auditoria/aplicacion.entity.ts:15-17`.
- **Repregunta:** ¿Cómo lo implementarías?
- **Dificultad:** avanzado

### P49. ¿Qué requisito del SOS dice que no hace falta PIN para emitirlo? — Intermedia
- **Respuesta corta:** Emitir el SOS no pide PIN. Cerrarlo sí.
- **Respuesta técnica:** `crear` valida plan y contactos, no PIN. `cerrar` exige el PIN efectivo. README_BDD lo confirma.
- **Evidencia:** `services/internal-api/app/services/alertas.py:27-64`, `:72-96`; `README_BDD.md`.
- **Repregunta:** ¿Qué pasa si el usuario olvida su PIN?
- **Dificultad:** intermedio

---

## Pruebas

### P50. ¿Qué pruebas existen y cuáles ejecutaste? — Crítica
- **Respuesta corta:** Hay pruebas en NestJS, FastAPI, web, móvil y escritorio. En esta revisión ejecuté solo las 9 de `login-pin.spec.ts` y todas pasaron.
- **Respuesta técnica:** `npm test` en `apps/backend` ejecuta Jest con ESM experimental. Las pruebas de FastAPI necesitan PostgreSQL; no se ejecutaron. Las de frontend tampoco.
- **Evidencia:** `apps/backend/src/login/login-pin.spec.ts`; `services/internal-api/tests/`; `apps/*/src/**/*.test.*`.
- **Repregunta:** ¿Qué pruebas harías para el SOS?
- **Dificultad:** avanzado

### P51. ¿Qué prueba el spec de login? — Intermedia
- **Respuesta corta:** Los perfiles, el PIN de la cuenta principal, el apadrinado completo y parcial, el bloqueo tras tres fallos y que el apadrinado no entra con su correo.
- **Respuesta técnica:** Nueve casos con mocks del repositorio y de la base. No usa base real.
- **Evidencia:** `apps/backend/src/login/login-pin.spec.ts:61-110`.
- **Repregunta:** ¿Qué no prueba?
- **Dificultad:** intermedio

### P52. ¿Cómo se probaría la concurrencia del SOS? — Avanzada
- **Respuesta corta:** Con dos peticiones simultáneas que deben crear una sola alerta activa.
- **Respuesta técnica:** Ya existe `services/internal-api/tests/test_concurrencia.py` que trabaja sobre `delete()` y `test_maximo_y_ultimo_contacto()`. No lo ejecuté; requiere base.
- **Evidencia:** `services/internal-api/tests/test_concurrencia.py:36`, `:46`.
- **Repregunta:** ¿Qué resultado esperas?
- **Dificultad:** avanzado

---

## Calidad del software

### P53. ¿Qué herramientas de calidad usa el proyecto? — Básica
- **Respuesta corta:** ESLint, TypeScript, Prettier, Oxlint y pruebas con Jest y pytest.
- **Respuesta técnica:** Configuración compartida en `packages/eslint-config` y `packages/typescript-config`. Scripts `lint` y `test` en cada `package.json`.
- **Evidencia:** `packages/eslint-config/`; `apps/backend/package.json` (scripts y dependencias).
- **Repregunta:** ¿Por qué un paquete compartido?
- **Dificultad:** básico

---

## Documentación

### P54. ¿Qué documentación técnica existe y cuál es la más útil? — Básica
- **Respuesta corta:** README (puesta en marcha), README_BDD (base y reglas), readme.apis.internas (contrato de APIs) y readme-apis (integraciones).
- **Respuesta técnica:** Los contratos de API coinciden con el código. Cinco documentos citados en `docs/` no existen.
- **Evidencia:** [TRAZABILIDAD_DOCUMENTACION.md](../04_documentacion/TRAZABILIDAD_DOCUMENTACION.md).
- **Repregunta:** ¿Por qué faltan los documentos de `docs/`?
- **Dificultad:** básico

### P55. ¿Qué diferencias hay entre la documentación y el código? — Crítica
- **Respuesta corta:** Hay cinco documentos que faltan, dos políticas de PIN, la regla de plataforma no aplicada y la ventana de 5 horas que no encontré en el código.
- **Respuesta técnica:** Ver la trazabilidad y los puntos críticos. No corregí nada: el encargo lo prohíbe.
- **Evidencia:** [PUNTOS_CRITICOS.md](../10_informes/PUNTOS_CRITICOS.md).
- **Repregunta:** ¿Cuál corregirías primero?
- **Dificultad:** avanzado

---

## Decisiones de diseño

### P56. ¿Por qué no hay una sola base de datos por servicio? — Avanzada
- **Respuesta corta:** Por simplicidad y transacciones: el SOS y las cuentas comparten tablas (`contacto_emergencia`, `plan_usuario`).
- **Respuesta técnica:** Análisis. Con una base por servicio habría que sincronizar datos o usar eventos. El costo es el acoplamiento actual.
- **Evidencia:** `services/alertas.py:39-47` (lee `plan_usuario` y `contacto_emergencia`).
- **Repregunta:** ¿Qué cambiarías si hubiera que separarlas?
- **Dificultad:** avanzado

### P57. ¿Por qué FastAPI valida el JWT contra la base? — Intermedia
- **Respuesta corta:** Para que un cambio de estado o rol surta efecto sin esperar a que caduque el token.
- **Respuesta técnica:** `usuario_actual` ejecuta un `SELECT` por petición. Cuesta una consulta extra por petición, a cambio de revocación inmediata.
- **Evidencia:** `services/internal-api/app/dependencies/auth.py:42-72`.
- **Repregunta:** ¿Cuánto cuesta esa consulta a escala?
- **Dificultad:** intermedio

### P58. ¿Por qué Electron y no una web con acceso restringido? — Intermedia
- **Respuesta corta:** Análisis: el escritorio puede limitarse a la red o al equipo, y no depende de un navegador.
- **Respuesta técnica:** Electron empaqueta la interfaz. Costo: tamaño y actualizaciones. No hay un documento que confirme la decisión.
- **Evidencia:** `apps/desktop/electron/main.cjs`; `apps/desktop/package.json`.
- **Repregunta:** ¿Qué ocurre si el escritorio se abre desde el navegador?
- **Dificultad:** intermedio

---

## Escalabilidad

### P59. ¿Puede escalar el sistema horizontalmente? — Avanzada
- **Respuesta corta:** Las APIs pueden tener varias instancias, pero hay tres puntos que lo impiden hoy: el límite de contacto en memoria, el dispatcher de WhatsApp (una sola sesión de Baileys) y el cierre automático sin coordinación entre instancias.
- **Respuesta técnica:** FastAPI usa `FOR UPDATE SKIP LOCKED` en el cierre automático, así que varias instancias no se pisan. El límite de tasa y la sesión de WhatsApp sí son locales.
- **Evidencia:** `services/internal-api/app/services/alertas.py:98-101`; `core/limite.py`; `whatsapp-connection.service.ts`.
- **Repregunta:** ¿Qué harías con el límite de tasa?
- **Dificultad:** avanzado

### P60. ¿Cuál es el cuello de botella probable? — Avanzada
- **Respuesta corta:** La base de datos, por las transacciones con bloqueos en las alertas y los cupos.
- **Respuesta técnica:** Análisis sin medición. No se hicieron pruebas de carga.
- **Evidencia:** `services/internal-api/app/services/alertas.py`; `README_BDD.md`.
- **Repregunta:** ¿Cómo lo medirías?
- **Dificultad:** avanzado

---

## Mantenibilidad

### P61. ¿Qué pasa si cambias una ruta del backend? — Intermedia
- **Respuesta corta:** Hay que cambiar el cliente en `packages/api-client` y las pantallas que la usan. Si no, falla en tiempo de ejecución.
- **Respuesta técnica:** No hay generación de cliente a partir de OpenAPI. Los tipos de `api-types` ayudan, pero no validan la ruta.
- **Evidencia:** `packages/api-client/src/emergen-api.ts`; `packages/api-types/package.json`.
- **Repregunta:** ¿Cómo evitarías ese error?
- **Dificultad:** intermedio

### P62. ¿Qué pasa si cambias un campo del JWT? — Avanzada
- **Respuesta corta:** Las sesiones actuales dejan de funcionar si el guard espera otro campo.
- **Respuesta técnica:** `JwtAuthGuard` lee `sub`; FastAPI lee `sub` y `email`. Cambiar `sub` rompe ambos.
- **Evidencia:** `apps/backend/src/login/jwt-auth.guard.ts:36-50`; `services/internal-api/app/dependencies/auth.py:42-72`.
- **Repregunta:** ¿Cómo harías una migración sin cerrar sesiones?
- **Dificultad:** avanzado

---

## Limitaciones del sistema

### P63. ¿Cuál es la principal limitación técnica? — Crítica
- **Respuesta corta:** El envío por WhatsApp usa una librería no oficial y depende de una sesión que puede caerse.
- **Respuesta técnica:** Baileys no es API oficial (README §5). El dispatcher reintenta y reconecta, pero si la sesión cae, los avisos quedan pendientes.
- **Evidencia:** `apps/backend/package.json` (`@whiskeysockets/baileys`); `whatsapp-connection.service.ts:271`; README §5.
- **Repregunta:** ¿Qué harías para tener un canal oficial?
- **Dificultad:** avanzado

### P64. ¿Qué limitaciones tiene el sistema que el usuario debe conocer? — Intermedia
- **Respuesta corta:** Depende de internet, del envío por WhatsApp para avisar a contactos, y de que el contacto tenga número válido.
- **Respuesta técnica:** El SOS registra la alerta aunque el envío falle. El estado del envío se muestra en el móvil.
- **Evidencia:** `README.md` §5; `services/alertas.py` (creación sin depender del envío).
- **Repregunta:** ¿Qué pasa si el usuario no tiene red?
- **Dificultad:** intermedio

### P65. ¿Qué no hace el sistema? — Intermedia
- **Respuesta corta:** No atiende conversaciones entrantes de WhatsApp, no llama a servicios de emergencia y no tiene pruebas de carga.
- **Respuesta técnica:** README §5 indica que el módulo no procesa conversaciones entrantes. No hay integración con números de emergencia.
- **Evidencia:** `README.md` §5.
- **Repregunta:** ¿Por qué no llama a un servicio de emergencia oficial?
- **Dificultad:** intermedio

---

## Preguntas incómodas

### P66. ¿Por qué tres rutas no tienen autenticación si el resto sí? — Crítica
- **Respuesta corta:** No tengo una razón documentada. Es un error de implementación que hay que corregir.
- **Respuesta técnica:** Es un análisis de los controladores. Pueden ser rutas heredadas. El nombre de `migrations/001_compras_paypal.sql` sugiere que la integración de PayPal es anterior, pero solo lo deduje del nombre: no revisé su contenido. Lo correcto es protegerlas o retirarlas, y no lo hice porque el encargo lo prohíbe.
- **Evidencia:** [PUNTOS_CRITICOS.md](../10_informes/PUNTOS_CRITICOS.md) (R1).
- **Repregunta:** ¿Cómo se explicaría a un usuario que alguien pudo crear órdenes de PayPal sin cuenta?
- **Dificultad:** avanzado

### P67. ¿Qué parte del código no revisaste? — Crítica
- **Respuesta corta:** Los documentos binarios, los frontends en detalle, los servicios de perfil y apadrinados, y las pruebas de FastAPI.
- **Respuesta técnica:** Ver el informe de cobertura. Esa honestidad es parte de la defensa.
- **Evidencia:** [INFORME_COBERTURA.md](../10_informes/INFORME_COBERTURA.md).
- **Repregunta:** ¿Qué harías para completar la revisión?
- **Dificultad:** avanzado

---

## Resumen de cobertura del banco

| Tema | Preguntas |
|---|---|
| Objetivo | P01–P04 |
| Arquitectura | P05–P09 |
| Frontend | P10–P14 |
| Backend | P15–P20 |
| APIs | P21–P25 |
| Rutas | P26–P30 |
| Base de datos | P31–P37 |
| Seguridad | P38–P46 |
| Requisitos | P47–P49 |
| Pruebas | P50–P52 |
| Calidad | P53 |
| Documentación | P54–P55 |
| Decisiones | P56–P58 |
| Escalabilidad | P59–P60 |
| Mantenibilidad | P61–P62 |
| Limitaciones | P63–P65 |
| Preguntas incómodas | P66–P67 |

Son 67 preguntas, de las cuales 8 están marcadas como críticas.
