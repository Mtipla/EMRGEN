# Guía completa de defensa: EMERGEN

Escrito para: estudiante que defiende el proyecto ante una comisión de informática.

Cada afirmación importante lleva su referencia a archivo y línea. Donde no pude comprobar algo, lo digo. Los detalles de cada tema están en los documentos enlazados.

- Concepto sencillo: frase para recordarlo.
- Concepto técnico: lo que debes decir ante la comisión.

---

## Capítulo 1: Introducción

**Objetivo.** EMERGEN es una plataforma para enviar alertas de emergencia (SOS). Un usuario pulsa el SOS desde el móvil; el sistema registra la alerta y avisa a sus contactos por WhatsApp. Cuenta con web, móvil y un panel de escritorio para administrar (`README.md` de la aplicación, introducción).

**Problema que busca resolver.** Dar aviso rápido y verificable a personas de confianza en una emergencia, sin depender de que el usuario pueda escribir un mensaje.

- *Sencillo:* pulsas un botón y tus contactos reciben un aviso con tu ubicación.
- *Técnico:* registro transaccional de la alerta con idempotencia, cola de envíos con bloqueo de filas y cierre protegido por PIN.

**Usuarios.**

| Usuario | Cómo entra | Qué hace |
|---|---|---|
| Usuario (rol 3) | Correo y contraseña | Compra planes, gestiona contactos, emite SOS desde el móvil |
| Apadrinado | Desde la cuenta principal, con su PIN | Usa el plan del principal; SOS según su tipo de acceso |
| Administrador (rol 1) | Cuenta de personal | Administra cuentas, planes, ventas, alertas, tickets y auditoría |
| Soporte (rol 2) | Cuenta de personal | Responde tickets y mensajes con permisos reducidos |

Fuente de roles y estados: `README_BDD.md` (estados 1 completo y 2 parcial) y las constantes `ROL_ADMINISTRADOR = 1` y `ROL_SOPORTE = 2` en `services/internal-api/app/dependencies/auth.py`.

**Funcionalidades generales.** Registro e inicio de sesión (F1, F2); perfil y contactos (F3); apadrinados (F4); compra de planes con PayPal (F5); SOS y WhatsApp (F6, F6b); tickets y mensajes de contacto (F7, F8); administración y auditoría (F9, F10); integraciones (F11); mantenimiento (F12). Detalle en [FUNCIONALIDADES.md](../03_funcionalidades/FUNCIONALIDADES.md).

---

## Capítulo 2: Arquitectura

Resumen (detalle en [ARQUITECTURA.md](../01_arquitectura/ARQUITECTURA.md)):

- **Cuatro aplicaciones de interfaz:** web (`apps/web`), móvil (`apps/mobile`, Capacitor/Android), escritorio (`apps/desktop`, Electron) y paquetes compartidos (`packages/`).
- **Dos servidores:** NestJS (`apps/backend`) para cuentas, compras, administración e integraciones; FastAPI (`services/internal-api`) para SOS y tickets.
- **Una base de datos:** PostgreSQL. Ambos servidores la usan directamente.
- **Autenticación única:** NestJS emite un JWT HS256; FastAPI lo verifica con el mismo secreto.
- **Integraciones externas:** PayPal, Firebase, jsReport, Google Maps, mindicador y WhatsApp (Baileys).

**Comunicación.** Los frontends llaman a ambas APIs con `Authorization: Bearer`. FastAPI y NestJS no se llaman entre sí; se comunican a través de la base, en la tabla `envio_alerta`.

**Concepto clave para la defensa.** La comunicación por base compartida es simple y transaccional, pero acopla los servicios: un cambio de esquema afecta a ambos.

---

## Capítulo 3: Estructura del código

### 3.1 Organización de carpetas

