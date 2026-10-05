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
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1f2937; margin: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { color: #4b5563; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #d1d5db; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; }
  tr:nth-child(even) td { background: #fafafa; }
  .vacio { padding: 16px; text-align: center; color: #6b7280; }
</style>
</head>
<body>
  <h1>Bitácora del sistema — EMERGEN</h1>
  <p class="meta">
    Generado: {{generado}} (hora de Chile) · Registros: {{total}}<br>
    Filtros: {{filtros}}
  </p>
  <table>
    <thead>
      <tr><th>ID</th><th>Fecha</th><th>Usuario</th><th>Aplicación</th><th>Acción</th></tr>
    </thead>
    <tbody>
      {{#each entradas}}
      <tr>
        <td>{{bitacora_sistema_ID}}</td>
        <td>{{fecha}}</td>
        <td>{{usuario}}</td>
        <td>{{aplicacion}}</td>
        <td>{{accion_realizada}}</td>
      </tr>
      {{else}}
      <tr><td class="vacio" colspan="5">Sin registros para los filtros indicados.</td></tr>
      {{/each}}
    </tbody>
  </table>
</body>
</html>`;
