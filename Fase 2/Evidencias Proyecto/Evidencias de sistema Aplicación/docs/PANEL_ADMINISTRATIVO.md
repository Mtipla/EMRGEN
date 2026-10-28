# Panel administrativo: soporte, cuentas y planes

Los componentes de administración se comparten entre web y escritorio.
Las autorizaciones se validan en NestJS y en la API interna, leyendo el rol vigente
de PostgreSQL en cada petición.

En escritorio, «Bitácora / Auditoría» contiene únicamente la consulta de registros,
sus filtros y la exportación de reportes PDF o Excel. Los planes y cupos se gestionan
en su apartado propio y las cuentas de soporte, desde «Administrar trabajadores».

## Actualización de una base existente

Desde la raíz de la aplicación:

```powershell
node scripts/migrate-panel.cjs
npm run build --workspace=backend
```

El script aplica dos migraciones idempotentes:

- `005_panel_administrativo.sql` elimina `ticket_soporte.verificacion_solicitada` si existía. La verificación usa únicamente el estado del ticket.
- `006_usuario_solo_roles.sql` elimina de `usuario` los campos descartados `nombre_completo`, `telefono` y `es_trabajador`, incluidos sus valores si existían.

`init.sql` usa únicamente `nombre_usuario` para identificar al usuario y no crea esos tres campos.
No existe una tabla de trabajadores separada; el personal se identifica por los roles existentes.
Reiniciar el backend y la API interna si sus procesos no recargan los archivos.
El script `scripts/restart-panel-internal-api.ps1` reinicia únicamente una instancia local
de uvicorn identificada por la ruta del entorno virtual de este proyecto y el puerto 8000.

## Perfiles del personal

`PATCH /usuarios/me` aplica estas restricciones según el rol:

| Perfil        | Campos modificables                             |
| ------------- | ----------------------------------------------- |
| SOPORTE       | `nombre_usuario`                                |
| ADMINISTRADOR | `nombre_usuario`, `PIN`                         |

USUARIO no tiene teléfono ni nombre completo; los números de emergencia pertenecen a sus contactos.
El PIN debe ser una cadena de
cuatro dígitos, incluidos ceros iniciales. Se guarda como hash bcrypt y nunca se
devuelve ni se incluye en los cambios de auditoría.
El personal no cambia correo ni contraseña desde su propio perfil.

## Trabajadores

Solo ADMINISTRADOR puede usar:

- `POST /admin/usuarios/soporte`: crea un trabajador inicialmente parcial, pendiente de PIN.
- `GET /admin/usuarios/trabajadores`: lista trabajadores habilitados y deshabilitados.
- `PATCH /admin/usuarios/trabajadores/:id`: admite `correo_usuario`, `PIN` y `rol_ID` (2 SOPORTE o 3 USUARIO).
- `DELETE /admin/usuarios/trabajadores/:id`: elimina su cuenta con auditoría.

La tabla muestra la columna «Habilitado/Inhabilitado» a la derecha de «Rol», calculada
en el panel: SOPORTE (2) significa Habilitado y USUARIO (3), Inhabilitado.
«Deshabilitar cuenta» cambia únicamente el rol a USUARIO y «Habilitar cuenta» lo devuelve a SOPORTE.
El cambio no modifica el acceso completo/parcial ni el PIN. El JWT existente pierde o recupera
las facultades de soporte según el rol vigente, que ambas API releen en cada petición.

Los trabajadores deshabilitados permanecen en el listado incluso al recargar o cambiar de dispositivo.
Se reconocen por los cambios de rol exitosos ya registrados en la bitácora del administrador;
no se añade ninguna columna, tabla ni marca de habilitación al modelo. Ese historial solo permite
encontrar sus cuentas, y nunca concede permisos al trabajador.
El administrador puede editar correo/PIN y eliminar trabajadores habilitados o deshabilitados.
No existe el apartado para asignar SOPORTE a cuentas comunes: la API también rechaza convertir
usuarios sin historial de trabajador, administradores y apadrinados mediante esta ruta.

Configurar el primer PIN completa la configuración inicial de acceso. Renovar un PIN
existente no cambia el acceso total/parcial. La eliminación conserva las restricciones
de integridad de la base: deben resolverse apadrinados o compras pendientes antes de borrar.
La cuenta y su PIN sin referencias desaparecen; la bitácora conserva el registro histórico.

## Tickets

`PATCH /internal/v1/tickets-soporte/:id` admite:

- `enviar_verificacion: true`, exclusivo de soporte: cambia el ticket a EN PROCESO aunque
  no se haya cambiado el estado manualmente. Es una acción de la petición; no se guarda
  una columna adicional ni se devuelve una marca de verificación. El botón envía únicamente
  el cambio de estado y conserva los borradores de solución sin guardarlos.