```
Evidencias de sistema Aplicación/
├── apps/
│   ├── backend/         NestJS 12: login, perfil, apadrinados, compras, admin, auditoría, integraciones
│   ├── web/             Sitio público y área de cuenta (Ionic React + Vite)
│   ├── mobile/          Móvil (Ionic React + Capacitor)
│   └── desktop/         Panel administrativo (React + Electron)
├── packages/
│   ├── api-client/      Cliente HTTP compartido (emergen-api.ts, http.ts)
│   ├── api-types/       Tipos compartidos de solicitudes y respuestas
│   ├── ui/              Componentes React compartidos
│   ├── eslint-config/   Configuración de ESLint
│   └── typescript-config/
├── services/internal-api/   FastAPI: SOS, tickets, mensajes de contacto
├── scripts/             Carga de datos de desarrollo, verificaciones de BD, cifrado de fichas
├── migrations/          Cambios posteriores al init.sql (aplicar uno a uno)
├── init.sql             Esquema y catálogos (34 tablas)
├── docker-compose.yml   PostgreSQL, NestJS y FastAPI
├── package.json         Workspaces y scripts
├── turbo.json           Pipeline de build
└── README.md            Guía de puesta en marcha
```

Fuente: `README.md` §2 y el listado real de archivos.

### 3.2 Puntos de entrada

| Parte | Archivo | Línea clave |
|---|---|---|
| NestJS | `apps/backend/src/main.ts` | `bootstrap` (`:12`), `ValidationPipe` (`:28-34`) |
| FastAPI | `services/internal-api/app/main.py` | `RequestBounds` (`:26`), `include_router` (`:31`) |
| Web | `apps/web/src/main.tsx` | `createRoot` con `BrowserRouter` |
| Móvil | `apps/mobile/src/main.tsx` | Igual |
| Escritorio | `apps/desktop/electron/main.cjs` y `apps/desktop/src/main.tsx` | Proceso de Electron y React |

### 3.3 Dependencias relevantes

- **NestJS:** `@nestjs/core` 12.0.4, `@nestjs/jwt`, `@nestjs/typeorm`, `typeorm`, `pg`, `bcrypt`, `jsonwebtoken`, `class-validator`, `@whiskeysockets/baileys`, `@paypal/checkout-server-sdk`, `jwks-rsa`.
- **FastAPI:** `fastapi`, `psycopg`, `PyJWT`, `pytest` y `httpx` para pruebas (`services/internal-api/requirements.txt`).
- **Frontends:** `@ionic/react`, `react-router-dom`, `axios`, `@repo/api-client`, `@repo/ui`; móvil añade `@capacitor/*`.

### 3.4 Archivos de configuración

`.env` (secretos, no leído), `example.env` (plantilla), `.env.docker`, `docker-compose.yml`, `docker-compose.production.yml`, `deploy/production.env.example`, `turbo.json`, `.npmrc`, `.nvmrc`.

---

## Capítulo 4: Rutas

El detalle, con 82 rutas de API (64 en NestJS y 18 en FastAPI) y su estado, está en [MATRIZ_RUTAS.md](../02_rutas/MATRIZ_RUTAS.md). Resumen:

- **NestJS:** prefijo raíz; sin prefijo global (`apps/backend/src/main.ts`). Rutas de login (`/usuarios/*`), perfil y apadrinados (`/usuarios/me/*`), compras (`/compras/*`), administración (`/admin/*`), salud (`/health/*`) e integraciones (`/auth/me`, `/maps/*`, `/indicators*`, `/reports`, `/payments/paypal/*`, `/notifications/whatsapp/*`).
- **FastAPI:** prefijo `/internal/v1`. SOS (`/alertas`), tickets (`/tickets-soporte`) y contacto (`/mensajes-contacto`).
- **Frontends:** rutas de navegación en `apps/web/src/App.tsx:162-218`, `apps/mobile/src/App.tsx:70-105`, `apps/desktop/src/admin/PanelAdmin.tsx:167-183`.

**Permisos.** Tres niveles: pública, autenticada (`JwtAuthGuard`) y de rol (`RolesGuard` con `@Roles`). En FastAPI: `usuario_actual` y `solo_staff`.

