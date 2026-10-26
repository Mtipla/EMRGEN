# Consultar y probar la API de alertas SOS

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

La versión actual documenta `authorization` como un parámetro de cabecera por operación, sin un esquema de seguridad Bearer ni botón global **Authorize**. Para ejecutar las pruebas autenticadas de forma reproducible, utiliza los comandos siguientes. Abrir directamente la URL del listado en el navegador devuelve 401 porque no adjunta el token.

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

El registro guarda `ALERTA`, `DETALLE_ALERTA`, `HISTORIAL_ALERTA` y, si corresponde, `UBICACION_ALERTA` en una transacción. El historial interno de transiciones se persiste en BD; el GET de alertas devuelve el estado actual de cada evento. Este servicio todavía no realiza el envío a contactos por WhatsApp.

La pantalla móvil ya utiliza `POST /internal/v1/alertas` y `POST /internal/v1/alertas/{id}/cerrar` desde `apps/mobile/src/components/AlertaSos.tsx`. Estas pruebas permiten verificar su registro directamente en la API.
