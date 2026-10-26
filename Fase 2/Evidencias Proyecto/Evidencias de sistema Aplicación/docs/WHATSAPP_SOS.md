# Envío de SOS por WhatsApp

El móvil captura la ubicación y registra el SOS en FastAPI. El servicio guarda el mensaje configurado del usuario (o el predeterminado), el tipo de emergencia seleccionado y un envío `PENDIENTE` de `ACTIVACION` por contacto en la misma transacción. NestJS revisa esa cola cada dos segundos y utiliza la sesión de Baileys para despachar el texto y, si hay coordenadas, un pin de ubicación. Este flujo no consulta ni envía antecedentes médicos.

Al pasar una alerta de `ACTIVA` a `FINALIZADA`, un trigger registra un envío `PENDIENTE` de `FINALIZACION` por cada contacto de emergencia actual del usuario. Esto incluye el cierre con PIN y el cierre automático de las 24 horas. NestJS entrega el aviso de cierre como un único texto, sin volver a adjuntar la ubicación.

### Actualizar una base de datos existente

Esta ampliación añade `envio_alerta.tipo_notificacion` y mantiene los envíos anteriores como `ACTIVACION`. Detén NestJS y FastAPI y ejecuta desde la raíz del monorepo:

```powershell
node scripts/migrate-whatsapp.cjs
node scripts/verify-schema.cjs
```

La migración está en `migrations/20261026_whatsapp_finalizacion.sql`, conserva los datos y puede repetirse. Reinicia los dos servicios con el código actualizado. No vuelvas a ejecutar `init.sql` en una base con datos: ese archivo ya incluye la ampliación para instalaciones nuevas. No se generan avisos retroactivos para alertas finalizadas antes de aplicar la migración.

Para el funcionamiento normal deben estar disponibles PostgreSQL, NestJS, FastAPI y el móvil.

## Configuración y vinculación del emisor

En `.env` o `apps/backend/.env.local`, configura lo siguiente y reinicia NestJS:

```env
WHATSAPP_ENABLED=true
WHATSAPP_DEFAULT_COUNTRY_CODE=56
WHATSAPP_SENDER_PHONE=+56XXXXXXXXX
```

`WHATSAPP_SENDER_PHONE` permite comprobar que la cuenta vinculada coincide con el emisor esperado. Si no coincide, se detienen los despachos. Docker Compose toma estas variables del `.env` raíz.

Las rutas de vinculación requieren un JWT de **ADMINISTRADOR**. Desde PowerShell, usa el token de esa sesión:

```powershell
$headers = @{ Authorization = "Bearer $jwt" }
Invoke-RestMethod http://localhost:3000/notifications/whatsapp/status -Headers $headers

$body = @{ phoneNumber = '+56XXXXXXXXX' } | ConvertTo-Json
Invoke-RestMethod http://localhost:3000/notifications/whatsapp/pairing-code `
  -Method Post -Headers $headers -ContentType 'application/json' -Body $body
```

En el teléfono emisor, abre **WhatsApp Business → Dispositivos vinculados → Vincular un dispositivo → Vincular con número de teléfono** e introduce el código generado. Si esa opción no aparece, descarga el QR vigente y escanéalo desde **Vincular un dispositivo**:

```powershell
Invoke-WebRequest http://localhost:3000/notifications/whatsapp/qr `
  -Headers $headers -OutFile "$env:TEMP\emergen-whatsapp-qr.png"