**Matices verificados.**
- `@Roles` a nivel de método prevalece sobre el de la clase: en `admin.controller.ts:21` y `:45` el soporte puede listar usuarios aunque la clase solo permita al administrador.
- Tres rutas no tienen guard: `POST /reports`, `POST /payments/paypal/orders` y `POST /payments/paypal/orders/:orderId/capture`. Están activas porque sus módulos se importan en `app.module.ts:75` y `:80`. Ningún frontend las llama. Ver Capítulo 7.
- La ruta pública `POST /internal/v1/mensajes-contacto` tiene límite de 5 envíos por IP cada 15 minutos (`mensajes_contacto.py:24`, `:30`).

---

## Capítulo 5: Funcionalidades

Detalle de cada una en [FUNCIONALIDADES.md](../03_funcionalidades/FUNCIONALIDADES.md). Los dos flujos más importantes:

### 5.1 Inicio de sesión (con perfiles)

1. `POST /usuarios/login` → `LoginController.login` (`login.controller.ts:51`).
2. `LoginService.iniciarSesion` (`login.service.ts:111`): valida longitud de contraseña, busca por correo, compara con bcrypt. Si no existe, compara contra un hash ficticio.
3. Si la cuenta es apadrinado, rechaza (403). Si es usuario con PIN, `elegirPerfil` (`:151`) pide el perfil y el PIN.
4. `jwtService.signAsync({ sub, email })` (`:139`) firma el JWT. Duración por `JWT_SESSION_HOURS` (por defecto 2 horas; `apps/backend/src/config/session.ts`).
5. Registra el acceso en `acceso_aplicacion` (`:145`) como `WEB`.

Cada petición siguiente pasa por `JwtAuthGuard` (`jwt-auth.guard.ts:25`), que verifica el token (`:36`) y **vuelve a leer el usuario en la base**. Así, un cambio de rol o de estado surte efecto sin esperar a que caduque el token.

### 5.2 SOS

1. El móvil llama a `POST /internal/v1/alertas` con `clave_idempotencia`.
2. `alertas.crear` (`services/alertas.py:27`) bloquea la fila del usuario, comprueba la idempotencia, cierra alertas de más de 24 horas, valida plan, contactos y alertas activas, y crea las filas en una transacción. Incluye una fila de `envio_alerta` por contacto.
3. El dispatcher de NestJS (`whatsapp-sos-dispatcher.service.ts:47`) toma las filas pendientes con `FOR UPDATE SKIP LOCKED` (`:101`) y envía por WhatsApp.
4. El cierre (`POST /internal/v1/alertas/{id}/cerrar`) exige el PIN efectivo. Cinco fallos bloquean 15 minutos (`alertas.py:92`).
5. Si nadie cierra la alerta, el bucle de `core/scheduler.py` la finaliza a las 24 horas, cada 30 segundos.

---

## Capítulo 6: Base de datos

Fuente: `init.sql` (34 tablas, desde la línea 66). Migraciones: `migrations/`.

### 6.1 Grupos de tablas

| Grupo | Tablas | Para qué |
|---|---|---|
| Identidad | `usuario`, `rol`, `estado_usuario`, `pin`, `acceso_aplicacion`, `aplicacion` | Cuentas, roles, PIN, plataforma de acceso |
| Contactos y ficha | `contacto_emergencia`, `antecedente_medico`, `enlace_medico`, `usuario_mensaje_personalizado` | Contactos del SOS y datos médicos (cifrados, README_BDD) |
| Alertas | `alerta`, `detalle_alerta`, `ubicacion_alerta`, `historial_alerta`, `envio_alerta`, `estado_envio`, `notificacion_movil`, `prioridad` | Ciclo de vida del SOS y cola de envíos |
| Comercio | `venta`, `detalle_venta`, `metodo_pago`, `estado_pago`, `plan`, `plan_usuario`, `reserva_cupos` | Planes, cupos y pagos |
| Soporte | `soporte`, `ticket_soporte`, `categoria_soporte`, `estado_ticket` | Tickets |
| Contacto público | `mensaje_contacto`, `respuesta_contacto`, `tipo_contacto`, `estado_contacto` | Formulario del sitio |
| Auditoría | `bitacora_sistema` | Cambios de administración |

