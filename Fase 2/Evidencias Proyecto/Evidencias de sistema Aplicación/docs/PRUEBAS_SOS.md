# Consultar y probar la API de alertas SOS

## Números de emergencia en el móvil (0.2.3)

El Home muestra los números entre **Características de tu cuenta** y **Alertas**, incluso sin plan. En **Alerta rápida** aparecen desde que se pulsa **Enviar SOS**, durante la obtención de ubicación y el registro, y se conservan tanto ante un error como junto al estado de WhatsApp. No es necesario esperar al despacho de los mensajes para abrir el marcador.

En Android se utiliza `ACTION_DIAL` con el número seleccionado: se abre la aplicación Teléfono y el usuario decide si inicia la llamada. No se solicita el permiso `CALL_PHONE`. Si no se puede abrir el marcador, la app conserva los números y muestra una alternativa manual. En la versión web se mantienen enlaces `tel:`.

Prueba manual pendiente de confirmación del usuario:

1. Comprueba el apartado y su descripción en el Home.
2. Abre **Alerta rápida en la APP**: los números todavía no deben aparecer dentro del modal.
3. Pulsa **Enviar SOS** con tus contactos de prueba. Comprueba que aparecen los números y que permanecen junto al resultado y el estado de WhatsApp.
4. Toca un número y confirma que se abre el marcador con el número elegido escrito. Para esta comprobación no pulses el botón que inicia la llamada.
5. Vuelve a EMERGEN y prueba también el acceso del Home. Finaliza la alerta de prueba con tu PIN.

Validación automatizada de esta versión: 51 pruebas móviles aprobadas, ESLint de los archivos móviles modificados aprobado y APK `0.2.3-lan-debug` compilado e instalado mediante actualización. La apertura real del marcador y la recepción de WhatsApp se confirman mediante la prueba manual; las comprobaciones automáticas no envían SOS.

En el teléfono USB se confirmó `versionCode 6`, el registro del plugin `EmergencyDialer` y la conexión de la WebView con ambas APIs. El entorno LAN utiliza NestJS local en el puerto 3000 y FastAPI en el 8000; ambos superaron las comprobaciones CORS de `https://localhost`.

En la prueba del usuario del 29 de octubre se confirmó la incorporación de los números, pero el SOS **#269** quedó con un envío pendiente. La primera instalación del APK apuntaba al backend Docker del puerto 3001, que tenía WhatsApp deshabilitado; el backend local con la sesión vinculada no estaba ejecutándose. Se restableció NestJS local en el puerto 3000 y se recompiló el APK con esa dirección. La sesión de WhatsApp volvió a `open` con el emisor esperado y el despachador procesó el envío existente **#306**: **1 enviado, 0 pendientes, 0 fallidos**, sin crear otra alerta. El usuario confirmó la recepción por el contacto y el funcionamiento de la finalización. Para estas pruebas debe mantenerse iniciado el backend local; el backend Docker necesita su propia configuración y vinculación si se decide utilizarlo como emisor.

La preparación y traslado de entornos ahora cuentan con comprobaciones de disponibilidad real, configuración y conservación de datos; seguir [Entornos y despliegue](DESPLIEGUE.md).

## Ver alertas desde el panel administrativo

Inicia sesión como Admin y abre **Alertas SOS** en el menú. La sección consulta automáticamente cada 3 segundos mientras permanece abierta y permite actualizar manualmente, filtrar por estado o ID de usuario, recorrer páginas y ver el detalle. Usa la sesión del panel; no necesitas copiar tokens. Los SOS creados desde el móvil aparecen en el listado y su estado cambia al finalizarlos.

El contador de activas corresponde a todo el sistema; el de resultados respeta los filtros aplicados. Si se pierde la conexión, se conserva la última consulta con un aviso y se reintenta automáticamente. Las consultas se detienen al salir de la sección o cerrar sesión. Esta vista es de lectura y requiere un administrador con acceso completo.

La consulta del panel usa `GET /admin/alertas` en NestJS y lee los mismos registros SOS de PostgreSQL. El registro y cierre desde el móvil siguen utilizando FastAPI. Con backend Docker, recompila el servicio tras incorporar el cambio (`docker compose up --build -d backend`); con `start:dev` se recarga automáticamente.

La API de SOS es **FastAPI**, en `http://localhost:8000`. El login sigue en **NestJS**: `http://localhost:3001` con Docker o `http://localhost:3000` con el backend local. Ambos servicios comparten base de datos y validan el mismo JWT.

## Visualizar el contrato

