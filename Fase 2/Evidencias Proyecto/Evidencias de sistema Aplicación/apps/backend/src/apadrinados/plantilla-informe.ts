/** Tablas compartidas: Handlebars escapa todos los textos del usuario. */
const ACTIVIDAD = `
  <h2>Alertas realizadas ({{alertas.length}})</h2>
  <p>Se incluyen únicamente las alertas finalizadas.</p>
  <table data-sheet-name="Alertas">
    <thead><tr><th>ID</th><th>Usuario</th><th>Estado</th><th>Tipo</th><th>Mensaje</th><th>Ubicación</th><th>Creada (Chile)</th><th>Cerrada (Chile)</th></tr></thead>
    <tbody>{{#each alertas}}<tr>
      <td>{{alerta_id}}</td><td>{{nombre_usuario}}</td><td>{{estado_alerta}}</td><td>{{tipo_prioridad}}</td>
      <td>{{texto_mensaje}}</td><td>{{ubicacion}}</td><td>{{creada}}</td><td>{{cerrada}}</td>
    </tr>{{else}}<tr><td colspan="8">Sin alertas finalizadas.</td></tr>{{/each}}</tbody>
  </table>
  <h2>Acciones y actividad ({{acciones.length}})</h2>
  <p>Incluye cambios de perfil y contactos, configuración de cuentas y credenciales, compras y acciones registradas sobre las cuentas del informe.</p>
  <p>Los cambios personales se registran desde la incorporación de esta función.</p>
  <table data-sheet-name="Actividad">
    <thead><tr><th>Fecha (Chile)</th><th>Usuario que realizó la acción</th><th>Cuenta afectada</th><th>Acción</th><th>Resultado / estado</th><th>Origen</th></tr></thead>
    <tbody>{{#each acciones}}<tr>
      <td>{{fecha}}</td><td>{{usuario}}</td><td>{{afectado}}</td><td>{{accion}}</td><td>{{resultado}}</td><td>{{origen}}</td>
    </tr>{{else}}<tr><td colspan="6">Sin acciones registradas.</td></tr>{{/each}}</tbody>
  </table>`;

/** HU-19 / RF22. Plantilla del servidor. */
export const PLANTILLA_INFORME = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; margin: 24px; font-size: 12px; color: #1f2937; }
  h1 { font-size: 20px; margin-bottom: 6px; }
  h2 { font-size: 15px; margin-top: 24px; }
  .meta { color: #475569; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 7px; border: 1px solid #cbd5e1; text-align: left; overflow-wrap: anywhere; }
  th { background: #f1f5f9; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
</style></head><body>
  <h1>Informe personal — EMERGEN</h1>
  <p class="meta">Generado: {{generado}} (hora de Chile)</p>
  <h2>Mi cuenta</h2>
  <table>
    <tr><th>Nombre</th><td>{{usuario.nombre}}</td></tr>
    <tr><th>Correo</th><td>{{usuario.correo}}</td></tr>
    <tr><th>Tipo de cuenta</th><td>{{usuario.tipo}}</td></tr>
    <tr><th>Acceso</th><td>{{usuario.acceso}}</td></tr>
    <tr><th>Premium</th><td>{{usuario.premium}}</td></tr>
  </table>
  {{#if principal}}
  <h2>Cuentas apadrinadas ({{apadrinados.length}})</h2>
  <table>
    <thead><tr><th>Nombre</th><th>Acceso</th><th>PIN</th></tr></thead>
    <tbody>{{#each apadrinados}}<tr><td>{{nombre}}</td><td>{{acceso}}</td><td>{{pin}}</td></tr>
    {{else}}<tr><td colspan="3">Sin cuentas apadrinadas.</td></tr>{{/each}}</tbody>
  </table>
  {{/if}}
  ${ACTIVIDAD}
</body></html>`;

export const PLANTILLA_INFORME_EXCEL = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><style>
  td, th { font-family: Calibri, sans-serif; font-size: 12px; padding: 5px; border: 1px solid #cbd5e1; width: 180px; vertical-align: top; white-space: pre-wrap; }
  th { background-color: #e2e8f0; font-weight: bold; }
</style></head><body>
  <table data-sheet-name="Mi cuenta">
    <tr><th colspan="2">Informe personal — EMERGEN</th></tr>
    <tr><td>Generado (Chile)</td><td>{{generado}}</td></tr>
    <tr><td>Nombre</td><td>{{usuario.nombre}}</td></tr>
    <tr><td>Correo</td><td>{{usuario.correo}}</td></tr>
    <tr><td>Tipo de cuenta</td><td>{{usuario.tipo}}</td></tr>
    <tr><td>Acceso</td><td>{{usuario.acceso}}</td></tr>
    <tr><td>Premium</td><td>{{usuario.premium}}</td></tr>
  </table>
  {{#if principal}}
  <table data-sheet-name="Apadrinados">
    <tr><th>Nombre</th><th>Acceso</th></tr>
    {{#each apadrinados}}<tr><td>{{nombre}}</td><td>{{acceso}}</td></tr>
    {{else}}<tr><td colspan="2">Sin cuentas apadrinadas.</td></tr>{{/each}}
  </table>
  {{/if}}
  ${ACTIVIDAD}
</body></html>`;
