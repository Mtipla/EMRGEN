# Informes de tickets cerrados

En **Administrar Tickets de soporte**, el administrador dispone de **Descargar PDF** y **Descargar Excel** en web y escritorio. El informe incluye todos los tickets con estado `CERRADO`, de todas las páginas y sin depender del filtro de la bandeja. Contiene ID, estado, emisor (ID, nombre y correo), categoría, descripción, solución y trabajador que respondió (ID, nombre y correo).

`GET /admin/tickets/reporte?formato=pdf|xlsx` exige una sesión de administrador con acceso completo. Relee el rol vigente en cada petición y envía `Cache-Control: no-store`. El formato predeterminado es PDF. No admite filtros ni paginación que alteren el alcance del informe. Se retiró la descarga CSV de la tabla de tickets.

## Registro del trabajador

Al guardar una solución en la API interna, se registra el usuario autenticado y una copia de su nombre y correo. El trabajador del informe es el autor de la **última solución guardada**, incluido el administrador si redactó esa solución. Cambiar solo el estado conserva al autor anterior. Los cambios posteriores de nombre, correo, rol o eliminación de la cuenta no borran el nombre y correo registrados al responder.

Los tickets anteriores a la migración conservan su solución y muestran **Sin trabajador registrado** si no hay autor disponible. Los casos sin solución muestran **Sin solución registrada**. No se atribuyen retrospectivamente respuestas sin evidencia.

## Instalación

Aplicar antes de iniciar la API interna y el backend actualizados:

```powershell
node scripts/migrate-tickets-responsable.cjs
```

La migración `migrations/20261028_tickets_responsable.sql` agrega tres columnas opcionales a `soporte` y puede volver a ejecutarse. No modifica `init.sql`. Debe aplicarse también al crear una base nueva desde `init.sql`. La generación utiliza el servicio jsReport existente (`JSREPORT_URL`), con las recetas `chrome-pdf` y `html-to-xlsx`.

## Verificación

```powershell
npm run test --workspace=backend -- --runInBand src/admin/admin-tickets.service.spec.ts src/admin/admin-tickets.controller.spec.ts src/admin/admin-acceso.spec.ts
npm run test --workspace=web -- src/features/administracion/informes-tickets.test.tsx src/features/administracion/admin-soporte.test.tsx src/features/administracion/derivacion-desktop.test.tsx
```

Desde `services/internal-api`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_tickets_soporte.py -q
```

Para comprobar PostgreSQL, API interna, backend y jsReport reales:

```powershell
node scripts/check-tickets-reportes.cjs
python scripts/validate-tickets-reportes.py
```

Por defecto usa el backend en `http://localhost:3001` y la API interna en `http://localhost:8000`; se pueden configurar `PANEL_API_URL` e `INTERNAL_API_URL`. La prueba crea y elimina cuentas y tickets temporales, verifica los permisos y genera PDF/Excel en `node_modules/.cache/tickets-reportes-verificacion`. La validación comprueba que los 22 cerrados de prueba estén completos, excluye abiertos/en proceso, verifica autor y texto con acentos, símbolos y saltos de línea, y comprueba que el texto no se interprete como fórmulas de Excel.