```

Confirma que `/notifications/whatsapp/status` devuelve `state: "open"` y el número esperado. La sesión se guarda en `apps/backend/auth_info_baileys/` (o en el volumen de Compose). Estas llaves no deben compartirse ni versionarse. Solo una instancia de NestJS debe usar la misma sesión.

La integración existente utiliza Baileys como dispositivo vinculado; no necesita tokens, plantillas ni webhooks de Meta Cloud API. Referencias: [vinculación de WhatsApp Business](https://faq.whatsapp.com/878854700132604/?cms_platform=android) y [documentación de Baileys](https://github.com/WhiskeySockets/Baileys).

### Cambiar el número emisor

1. Actualiza `WHATSAPP_SENDER_PHONE` en la configuración efectiva de NestJS. En el entorno local, `apps/backend/.env.local` tiene prioridad sobre el `.env` raíz; en Docker, se usa el `.env` raíz.
2. Con la sesión de administrador, ejecuta `POST /notifications/whatsapp/logout` para retirar las credenciales de la cuenta anterior, incluso si la conexión figura como `closed`.
3. Reinicia NestJS para cargar el nuevo número y vincúlalo por código o QR desde su propio teléfono.
4. Comprueba `state: "open"` y que `phoneNumber` corresponde al nuevo emisor antes de generar un SOS de prueba.

El cambio conserva contactos, mensajes configurados e historial de SOS. El formato y los destinatarios proceden del usuario que genera la alerta. El código de vinculación debe solicitarse para el número nuevo; el número no necesita incorporarse al código fuente.

## Prueba desde el móvil

1. Inicia sesión con una cuenta con plan efectivo y un contacto de emergencia que tenga WhatsApp.
2. Configura el mensaje personalizado del perfil. Si falta, se usa «Necesito ayuda inmediata en mi ubicación.».
3. Abre SOS, selecciona el tipo de emergencia y pulsa **Enviar SOS**. Permite el acceso a la ubicación.
4. El móvil confirma el registro y muestra los contadores de WhatsApp. El apartado Alertas también actualiza esos contadores automáticamente.
5. Comprueba en el contacto el texto y el pin. Finaliza el SOS con su PIN cuando termine la prueba.
6. Confirma que llega un único mensaje de `FINALIZADA`. Repetir el cierre no crea otro aviso. La respuesta del SOS separa los contadores `whatsapp` de activación y `whatsapp_cierre` de finalización.

Para una prueba sin GPS, añade al `.env.local` **de la raíz del monorepo** y reinicia Vite si es necesario:

```env
VITE_SOS_SIMULATED_LOCATION=-33.4378,-70.6504
```

La simulación solo funciona con Vite en desarrollo y se identifica con `SIMULADA:` en el texto. Quita la variable para volver al GPS. Si no se obtiene ubicación, la alerta se registra y envía con `UBICACIÓN: No disponible`; no se inventan coordenadas.

La captura espera hasta diez segundos. La app distingue permiso bloqueado, posición no disponible y tiempo de espera agotado, y mantiene ese aviso entre reintentos del mismo SOS. Autorizar el sitio en Chrome no asegura que el dispositivo obtenga una posición: comprueba los servicios de ubicación del sistema y el permiso del navegador. Referencias: [ajustes de ubicación de Chrome](https://support.google.com/chrome/answer/142065?hl=es) y [servicios de ubicación de Windows](https://support.microsoft.com/es-es/windows/privacy/windows-location-service-and-privacy). Una ubicación que llega después del límite no modifica el SOS ya enviado.

El mensaje tiene este formato; la fecha es la creación del SOS y se presenta en `America/Santiago`:

```text
MENSAJE MEDIANTE APLICACIÓN EMERGEN

El usuario Nombre de correo correo@ejemplo.cl ha generado una alerta

TIPO DE EMERGENCIA: URBANO
FECHA/HORA: fecha y hora (America/Santiago)
UBICACIÓN: coordenadas · enlace de Google Maps
"Mensaje personalizado o predeterminado"
```

El tipo se consulta en `prioridad.tipo_prioridad` a partir del `prioridad_id` del SOS: `MEDICO`, `URBANO`, `EMERGENCIA` o `ADULTO MAYOR`. El aviso de cierre respeta este texto:

```text
MENSAJE MEDIANTE APLICACIÓN EMERGEN