### 6.2 Relaciones y consultas

- La alerta referencia a `detalle_alerta`, `ubicacion_alerta` (opcional), `prioridad` y `usuario`. Cada cambio de estado se registra en `historial_alerta`.
- `envio_alerta` referencia a `alerta` y a `contacto_emergencia`, con una restricción única `(alerta, contacto, tipo)` que usa `ON CONFLICT DO NOTHING` (`services/alertas.py`).
- FastAPI usa SQL escrito a mano con `psycopg`: `FOR UPDATE` para bloquear, `clock_timestamp()` para tiempos reales y `SKIP LOCKED` para que dos procesos no tomen la misma fila.
- NestJS usa TypeORM y SQL crudo con `transaction(...)` (`apps/backend/src/config/transaction.ts`).

### 6.3 Integridad y persistencia

- **Esquema:** `init.sql` solo se ejecuta cuando el volumen de Docker está vacío (README_BDD). No cambia una base existente.
- **Cambios posteriores:** en `migrations/`, aplicados uno a uno. README_BDD advierte no ejecutar los `001` a `006` en bloque.
- **TypeORM:** `synchronize: false` (README_BDD). El código no altera el esquema por sí mismo.
- **Cupos:** la reserva se guarda antes de llamar a PayPal, y una captura confirmada concede los cupos una sola vez (README_BDD).
- **Datos sensibles:** la ficha médica se cifra con `MEDICAL_DATA_KEYS` (`scripts/cifrar-fichas.cjs`, README_BDD CA-11.1).

No revisé línea a línea todas las restricciones `CHECK` y `FOREIGN KEY` de `init.sql`. Si la comisión pregunta por una restricción concreta, hay que abrir el archivo.

---

## Capítulo 7: Seguridad

### 7.1 Autenticación

| Mecanismo | Dónde | Detalle |
|---|---|---|
| Contraseña con bcrypt | `login.service.ts` | Costo indicado en README_BDD; comparación con hash ficticio si el correo no existe |
| JWT HS256 | `login.module.ts:22-40` | Secreto de al menos 32 bytes; emisor `emergen-api`; audiencia `emergen-web` |
| Duración de la sesión | `apps/backend/src/config/session.ts` | 1 a 168 horas; por defecto 2 |
| Relectura del usuario | `jwt-auth.guard.ts:25-50` | Cada petición consulta el estado actual |
| Verificación de correo | Firebase (`FirebaseAuthGuard`) | Solo en el registro |
| PIN de perfil | `pin-principal.ts` | 3 fallos, 5 minutos de bloqueo |
| PIN de cierre de SOS | `services/alertas.py:92` | 5 fallos, 15 minutos de bloqueo |

### 7.2 Autorización

- **Guards de NestJS:** `JwtAuthGuard` verifica la sesión; `RolesGuard` compara con `@Roles`.
- **Estado de usuario:** un apadrinado o cuenta parcial (estado 2) no puede editar perfil ni cambiar contraseña (`login.service.ts`, `actualizarPropio` y `cambiarPassword`).
- **Personal:** solo puede modificar sus campos autorizados (`login.service.ts:244-252`).
- **FastAPI:** `usuario_actual` y `solo_staff` (`dependencies/auth.py`). Un usuario sin ser staff solo ve sus alertas (`api/routes/alertas.py:40`: `filtro = usuario_id if usuario.es_staff else usuario.id`).
- **Plataforma:** la regla de negocio de acceso por plataforma **no está implementada** (ver Capítulo 10 y [PUNTOS_CRITICOS.md](../10_informes/PUNTOS_CRITICOS.md)).

### 7.3 Validaciones

