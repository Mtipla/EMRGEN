/**
 * Plantilla Handlebars del reporte de bitácora. Vive en el código (no en jsReport Studio)
 * para que el reporte funcione con un servidor jsReport recién levantado, sin configurarlo.
 * Handlebars escapa `{{ }}`, así que los datos de la BD no pueden inyectar HTML.
 */
export const PLANTILLA_BITACORA = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #1f2937; margin: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { color: #4b5563; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #d1d5db; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; }
  tr:nth-child(even) td { background: #fafafa; }
  .cambio { color: #374151; }
  .fallida { color: #b91c1c; font-weight: bold; }
  .vacio { padding: 16px; text-align: center; color: #6b7280; }
</style>
</head>
<body>
  <h1>Bitácora de auditoría — EMERGEN</h1>
  <p class="meta">
    Generado: {{generado}} (hora de Chile) · Registros: {{total}}<br>
    Filtros: {{filtros}}
  </p>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Fecha</th><th>Actor</th><th>Rol</th><th>Usuario afectado</th>
        <th>Acción</th><th>Entidad</th><th>Origen</th><th>Resultado</th><th>Detalle</th>
      </tr>
    </thead>
    <tbody>
      {{#each entradas}}
      <tr>
        <td>{{bitacora_sistema_ID}}</td>
        <td>{{fecha}}</td>
        <td>{{actor}}</td>
        <td>{{rol}}</td>
        <td>{{afectado}}</td>
        <td>{{tipo}}</td>
        <td>{{entidad}}</td>
        <td>{{aplicacion}}</td>
        <td class="{{#if fallida}}fallida{{/if}}">{{resultado}}</td>
        <td>
          {{accion_realizada}}
          {{#each cambios}}<div class="cambio">{{this}}</div>{{/each}}
        </td>
      </tr>
      {{else}}
      <tr><td class="vacio" colspan="10">Sin registros para los filtros indicados.</td></tr>
      {{/each}}
    </tbody>
  </table>
</body>
</html>`;

export const PLANTILLA_BITACORA_EXCEL = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><style>
  td, th { font-family: Calibri, sans-serif; font-size: 12px; padding: 5px; border: 1px solid #cbd5e1; width: 150px; vertical-align: top; }
  th { background-color: #e2e8f0; font-weight: bold; }
  .ancho { width: 350px; white-space: pre-wrap; }
</style></head><body>
  <table data-sheet-name="Resumen">
    <tr><th colspan="2">Bitácora de auditoría — EMERGEN</th></tr>
    <tr><td>Generado (Chile)</td><td>{{generado}}</td></tr>
    <tr><td>Filtros</td><td class="ancho">{{filtros}}</td></tr>
    <tr><td>Registros</td><td data-cell-type="number">{{total}}</td></tr>
  </table>
  <table data-sheet-name="Bitacora">
    <tr><th>ID</th><th>Fecha (Chile)</th><th>Actor</th><th>Rol</th><th>Usuario afectado</th><th>Acción</th><th>Entidad</th><th>Origen</th><th>Resultado</th><th>Detalle</th></tr>
    {{#each entradas}}<tr>
      <td data-cell-type="number">{{bitacora_sistema_ID}}</td><td>{{fecha}}</td>
      <td>{{actor}}</td><td>{{rol}}</td><td>{{afectado}}</td><td>{{tipo}}</td>
      <td>{{entidad}}</td><td>{{aplicacion}}</td><td>{{resultado}}</td>
      <td class="ancho">{{accion_realizada}}{{#each cambios}}<br>{{this}}{{/each}}</td>
    </tr>{{/each}}
  </table>
</body></html>`;
