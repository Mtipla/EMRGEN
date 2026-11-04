# Puntos críticos

Escrito para: estudiante que debe saber qué puede salir mal en la defensa, antes de que salga.

Cada punto indica si está **verificado en código**, **verificado por ejecución** o **pendiente**. No corregí nada: el encargo prohíbe modificar código y documentación.

## Seguridad

### PC-01. Tres rutas sin guard de autenticación — Gravedad alta — Verificado en código

| Ruta | Declaración | Por qué importa |
|---|---|---|
| `POST /reports` | `apps/backend/src/integrations/jsreport/jsreport.controller.ts:11-16` | Cualquiera puede renderizar una plantilla de jsReport con datos propios y recibir el archivo. El módulo está en `app.module.ts:80` |
| `POST /payments/paypal/orders` | `apps/backend/src/integrations/paypal/paypal.controller.ts:18-22` | Cualquiera puede crear órdenes de PayPal con el monto que quiera (validado solo en formato). El módulo está en `app.module.ts:75` |
| `POST /payments/paypal/orders/:orderId/capture` | `paypal.controller.ts:27` | Cualquiera que conozca un ID de orden intenta capturarla. `paypal.service.ts` no asocia la orden a un usuario |

**Qué se sabe:** ningún frontend llama a estas rutas (búsqueda de `/reports` y `/payments/paypal` en `apps/*/src` y `packages/*/src`). Por eso parecen rutas heredadas o de prueba.

**Qué no se sabe:** si el servicio de PayPal valida algo en la captura que no vi. No revisé el cuerpo completo de `paypal.service.ts` más allá de sus firmas.

**Acción recomendada (no ejecutada):** añadir `@UseGuards(JwtAuthGuard)` o retirar las rutas si no se usan. Antes de decidir, confirmar con el equipo si alguna integración externa las llama.

### PC-02. La regla de acceso por plataforma no está implementada — Gravedad media — Verificado en código

La regla está registrada en la memoria de trabajo del responsable como confirmada el 29 de octubre de 2026. Dice que administración y soporte solo entran por escritorio, y que web y móvil deben rechazar su entrada.

- `iniciarSesion` (`apps/backend/src/login/login.service.ts:111`) no compara rol con plataforma.
- Registra siempre `APLICACION.WEB` (`login.service.ts:145`). El login no sabe desde qué aplicación llega la petición.
- En la web solo se ocultan `/cuentas` y `/soporte` al personal (`apps/web/src/App.tsx:135`, `:214-215`). Administración puede entrar y ver `/inicio` y `/perfil`.
- En el móvil no encontré ningún control por rol (búsqueda de `ADMINISTRADOR`, `SOPORTE`, `rol` en `apps/mobile/src`).
- `init.sql` define `WEB`, `MOVIL` y `ESCRITORIO` en la tabla `aplicacion` (línea 536), pero el código solo escribe `WEB` y, por defecto en la bitácora, `ESCRITORIO`.

**Cómo defenderlo:** es una regla de negocio que no está aplicada. Reconocerlo es mejor que negarlo. La solución es comparar el rol con la plataforma en el login, y enviar la plataforma en la petición.

### PC-03. Dos políticas distintas de bloqueo de PIN — Gravedad baja — Verificado en código y prueba

| Servicio | Intentos | Bloqueo | Evidencia |
|---|---|---|---|
| NestJS, PIN de perfil al iniciar sesión | 3 | 5 minutos | `pin-principal.ts:6`, `:30`. Prueba "el tercer fallo bloquea 5 minutos" en `login-pin.spec.ts` (pasó) |
| FastAPI, PIN para cerrar un SOS | 5 | 15 minutos | `services/internal-api/app/services/alertas.py:92` |

El README solo menciona la de 15 minutos. La comisión puede preguntar por qué son distintas.

### PC-04. El registro revela si un correo ya está en uso — Gravedad media — Verificado en código

`validarRegistro` (`login.service.ts:58-64`) devuelve un error de conflicto cuando el correo existe. Quien llama a `POST /usuarios/registro/validar` (sin guard) puede averiguar qué correos tienen cuenta.

Hay un mecanismo similar en `crear` (`login.service.ts:78`). Mitigación posible: respuesta genérica en el registro, con verificación por correo.

### PC-05. El JWT contiene el correo sin cifrar — Gravedad baja — Verificado en código

`signAsync({ sub, email })` (`login.service.ts:139-141`). El token está firmado, no cifrado: cualquiera que lo tenga puede leer el correo. Es un dato que el propio usuario ya conoce, pero conviene saberlo.

### PC-06. `/health/sos` es público y revela estado interno — Gravedad baja — Verificado en código

`apps/backend/src/health/health.controller.ts:44`. Devuelve 503 con el detalle del estado de la base y de WhatsApp si el SOS no está listo. Útil para monitoreo, pero es información operativa expuesta sin autenticación.

