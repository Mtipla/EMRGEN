/** HU-19 / RF22. Plantilla del servidor: Handlebars escapa nombres y correos. */
export const PLANTILLA_INFORME = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; margin: 24px; font-size: 12px; color: #1f2937; }
  h1 { font-size: 20px; margin-bottom: 6px; }
  h2 { font-size: 15px; margin-top: 24px; }
  .meta { color: #475569; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 7px; border: 1px solid #cbd5e1; text-align: left; overflow-wrap: anywhere; }
  th { background: #f1f5f9; width: 30%; }
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
    <thead><tr><th>Nombre</th><th>Correo</th><th>Acceso</th><th>PIN</th></tr></thead>
    <tbody>{{#each apadrinados}}<tr><td>{{nombre}}</td><td>{{correo}}</td><td>{{acceso}}</td><td>{{pin}}</td></tr>
    {{else}}<tr><td colspan="4">Sin cuentas apadrinadas.</td></tr>{{/each}}</tbody>
  </table>
  {{/if}}
</body></html>`;