- `estado: "CERRADO"` con `confirmar_cierre: true`: la interfaz solicita confirmación
  antes de enviar el cierre. Cancelar no realiza ninguna escritura.
- `solucion`: respuesta del personal.

Los tickets EN PROCESO y CERRADO son de solo lectura para soporte: puede consultar
descripción, estado y solución registrada, y cerrar el editor. Al enviar a verificación
desaparecen inmediatamente los controles de estado, solución, guardado y reenvío.
Los borradores no guardados no se presentan como soluciones registradas.
La API rechaza con 403 cualquier modificación por soporte mientras el ticket esté
EN PROCESO o CERRADO, incluido cambiar el estado, cerrar, responder o reenviar a
verificación. La restricción depende del estado actual en la BD, aunque se haya
marcado EN PROCESO manualmente o el cliente conserve un formulario antiguo.
El administrador puede editarlo, cerrarlo con confirmación o reabrirlo; si lo devuelve
a ABIERTO, soporte puede volver a editarlo.
Las operaciones bloquean la fila para validar el estado dentro de la misma transacción.
El administrador consulta los tickets EN PROCESO mediante el filtro de estado existente.

### Módulo sugerido y retorno al ticket

Solo el administrador ve «Módulo sugerido» entre Descripción y Estado al seleccionar
un ticket, tanto en web como en escritorio:

| Categoría | Módulo |
| --- | --- |
| PAGOS Y PLANES | Gestión de planes y cupos de usuario |
| ALERTAS | Alertas SOS |
| CUENTA Y ACCESO | Administrar cuentas |
| APLICACIÓN (también APLICACION) | Alertas SOS |
| OTRO | Sin sugerencia |

El módulo de destino muestra un resumen con número de ticket, usuario, categoría,
estado, descripción y solución en edición si existe. «Volver a editar solución»
restaura el mismo ticket seleccionado, su borrador de estado/solución y el filtro
y página de la bandeja. La solución recibe el foco para continuar la edición.
La navegación no guarda ni resuelve automáticamente el ticket: los cambios se
envían con «Guardar cambios» y el cierre conserva su confirmación habitual.

El contexto permanece únicamente en memoria durante ese recorrido. Si se navega
a otro módulo, se descartan el resumen y la selección guardada; volver mediante
el menú o el historial no los recupera. Cerrar sesión o recargar también los descarta.

## Cuentas y planes

`GET /admin/usuarios` incluye `numeros_vinculados` (cantidad de contactos de emergencia)
y `alertas_generadas` (cantidad de alertas propias). No suma alertas de apadrinados al titular
ni multiplica los conteos al combinar relaciones.

Al seleccionar una cuenta, `GET /admin/usuarios/:id` proporciona cuenta, plan,
apadrinados con correo y acceso, contactos con nombre y número, y alertas con ID,
estado, prioridad, mensaje, ubicación y fechas. Soporte mantiene la consulta en solo lectura.
El acceso de la cuenta se modifica con los botones «Pasar a Acceso Parcial» y «Dar acceso total».

«Gestión de planes y cupos de usuario» está disponible para el administrador en
`/administracion/planes` y en el apartado correspondiente del panel de escritorio.
Es la sección destinada a asignar planes y editar cupos adquiridos; no edita datos,
acceso ni elimina cuentas. Consume `GET /admin/usuarios/planes` y
`PUT /admin/usuarios/:id/plan`. Los cupos ocupados se calculan desde los apadrinados
existentes; no se puede reducir el total por debajo de esa ocupación ni superar cinco.

## Verificación

```powershell
npm run test --workspace=web
npm run test --workspace=backend -- --runInBand src/admin
$env:DB_E2E='1'
npm run test:e2e --workspace=backend -- --runInBand panel-administrativo.db.e2e-spec.ts auth-admin.db.e2e-spec.ts
Push-Location services/internal-api
.\.venv\Scripts\python.exe -m pytest tests/test_tickets_soporte.py -q
Pop-Location
node scripts/check-panel-live.cjs
```

Las pruebas de PostgreSQL crean cuentas propias y eliminan sus datos al terminar.
La comprobación de servicios activos consulta listados y el contrato OpenAPI sin mostrar
credenciales ni datos personales; la consulta del expediente queda auditada por el backend.

Las pruebas cubren la edición del nombre de usuario sin teléfono ni nombre completo,
el rechazo de campos retirados, los cambios de rol, la revocación de permisos con el mismo JWT
y la protección de administradores y apadrinados.