### PC-07. Límite de tasa en memoria — Gravedad baja — Verificado en código

`core/limite.py` (`LimiteVentana`) y `mensajes_contacto.py:24`. Se reinicia al reiniciar el proceso y no se comparte entre instancias.

## Documentación

### PC-08. Cinco documentos citados que no existen — Verificado en el sistema de archivos y en Git

| Archivo citado | Dónde |
|---|---|
| `docs/DESPLIEGUE.md` | README (introducción) |
| `docs/WHATSAPP_SOS.md` | README §5 y §10 |
| `docs/PRUEBAS_SOS.md` | README §10 |
| `docs/PRUEBAS_COMPRA_PLAN.md` | README_BDD y README §10 |
| `docs/INTEGRACION_BDD_2026-10-21.md` | README_BDD y README §10 |

La carpeta `docs/` no existe, y `git ls-files` no devuelve ninguno de estos archivos. Puede que existan en otra copia.

### PC-09. Ventana de 5 horas para compras pendientes — Pendiente

README_BDD dice que "tras cinco horas una creación sin ID externo requiere revisión manual con PayPal". Con búsqueda de texto no encontré un valor de 5 horas en el código de compras ni de PayPal. Puede estar implementada de otra forma o no existir.

**Qué hacer:** leer `apps/backend/src/compras/` y `paypal.service.ts` completos antes de afirmarlo.

### PC-10. Documentos binarios sin leer — Pendiente

ERS, plan de pruebas, matriz de trazabilidad, diccionario de datos, diagramas UML y arquitectura. Su contenido puede contradecir lo que este material afirma sobre requisitos y modelo. Ver [TRAZABILIDAD_DOCUMENTACION.md](../04_documentacion/TRAZABILIDAD_DOCUMENTACION.md) §4.

## Pruebas

### PC-11. Solo se ejecutó una suite — Verificado por ejecución

- Ejecutada: `apps/backend/src/login/login-pin.spec.ts`, 9 de 9 pasaron (`npm test -- src/login/login-pin.spec.ts`).
- No ejecutadas: pruebas de FastAPI (`services/internal-api/tests/`), que necesitan PostgreSQL; pruebas de web (`apps/web/src/**/*.test.*`), de móvil (`apps/mobile/src/**/*.test.*`), y de escritorio; pruebas e2e del móvil (`test.e2e`).

No afirmo que el resto pase ni que falle.

### PC-12. Cómo se ejecuta `login-pin.spec.ts` — Verificado por ejecución

Con `npx jest` directo falla por ESM (no transforma TypeScript). Con el script del proyecto (`npm test`), que usa `node --experimental-vm-modules`, pasa. Quien vaya a ejecutarlo debe usar el script y no `npx jest`.

## Arquitectura

### PC-13. Acoplamiento por base de datos — Gravedad media — Verificado en código

FastAPI escribe `envio_alerta`; NestJS la lee con SQL. Cambiar el nombre de la tabla o de una columna rompe el envío sin error de compilación. Ver [ARQUITECTURA.md](../01_arquitectura/ARQUITECTURA.md) §2.

### PC-14. Secreto JWT compartido en dos servicios — Gravedad media — Verificado en código

`JWT_SECRET` debe ser el mismo en NestJS y FastAPI. Si se rota en uno solo, las sesiones fallan en el otro.

### PC-15. El envío de WhatsApp depende de Baileys — Gravedad alta para el negocio — Verificado en código y README

Baileys no es una API oficial (README §5). Si WhatsApp bloquea la sesión, el SOS se registra pero el aviso no sale.

## Riesgos de negocio y operación

### PC-16. El cierre automático de SOS depende de que el servicio esté encendido

El job corre dentro de FastAPI (`core/scheduler.py`). Si FastAPI está apagado durante 24 horas, la alerta sigue ACTIVA hasta que vuelva a arrancar y lo recupere al iniciar (README §5).

### PC-17. Plan y contacto como requisitos del SOS

`crear` rechaza el SOS sin plan del principal (`alertas.py:45`) o sin contactos (`alertas.py:47`). Un usuario sin plan no puede emitir alerta, incluso en una emergencia. Es una regla de negocio. Hay que saber defenderla.

## Resumen para la defensa

| Prioridad | Punto | Cómo responder |
|---|---|---|
| 1 | PC-01 Rutas sin guard | Reconocer, explicar el riesgo, proponer guard o retiro |
| 2 | PC-02 Regla de plataforma | Reconocer que no está implementada; proponer la solución |
| 3 | PC-08 Documentos faltantes | Confirmar si existen en otra copia |
| 4 | PC-03 Dos políticas de PIN | Explicar que son servicios distintos y que el README solo describe una |
| 5 | PC-15 Baileys | Explicar el riesgo y la alternativa oficial |
| 6 | PC-11 Pruebas no ejecutadas | Decir exactamente cuáles se ejecutaron |
