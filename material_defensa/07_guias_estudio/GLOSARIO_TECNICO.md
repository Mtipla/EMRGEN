# Glosario técnico de EMERGEN

Escrito para: consulta rápida de términos. Cada definición incluye un ejemplo del proyecto.

| Término | Sencillo | Técnico | Ejemplo en el proyecto |
|---|---|---|---|
| **SOS / alerta** | Botón de emergencia | Registro transaccional con estado ACTIVA o FINALIZADA | `services/internal-api/app/services/alertas.py:27` (`crear`) |
| **Monorepo** | Un solo repositorio para varias aplicaciones | Varios paquetes gestionados por npm workspaces | `package.json` (raíz) |
| **Turborepo** | Herramienta que ejecuta tareas en paralelo entre paquetes | Pipeline de build con caché | `turbo.json` |
| **Ionic** | Componentes de interfaz tipo móvil | Biblioteca de componentes sobre React | `apps/web/package.json` |
| **Capacitor** | Puente entre la web y el móvil | Empaqueta una app web como APK | `apps/mobile/package.json` (`@capacitor/android`) |
| **Electron** | Aplicación de escritorio con tecnologías web | Chromium + Node en un proceso | `apps/desktop/electron/main.cjs` |
| **NestJS** | Framework de servidor con módulos | Aplicación modular con DI, guards y pipes | `apps/backend/src/main.ts` |
| **FastAPI** | Framework de Python para APIs | Rutas con tipos, validación Pydantic y OpenAPI | `services/internal-api/app/main.py` |
| **Guard** | Portero de una ruta | Clase `CanActivate` que permite o rechaza antes del controlador | `apps/backend/src/login/jwt-auth.guard.ts:25` |
| **Pipe** | Filtro que valida o transforma la entrada | Transformación y validación de parámetros | `ValidationPipe` en `main.ts:28-34` |
| **DTO** | Forma de los datos que entran | Clase con reglas de validación | `apps/backend/src/integrations/paypal/dto/create-paypal-order.dto.ts` |
| **Middleware** | Código que se ejecuta antes de la ruta | Función sobre la petición HTTP | `RequestBounds` en `services/internal-api/app/main.py:26` |
| **JWT** | Sello firmado que identifica al usuario | Token con cabecera, carga y firma (HS256 aquí) | `apps/backend/src/login/login.service.ts:139` |
| **Claim `sub`** | "A quién pertenece el token" | Identificador del sujeto en el JWT | `sub: sesion.usuario_ID` |
| **Issuer / audience** | "Quién lo emite" y "para quién" | Campos `iss` y `aud` que se verifican | `emergen-api` y `emergen-web` (`login.module.ts`) |
| **bcrypt** | Forma segura de guardar contraseñas | Hash lento con sal, con costo configurable | `bcrypt.hash` en `login.service.ts` |
| **Hash ficticio** | Truco para no revelar si un correo existe | Comparación en tiempo constante aunque el usuario no exista | `HASH_FICTICIO` en `login.service.ts` |
| **RBAC** | Permisos según el rol | Control de acceso por rol | `@Roles(ROL.ADMINISTRADOR)` en `admin.controller.ts:16` |
| **Idempotencia** | Repetir una acción no la duplica | Clave única por solicitud y huella del cuerpo | `clave_idempotencia` en `services/alertas.py:27-37` |
| **Transacción** | Todo o nada | Conjunto de escrituras que se confirman juntas | `transaction(db, ...)` en `api/routes/alertas.py` (`crear_alerta`) |
| **FOR UPDATE** | Bloquea la fila para que nadie más la cambie | Bloqueo pesimista de fila | `services/alertas.py:28` |
| **SKIP LOCKED** | Saltar las filas bloqueadas por otro proceso | Permite que varios trabajadores tomen tareas distintas | `whatsapp-sos-dispatcher.service.ts:101` |
| **clock_timestamp()** | Hora real del momento | Hora de reloj, no la de inicio de la transacción | `services/alertas.py:39` |
| **ON CONFLICT DO NOTHING** | Si ya existe, no hacer nada | Inserción idempotente | `envio_alerta` en `services/alertas.py` |
| **Cola en tabla** | Lista de trabajos pendientes en la base | Filas con estado que un proceso consume | `envio_alerta` y el dispatcher |
| **Baileys** | Librería para conectar con WhatsApp Web | Cliente no oficial de WhatsApp | `apps/backend/package.json` |
| **jsReport** | Generador de informes | Servicio externo que renderiza plantillas en PDF o Excel | `integrations/jsreport/` |
| **Firebase Auth** | Servicio de autenticación de Google | Verificación de correo y tokens de identidad | `FirebaseAuthGuard` |
| **CORS** | Permiso para que otro origen llame a la API | Cabeceras que indican qué orígenes pueden llamar | `CORS_ORIGINS` en `main.ts:9-10` |
| **Middleware de límite de cuerpo** | Rechaza mensajes demasiado grandes | Limita bytes de la petición | `max_body_bytes` (16 KB) en `core/config.py:41` |
| **Límite de tasa** | Frena a quien envía muchas peticiones | Ventana deslizante por clave (aquí, por IP) | `LimiteVentana` en `core/limite.py:7` |
| **Migración** | Cambio controlado del esquema | Script SQL aplicado una vez | `migrations/003_contacto_unico.sql` |
| **`synchronize: false`** | TypeORM no cambia la base solo | El esquema lo controla el SQL, no el ORM | README_BDD |
| **Volumen de Docker** | Carpeta persistente de la base | Almacenamiento que sobrevive a los contenedores | `init.sql` solo corre con volumen vacío |
| **Apadrinado** | Persona que usa el plan de otra | Usuario sin correo propio, vinculado a una cuenta principal | `usuario_principal_ID` en `usuario` |
| **Estado parcial** | Acceso limitado | Estado 2 de `estado_usuario`; no puede editar ni cambiar contraseña | README_BDD |
| **Cupo** | Plazas de apadrinados que se pueden crear | Capacidad adquirida en `plan_usuario` | README_BDD |
| **Reserva de cupos** | Apartar cupos antes de pagar | Fila que se confirma tras la captura | `reserva_cupos` en `init.sql` |
| **Bitácora** | Registro de cambios de administración | Tabla de auditoría con acción, entidad y resultado | `bitacora_sistema`, `auditoria.service.ts` |
| **Health check** | Preguntar si el servicio vive | Endpoint de estado para Docker o un monitor | `GET /health/ready` (`api/health.py:9`) |
| **Contrato de API** | Lista de rutas y formas de datos | Documento que describe la interfaz entre cliente y servidor | `readme.apis.internas.md` |
