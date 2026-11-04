# Resumen rápido (20 minutos)

Escrito para: repaso el día de la defensa.

## Qué es

Plataforma de alertas SOS. El usuario pulsa el SOS desde el móvil; se registra la alerta y sus contactos reciben un aviso por WhatsApp. Hay web, móvil (Android) y un panel de escritorio (Electron) para administrar.

## Cómo está hecho

- **NestJS** (`apps/backend`): cuentas, sesiones, perfiles, apadrinados, compras con PayPal, administración e integraciones.
- **FastAPI** (`services/internal-api`): SOS, tickets y mensajes de contacto.
- **PostgreSQL**: una base para los dos servicios (34 tablas en `init.sql`).
- **JWT** emitido por NestJS y verificado también por FastAPI.

## Cinco cosas que tienes que saber decir

1. **Cómo entra un usuario.** `POST /usuarios/login` → bcrypt → JWT (`login.service.ts:111`, `:139`). Cada petición relee el usuario (`jwt-auth.guard.ts:36`).
2. **Cómo se emite un SOS.** `POST /internal/v1/alertas` con clave de idempotencia; una transacción crea alerta, detalle y un envío por contacto (`services/alertas.py:27`).
3. **Cómo se envía el WhatsApp.** El dispatcher de NestJS lee `envio_alerta` con `FOR UPDATE SKIP LOCKED` (`whatsapp-sos-dispatcher.service.ts:101`).
4. **Cómo se cierra.** Con PIN. Cinco fallos bloquean 15 minutos (`alertas.py:92`). Si nadie cierra, a las 24 horas el sistema lo cierra (`scheduler.py`, cada 30 segundos).
5. **Quién puede qué.** `JwtAuthGuard` para sesión, `RolesGuard` con `@Roles` para administración, `solo_staff` en FastAPI.

## Lo que debes admitir antes de que lo pregunten

- **Tres rutas sin guard:** `POST /reports`, `POST /payments/paypal/orders` y `…/capture`.
- **La regla de acceso por plataforma no está implementada.** Admin y soporte solo deberían entrar por escritorio; hoy entran también por web y móvil.
- **Dos políticas de PIN:** 3 fallos → 5 minutos (login); 5 fallos → 15 minutos (SOS).
- **Faltan cinco documentos de `docs/`** que cita el README.
- **No se ejecutaron** las pruebas de FastAPI, web, móvil ni escritorio. Solo las 9 pruebas de `login-pin.spec.ts`, que pasaron.

## Cifras para recordar

| Dato | Valor | Fuente |
|---|---|---|
| Tablas | 34 | `init.sql` |
| Rutas de API | 82 (64 NestJS, 18 FastAPI); 39 sin mención en la documentación | [MATRIZ_RUTAS.md](../02_rutas/MATRIZ_RUTAS.md) |
| Bloqueo de PIN de login | 3 fallos, 5 minutos | `pin-principal.ts:6`, `:30` |
| Bloqueo de PIN de SOS | 5 fallos, 15 minutos | `alertas.py:92` |
| Cierre automático | a las 24 horas, cada 30 segundos | `scheduler.py`, `config.py:32` |
| Duración de sesión | 2 horas por defecto, máximo 168 | `config/session.ts` |
| Límite de cuerpo en FastAPI | 16 KB | `config.py:41` |
| Límite de contacto público | 5 por IP cada 15 minutos | `mensajes_contacto.py:24` |
| Puertos | BD 5433, NestJS 3001, FastAPI 8000 | `docker-compose.yml` |

## Preguntas que más probablemente te harán

1. ¿Por qué dos servicios y no uno? → Análisis: separar el SOS del resto y poder escalarlo; costo: dos servicios y acoplamiento por base.
2. ¿Por qué JWT y no sesiones? → Análisis: sin consulta de sesión en cada petición; costo: el token sigue válido hasta caducar, aunque se relee el usuario.
3. ¿Qué pasa si se cae FastAPI? → No hay SOS ni tickets; NestJS sigue funcionando.
4. ¿Qué pasa si se cae NestJS? → No hay login, compras ni WhatsApp; FastAPI sigue validando sesiones con la base.
5. ¿Por qué `FOR UPDATE`? → Evita que dos peticiones cierren o creen la misma alerta a la vez.

## Antes de entrar a la sala

- Relee [PUNTOS_CRITICOS.md](../10_informes/PUNTOS_CRITICOS.md).
- Abre `login.service.ts` en la línea 111 y `services/alertas.py` en la línea 27: son las dos piezas que más te van a preguntar.
- Recuerda que todas las rutas de archivo son relativas a `Evidencias de sistema Aplicación/`.