- NestJS: `ValidationPipe` con `whitelist`, `forbidNonWhitelisted` y `transform` (`main.ts:28-34`). Rechaza campos no declarados en el DTO.
- DTOs de compra: `create-paypal-order.dto.ts` valida el monto con expresión regular.
- FastAPI: esquemas Pydantic y límite de cuerpo de 16 KB (`core/config.py:41`).
- Pruebas de regla de negocio: `login-pin.spec.ts`, 9 de 9 pasaron en esta sesión.

### 7.4 Protección de la información

- Secretos en `.env` (no versionado; `.gitignore`).
- Los README no incluyen contraseñas de producción; las de desarrollo son de cuentas de prueba.
- La sesión de WhatsApp (`auth_info_baileys/`) está excluida del repositorio (`.gitignore`).
- La bitácora registra cambios de administración (`auditoria.service.ts`).
- La respuesta de `POST /usuarios/registro/validar` revela si un correo ya existe (ver riesgos).

### 7.5 Riesgos identificados

| # | Riesgo | Evidencia | Gravedad (estimada) |
|---|---|---|---|
| R1 | Tres rutas sin autenticación | `jsreport.controller.ts:16`; `paypal.controller.ts:22` y `:27` | Alta |
| R2 | La regla de acceso por plataforma no se aplica en el login | `login.service.ts:111`, `:145` | Media (regla de negocio) |
| R3 | Dos políticas de PIN distintas | `pin-principal.ts:6`; `alertas.py:92` | Baja |
| R4 | La respuesta de registro revela si un correo existe | `login.service.ts` (`validarRegistro`) | Media |
| R5 | El JWT incluye el correo en el payload (legible por el cliente, no cifrado) | `login.service.ts:139-141` | Baja |
| R6 | El límite de tasa de contacto está en memoria y se reinicia con el proceso | `core/limite.py`; `mensajes_contacto.py:24` | Baja |
| R7 | `/health/sos` es público y revela estado interno | `health.controller.ts:44` | Baja |
| R8 | La ventana de 5 horas de compras no se encontró en el código | `README_BDD.md` | Pendiente de verificar |

La gravedad es un criterio de análisis, no una medición.

---

## Capítulo 8: Documentación

Detalle en [TRAZABILIDAD_DOCUMENTACION.md](../04_documentacion/TRAZABILIDAD_DOCUMENTACION.md).

- **Documentos fuertes:** `readme.apis.internas.md` y `readme-apis.md` describen rutas que existen. `README_BDD.md` describe reglas que coinciden con el código (SOS, PIN, cupos, cierre automático).
- **Documentos faltantes:** cinco archivos en `docs/` que el README cita y no existen.
- **Diferencias:** dos políticas de PIN; la regla de plataforma no implementada; la ventana de 5 horas no localizada.
- **Documentos no revisados:** los `.docx`, `.xlsx`, `.drawio` y `.png` de `Evidencias de documentación/`. Antes de la defensa hay que leer el ERS, el plan de pruebas y el diccionario de datos.

---

## Capítulo 9: Decisiones técnicas

Las ventajas y desventajas son análisis propio. No encontré actas que justifiquen cada elección.

| Decisión | Ventajas | Desventajas | Alternativa |
|---|---|---|---|
| NestJS para la API principal | Módulos, guards, pipes y DI; estructura clara | Más ceremonia que un framework minimalista | Express plano, Fastify |
| FastAPI para SOS | Rápido de escribir, validación Pydantic | Dos lenguajes y dos servidores que mantener | Un solo servicio NestJS |
| Base compartida entre servicios | Transacciones simples y consistencia fuerte | Acoplamiento por esquema | API interna entre servicios o cola de mensajes |
| JWT HS256 con secreto compartido | Simple, sin consulta de sesión en cada petición | El secreto debe estar en dos servicios; sin revocación inmediata (se relee el usuario, pero el token sigue válido) | JWT con clave pública (RS256) o sesiones en base |
| Baileys para WhatsApp | Sin costo de API oficial | No es oficial; puede dejar de funcionar | API oficial de WhatsApp Business |
| Electron para el escritorio | Reutiliza React | Peso de la aplicación | Aplicación web con acceso restringido |
| Idempotencia en SOS | Un reintento no duplica alertas | Requiere que el cliente envíe la clave | Sin idempotencia |
| Cola en tabla con `SKIP LOCKED` | Sin infraestructura extra | Se consulta con sondeo cada pocos segundos | Redis, RabbitMQ, SQS |
| `synchronize: false` | El esquema no cambia en silencio | Cada cambio requiere migración manual | Migraciones automáticas de TypeORM |

