# Permiso médico por contacto e informe de actividad

En `/perfil`, el editor de cada contacto ofrece **Compartir antecedentes médicos por WhatsApp**:

- **Habilitado**: incluye la ficha médica del emisor de la alerta.
- **Deshabilitado**: omite todo el bloque médico; conserva el mensaje y la ubicación.

La preferencia pertenece al contacto del usuario autenticado y se consulta al procesar cada envío. Los contactos existentes y nuevos quedan habilitados inicialmente, conservando el comportamiento anterior. Un cliente que omite la propiedad al editar no cambia el permiso guardado. Se mantienen las restricciones de edición de perfiles con acceso parcial.

La sección **Cuentas vinculadas** se retiró de `/inicio`. En `/cuentas`, **Descargar Informe PDF/Excel** permite elegir PDF o Excel (`.xlsx`):

- Principal: su cuenta y sus apadrinados actuales.
- Apadrinado: su cuenta; también puede descargar con acceso parcial.
- La descarga propia está disponible sin Premium. Administrar apadrinados conserva sus permisos anteriores.

En **Alertas realizadas** se incluyen únicamente las alertas con estado **FINALIZADA**, con usuario, tipo, mensaje, ubicación, estado y fechas. **Acciones y actividad** contiene acciones personales y administrativas registradas y compras; excluye las alertas, su historial, los inicios de sesión y los tickets de soporte. Distingue actor y cuenta afectada. No incluye fichas médicas ni valores de contraseñas, PIN, hashes o tokens.

Los cambios personales se registran desde esta incorporación; no se reconstruyen eventos pasados que no estaban guardados.

## Instalación

Desde la raíz del monorepo:

```powershell
node scripts/migrate-contactos-antecedentes.cjs
npm run build --workspace=backend
npm run build --workspace=web
```

Después de aplicar la migración, reiniciar el backend. La migración es idempotente y agrega únicamente `contacto_emergencia.compartir_antecedentes`; `init.sql` permanece intacto.

Si la web se inició con el modo Docker de Vite, consume `http://localhost:3001` mediante `.env.docker`. Actualizar el backend local del puerto 3000 no actualiza ese contenedor. Después de cambiar el código del backend, reconstruir únicamente ese servicio:

```powershell
docker compose up -d --build --no-deps backend
```

Este comando conserva la base de datos y el volumen de la sesión de WhatsApp. Validar los contactos y los informes contra el mismo puerto que consume la web. Un contenedor anterior rechaza `compartir_antecedentes` y devuelve el informe anterior, aunque el código local ya tenga las funciones nuevas.

## API

- `GET /usuarios/me/perfil` devuelve `compartir_antecedentes` en cada contacto.
- `POST /usuarios/me/contactos` y `PUT /usuarios/me/contactos/:id` aceptan el booleano opcional.
- `GET /usuarios/me/informe?formato=pdf|xlsx` determina el alcance desde la sesión. Sin `formato` devuelve PDF. No admite IDs de otras cuentas como parámetros.

La verificación de WhatsApp utiliza transportes simulados: no generar SOS ni usar el endpoint de envío real como prueba mientras el número responsable esté activo.
