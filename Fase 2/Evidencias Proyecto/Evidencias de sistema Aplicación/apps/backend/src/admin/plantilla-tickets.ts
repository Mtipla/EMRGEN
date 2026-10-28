const FILAS = `{{#each tickets}}<tr>
  <td>{{ticket_id}}</td><td>{{estado}}</td>
  <td>{{usuario_id}}</td><td>{{nombre_usuario}}</td><td>{{correo_usuario}}</td>
  <td>{{categoria}}</td><td>{{descripcion}}</td><td>{{solucion}}</td>
  <td>{{trabajador_id}}</td><td>{{trabajador_nombre}}</td><td>{{trabajador_correo}}</td>
</tr>{{/each}}`;

const TABLA = `<table data-sheet-name="Tickets cerrados"><thead><tr>
  <th>Ticket</th><th>Estado</th><th>ID emisor</th><th>Usuario emisor</th><th>Correo del emisor</th>
  <th>Categoría</th><th>Descripción</th><th>Solución</th>
  <th>ID trabajador</th><th>Trabajador que respondió</th><th>Correo del trabajador</th>
</tr></thead><tbody>${FILAS}</tbody></table>`;

// Handlebars escapa todos los campos procedentes de los tickets.
export const PLANTILLA_TICKETS_PDF = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font: 10px Arial, sans-serif; color: #172536; }
  h1 { font-size: 20px; } table { border-collapse: collapse; width: 100%; table-layout: fixed; }
  th, td { border: 1px solid #cbd5e1; padding: 5px; text-align: left; vertical-align: top; overflow-wrap: anywhere; white-space: pre-wrap; }
  th { background: #edf2f7; } thead { display: table-header-group; } tr { break-inside: avoid; }
</style></head><body>
<h1>EMERGEN · Informe de tickets cerrados</h1>
<p>Generado: {{generado}} (hora de Chile) · Total: {{total}}</p>
<p>Incluye todos los tickets con estado CERRADO. El trabajador corresponde al autor de la última solución guardada.</p>
${TABLA}
{{#unless tickets.length}}<p>No hay tickets cerrados.</p>{{/unless}}
<p>Los casos antiguos sin autor registrado se indican como «Sin trabajador registrado».</p>
</body></html>`;

// Cada ticket ocupa una fila, con celdas de texto para conservar el contenido ingresado.
export const PLANTILLA_TICKETS_EXCEL = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>
  td, th { font: 11px Calibri, sans-serif; padding: 5px; border: 1px solid #cbd5e1; width: 180px; vertical-align: top; white-space: pre-wrap; }
  th { font-weight: bold; background-color: #edf2f7; }
</style></head>
<body>${TABLA}</body></html>`;