La alerta reciente del usuario Nombre de correo correo@ejemplo.cl, ha sido FINALIZADA
```

## Estados y recuperación

- `PENDIENTE`: registrado en PostgreSQL, esperando despacho. Se conserva si NestJS se detiene o WhatsApp no está vinculado.
- `ENVIADO`: Baileys completó el envío del texto. No acredita recepción ni lectura. Si falla el pin, el enlace de Maps del texto conserva la ubicación.
- `FALLIDO`: número inválido, sin WhatsApp o fallo tras los tres intentos del proveedor. También se descartan las activaciones pendientes de SOS finalizados o de más de 24 horas, y los envíos pendientes de contactos o usuarios eliminados. Los avisos de finalización pendientes se conservan durante una desconexión. El esquema no permite reabrir envíos terminales.

Repetir la petición HTTP con la misma clave y contenido devuelve el mismo SOS y no crea nuevos envíos. El móvil conserva también la ubicación capturada entre reintentos. Cada `(alerta_id, contacto_emergencia_id, tipo_notificacion)` es único; repetir un cierre no reencola el aviso. Los despachadores bloquean las filas con `FOR UPDATE ... SKIP LOCKED` para evitar procesarlas a la vez. Los contadores de activación y cierre se consultan por separado.

Para comprobar el SQL, el formato, dos contactos, la reconexión y la ausencia de nuevos despachos al repetir los ciclos, con proveedor simulado y todas las escrituras revertidas:

```powershell
npm run build --workspace=backend
node scripts/test-whatsapp-sos.cjs
```

WhatsApp y PostgreSQL no comparten una transacción: si el proceso se interrumpe después de enviar el texto y antes de confirmar su estado en la base, una recuperación puede duplicar ese mensaje. No se garantiza entrega exactamente una vez.

Los antecedentes médicos y sus enlaces quedan fuera de este flujo, aunque un cliente anterior incluya `medicalInfo` en un envío manual.

## Verificación local del 26 de octubre de 2026

Se vinculó el emisor de prueba por código después de ajustar la identificación del dispositivo a Chrome. El usuario generó el SOS **#131** desde su sesión móvil con el mensaje personalizado configurado y coordenadas simuladas de Santiago. Se registró el envío **#58** como `ENVIADO` a las **17:09:53, America/Santiago**, y el receptor confirmó que recibió el mensaje y la ubicación. La simulación se desactivó después de esa comprobación; los siguientes SOS solicitarán la ubicación del dispositivo.

La validación incluyó 144 pruebas de NestJS, 33 de FastAPI y 15 del móvil, compilación del backend y revisión de tipos del móvil. También se ejecutó el SQL del despachador contra PostgreSQL con un proveedor simulado dentro de una transacción revertida: confirmó la fecha y el estado de envío y que un segundo ciclo no volvía a despachar el mismo registro.

### Cambio de emisor y segunda verificación

Ese mismo día se retiraron las credenciales del emisor anterior y se configuró la nueva cuenta Business mediante `WHATSAPP_SENDER_PHONE`. Se confirmó el nuevo número en `/notifications/whatsapp/status` con estado `open`, conservando el formato, el mensaje personalizado y los contactos de emergencia existentes.

El usuario generó el SOS **#153** desde su sesión móvil. Su envío **#79** quedó `ENVIADO` a las **17:52:36, America/Santiago**, y el receptor confirmó el mensaje y la ubicación procedentes del nuevo número. Se utilizó una ubicación simulada de Santiago, identificada como tal, y se desactivó al terminar la prueba. No se incluyeron antecedentes médicos.

Se repitieron satisfactoriamente las **192 pruebas** (144 de NestJS, 33 de FastAPI y 15 del móvil), además de la comprobación del despachador con PostgreSQL y proveedor simulado dentro de una transacción revertida.

### Tipo de emergencia y aviso de finalización

Se aplicó la migración de tipos de notificación conservando los registros anteriores y se comprobó su ejecución repetida. El cierre manual del SOS **#153** generó el envío de `FINALIZACION` **#141** a las **18:05:12, America/Santiago**; el receptor confirmó el texto solicitado. Después, el usuario generó el SOS **#184** de tipo `URBANO`: el envío de activación **#142** se registró a las **18:06:14** y el receptor confirmó que el mensaje incluía el tipo de emergencia.

Chrome no proporcionó una posición en la prueba del SOS #184, que quedó sin ubicación. No se determinó la causa del navegador en esa sesión. Se añadieron avisos específicos para distinguir los errores en los próximos intentos, sin bloquear el envío ni sustituir la posición por coordenadas inventadas.

La validación final incluyó **241 pruebas** (153 de NestJS, 36 de FastAPI, 32 del cliente compartido y 20 del móvil), compilación y lint del backend, revisión de tipos y lint de los cambios del móvil, comparación con el esquema y el modelo Excel, pruebas SQL y la prueba del despachador con dos contactos y proveedor simulado. Se comprobaron el cierre automático, el PIN incorrecto, la repetición de cierre, la desconexión, el rollback y la cancelación de pendientes al borrar una cuenta.