### Limitaciones del proyecto

- Ninguna prueba de FastAPI, web, móvil o escritorio se ejecutó en esta revisión.
- Baileys no es una API oficial de WhatsApp (README §5).
- Límite de tasa en memoria.
- Dos servicios que comparten base y secreto.
- Documentación citada que falta.

---

## Capítulo 10: Preparación para defensa

- Preguntas, respuestas y evidencias: [PREGUNTAS_DEFENSA.md](../08_preguntas_defensa/PREGUNTAS_DEFENSA.md) (67 preguntas).
- Práctica interactiva: [SIMULADOR_DEFENSA.md](../08_preguntas_defensa/SIMULADOR_DEFENSA.md).
- Glosario: [GLOSARIO_TECNICO.md](GLOSARIO_TECNICO.md).

### 10.1 Conceptos que debes dominar

JWT y su firma · bcrypt y el hash ficticio · guard frente a pipe frente a middleware · `@Roles` a nivel de método frente a clase · transacción y `FOR UPDATE` · `SKIP LOCKED` · idempotencia · cola en tabla · acoplamiento por base · `synchronize: false` · CORS.

### 10.2 Errores frecuentes al explicar el código

1. **Decir que "todo está protegido".** Hay tres rutas sin guard. Reconócelo antes de que lo encuentre la comisión.
2. **Confundir el bloqueo de 5 minutos del login con el de 15 minutos del SOS.** Son políticas distintas en servicios distintos.
3. **Decir que la regla de plataforma está implementada.** No lo está en el login.
4. **Afirmar que los documentos de `docs/` existen.** No están en el repositorio.
5. **Afirmar que algo funciona porque tiene una ruta.** Hay que distinguir código, prueba y ejecución.
6. **Describir un historial de decisiones del equipo.** No hay actas que lo confirmen; presenta el análisis como análisis.

---

## Capítulo 11: Conclusiones

### 11.1 Puntos fuertes

- Arquitectura con responsabilidades separadas (cuentas y compras frente a SOS y tickets).
- Reglas de negocio críticas bien identificadas: idempotencia, bloqueo de PIN, cierre automático, revalidación del usuario en cada petición.
- Pruebas unitarias del flujo de perfiles y PIN (9 de 9 pasaron).
- Contratos de API documentados que coinciden con el código.
- Bitácora de auditoría y control de roles en administración.

### 11.2 Debilidades verificadas

- Tres rutas sin autenticación (R1).
- Regla de acceso por plataforma sin implementar (R2).
- Dos políticas de PIN (R3).
- Enumeración de correos en el registro (R4).
- Cinco documentos citados que no existen.

### 11.3 Posibles mejoras

1. Añadir `@UseGuards` a `POST /reports` y a las rutas de PayPal, o retirarlas si no se usan.
2. Implementar la regla de plataforma en `iniciarSesion` (comparar rol con `APLICACION.*`).
3. Unificar la política de PIN o documentar la diferencia.
4. Responder al registro con un mensaje genérico.
5. Sacar el límite de tasa a un almacén compartido si hay varias instancias.
6. Restaurar la carpeta `docs/` o corregir las referencias del README.

### 11.4 Trabajo futuro

- Ejecutar y documentar las pruebas de FastAPI, web, móvil y escritorio.
- Leer y contrastar los documentos binarios (ERS, plan de pruebas, diagramas).
- Revisar las restricciones de `init.sql`.
- Evaluar una API oficial de WhatsApp.

> **Nota sobre las mejoras:** son recomendaciones de análisis. No se modificó ningún archivo del proyecto (restricción del encargo).