- [Swagger UI: operaciones y modelos](http://localhost:8000/docs#/Alertas%20de%20emergencia).
- [ReDoc: documentación de lectura](http://localhost:8000/redoc).
- [OpenAPI JSON: contrato importable](http://localhost:8000/openapi.json).

En Swagger, expande **Alertas de emergencia**. Allí aparecen el listado, detalle, creación y cierre. El esquema `Alerta` muestra los campos de respuesta.

Swagger utiliza el esquema Bearer `SesionEMERGEN` y muestra el botón global **Authorize**. Obtén un JWT mediante el login de NestJS o desde la consola de la web/móvil con sesión iniciada (`localStorage.getItem('emergen.token')`). Pulsa **Authorize**, pega **solo el JWT, sin el prefijo `Bearer` ni comillas**, y confirma con **Authorize → Close**. Después ejecuta el GET con **Try it out → Execute**. Swagger adjunta automáticamente `Authorization: Bearer ...`. Abrir directamente la URL del listado en la barra del navegador devuelve 401 porque no adjunta el token.

Si estabas usando la versión anterior, recarga `/docs` con **Ctrl+F5** para cargar el esquema actualizado. Un token vencido requiere iniciar sesión de nuevo. El token que se usa aquí es el `access_token` de EMERGEN; la clave `JWT_SECRET` es configuración del servidor.

La corrección de Swagger se verificó con 17 pruebas de autenticación, OpenAPI, CORS y salud, y desde su interfaz en Chromium: **Authorize → JWT sin prefijo → GET /internal/v1/alertas** envió la cabecera Bearer y respondió **HTTP 200** con una sesión de administrador. Los tokens ausentes, mal formados o vencidos siguen devolviendo 401.

La sesión del panel administrativo no se comparte automáticamente con Swagger o PowerShell. El panel de escritorio guarda su token solo en memoria; los comandos obtienen una sesión independiente mediante el login existente.

## 1. Consultar alertas como administrador

Ejecuta en PowerShell. Estas credenciales son los fixtures locales documentados en [README_BDD.md](../README_BDD.md); si utilizas otra cuenta Admin, sustituye correo y contraseña. No necesitas volver a ejecutar el seed.

```powershell
$baseAuth = 'http://localhost:3001' # Usa 3000 si trabajas con NestJS local.
$baseSos = 'http://localhost:8000/internal/v1'

$loginAdmin = @{
    correo_usuario = 'admin@emergen.test'
    password = 'EmergenDev123!'
} | ConvertTo-Json
$sesionAdmin = Invoke-RestMethod -Method Post -Uri "$baseAuth/usuarios/login" -ContentType 'application/json' -Body $loginAdmin
$authAdmin = @{ Authorization = "Bearer $($sesionAdmin.access_token)" }

$alertas = Invoke-RestMethod -Uri "$baseSos/alertas?limit=20&offset=0" -Headers $authAdmin
$alertas | Format-Table alerta_id, usuario_id, estado_alerta, prioridad_id, fecha_creacion, fecha_cierre -AutoSize
```

El administrador con acceso completo puede ver las alertas de todos los usuarios. Para visualizar también el mensaje y la ubicación:

```powershell
$alertas | ConvertTo-Json -Depth 5
```

El listado devuelve un arreglo JSON, ordenado del más reciente al más antiguo. `[]` significa que esa consulta no encontró registros. Aumenta `offset` a 20, 40, etc. para recorrer las páginas; `limit` admite hasta 100.

Consulta el detalle de una alerta de la página o filtra por su usuario:

```powershell
if ($alertas.Count -gt 0) {
    $idAlerta = $alertas[0].alerta_id
    $idUsuario = $alertas[0].usuario_id
    Invoke-RestMethod -Uri "$baseSos/alertas/$idAlerta" -Headers $authAdmin | ConvertTo-Json -Depth 5
    if ($null -ne $idUsuario) {
        Invoke-RestMethod -Uri "$baseSos/alertas?usuario_id=$idUsuario&limit=20&offset=0" -Headers $authAdmin | ConvertTo-Json -Depth 5
    }
}
```

## 2. Registrar una alerta en una futura prueba

Los comandos de esta sección **crean un registro persistente** cuando los ejecutes. Usa la sesión del usuario que emitirá el SOS. La cuenta Admin de los fixtures no tiene un plan de consumo; `principal@emergen.test` tiene plan y contactos de prueba si se conservan los fixtures originales.

```powershell
$loginPrincipal = @{
    correo_usuario = 'principal@emergen.test'
    password = 'EmergenDev123!'
} | ConvertTo-Json
$sesionPrincipal = Invoke-RestMethod -Method Post -Uri "$baseAuth/usuarios/login" -ContentType 'application/json' -Body $loginPrincipal
$authPrincipal = @{ Authorization = "Bearer $($sesionPrincipal.access_token)" }

$solicitudSos = @{
    clave_idempotencia = [guid]::NewGuid().ToString()
    prioridad_id = 3
    ubicacion = 'Ubicacion ficticia de prueba'
} | ConvertTo-Json

$alertaNueva = Invoke-RestMethod -Method Post -Uri "$baseSos/alertas" -Headers $authPrincipal -ContentType 'application/json' -Body $solicitudSos
$alertaNueva | ConvertTo-Json -Depth 5
```

La respuesta es **201** y contiene `alerta_id`, `usuario_id`, `ubicacion`, `mensaje`, `prioridad_id`, `clave_idempotencia`, `estado_alerta`, `fecha_creacion` y `fecha_cierre`. La alerta nace `ACTIVA`, con `fecha_cierre: null`. El servidor toma la identidad del JWT; no envíes `usuario_id` en el body.

`ubicacion` es opcional y admite hasta 150 caracteres. `mensaje` también es opcional (hasta 200 caracteres y solo con acceso completo); al omitirlo se usa la plantilla configurada o el mensaje predeterminado.

| prioridad_id | Tipo |
|---|---|
| 1 | MEDICO |
| 2 | URBANO |
| 3 | EMERGENCIA |
| 4 | ADULTO MAYOR |

Verifica el registro con la sesión del principal y vuelve a ejecutar el listado del paso 1 para verlo como Admin:

```powershell
Invoke-RestMethod -Uri "$baseSos/alertas/$($alertaNueva.alerta_id)" -Headers $authPrincipal | ConvertTo-Json -Depth 5
```

## 3. Finalizar la alerta para repetir el ensayo

No puede existir más de una alerta activa por emisor. Cierra la anterior con la sesión del principal y su PIN antes de probar una nueva. `0007` corresponde exclusivamente al fixture original del principal; conserva el PIN como texto para mantener el cero inicial.

```powershell
$cierre = @{ pin = '0007' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$baseSos/alertas/$($alertaNueva.alerta_id)/cerrar" -Headers $authPrincipal -ContentType 'application/json' -Body $cierre | ConvertTo-Json -Depth 5
```

La respuesta es **200**, con estado `FINALIZADA` y `fecha_cierre` informada. El registro permanece consultable. Ser Admin no permite cerrar alertas de otras familias: el cierre corresponde al emisor o a su principal vinculado, con el PIN efectivo.

Si no se cierra manualmente, FastAPI la finaliza tras 24 horas transcurridas mediante su tarea periódica; si estaba apagado, recupera las vencidas al arrancar.

## Casos para futuras pruebas

| Caso | Resultado esperado |
|---|---|
| Listado con Admin completo | 200; todas las alertas o las del `usuario_id` indicado |
| Listado con usuario común | 200; solo sus propias alertas |
| Consulta sin token o con token vencido | 401 |
| Crear con plan y contacto propio | 201; alerta `ACTIVA` |
| Crear sin plan, sin contacto o con otra alerta activa | 409; explica el motivo |
| Reenviar exactamente `$solicitudSos` con la misma sesión | 201; mismo `alerta_id`, sin duplicado |
| Reutilizar el UUID cambiando el contenido | 409 |
| Omitir UUID o enviar prioridad fuera de 1–4 | 400 |
| Cerrar con PIN correcto | 200; `FINALIZADA` |
| Cerrar con PIN incorrecto | 403; al quinto fallo, 429 y bloqueo de 15 minutos |
| Cerrar sin PIN configurado | 409; sigue activa |

Para una alerta nueva, genera un UUID nuevo. Para reintentar la misma solicitud tras una interrupción de red, conserva tanto su UUID como su contenido.

El registro guarda `ALERTA`, `DETALLE_ALERTA`, `HISTORIAL_ALERTA`, un `ENVIO_ALERTA` pendiente por contacto y, si corresponde, `UBICACION_ALERTA` en una transacción. NestJS procesa esos envíos mediante la sesión de WhatsApp vinculada. El GET de alertas devuelve el estado del SOS y los contadores `whatsapp` de pendientes, enviados y fallidos. Consulta [SOS por WhatsApp](WHATSAPP_SOS.md) para la vinculación y la prueba con ubicación real o simulada.

La pantalla móvil ya utiliza `POST /internal/v1/alertas` y `POST /internal/v1/alertas/{id}/cerrar` desde `apps/mobile/src/components/AlertaSos.tsx`. Estas pruebas permiten verificar su registro directamente en la API.
