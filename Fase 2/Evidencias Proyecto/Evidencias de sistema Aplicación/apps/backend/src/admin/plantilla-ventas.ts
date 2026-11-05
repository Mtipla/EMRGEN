/** Plantilla del servidor: Handlebars escapa los textos de usuarios, planes y filtros. */
export const PLANTILLA_VENTAS = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; margin: 24px; font-size: 10px; color: #1f2937; }
  h1 { font-size: 20px; margin-bottom: 6px; }
  .meta { color: #475569; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th, td { padding: 7px; border: 1px solid #cbd5e1; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
  th { background: #f1f5f9; }
  .importe { white-space: nowrap; text-align: right; }
  .secundario { color: #64748b; margin-top: 3px; }
</style></head><body>
  <h1>Ventas realizadas — EMERGEN</h1>
  <p class="meta">Generado: {{generado}} (hora de Chile)<br>Filtros: {{filtros}}<br>
    Ventas registradas: {{total}} · Total pagado (CLP): {{total_pagado}}</p>
  <table><thead><tr><th>Boleta</th><th>Fecha (Chile)</th><th>Nombre</th><th>Correo</th><th>Detalle de compra</th><th>Total CLP</th><th>Método de pago</th><th>Estado</th></tr></thead><tbody>
    {{#each ventas}}<tr>
      <td>{{venta_id}}</td><td>{{fecha}}</td>
      <td>{{usuario}}{{#if usuario_id}}<div class="secundario">ID {{usuario_id}}</div>{{/if}}</td><td>{{correo}}</td>
      <td>{{#each detalles}}<div>{{descripcion}} · {{cantidad}} × {{precio}}</div>{{else}}Sin detalle registrado{{/each}}</td>
      <td class="importe">{{importe}}</td><td>{{metodo_pago}}{{#if cobro}}<div class="secundario">Monto de la orden: {{cobro}}</div>{{/if}}</td><td>{{estado}}</td>
    </tr>{{else}}<tr><td colspan="8">Sin ventas para los filtros indicados.</td></tr>{{/each}}
  </tbody></table>
  <p class="meta">El total pagado considera únicamente ventas en estado PAGADO. Los importes de las órdenes se muestran en su moneda original.</p>
</body></html>`;

/** Tablas convertidas por jsReport a hojas reales; importes y cantidades conservan su tipo numérico. */
export const PLANTILLA_VENTAS_EXCEL = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><style>
  td, th { font-family: Calibri, sans-serif; font-size: 12px; padding: 5px; border: 1px solid #cbd5e1; width: 160px; vertical-align: top; }
  th { background-color: #e2e8f0; font-weight: bold; }
  .ancho { width: 280px; white-space: pre-wrap; }
</style></head><body>
  <table data-sheet-name="Detalle de compras">
    <tr><th>Boleta</th><th>Fecha (Chile)</th><th>Nombre</th><th>Correo</th><th>Compra</th><th>Cantidad</th><th>Precio unitario (CLP)</th><th>Subtotal (CLP)</th><th>Método de pago</th><th>Estado</th></tr>
    {{#each ventas}}{{#each detalles}}<tr>
      <td data-cell-type="number">{{../venta_id}}</td><td>{{../fecha}}</td>
      <td class="ancho">{{../usuario}}</td><td class="ancho">{{../correo}}</td><td class="ancho">{{descripcion}}</td>
      <td data-cell-type="number">{{cantidad}}</td>
      <td data-cell-type="number" data-cell-format-str="#,##0">{{precio_uni}}</td>
      <td data-cell-type="number" data-cell-format-str="#,##0">{{subtotal}}</td>
      <td>{{../metodo_pago}}</td><td>{{../estado}}</td>
    </tr>{{else}}<tr>
      <td data-cell-type="number">{{venta_id}}</td><td>{{fecha}}</td><td>{{usuario}}</td><td>{{correo}}</td>
      <td>Sin detalle registrado</td><td></td><td></td><td></td><td>{{metodo_pago}}</td><td>{{estado}}</td>
    </tr>{{/each}}{{else}}<tr><td colspan="10">Sin ventas para los filtros indicados.</td></tr>{{/each}}
  </table>
  <table data-sheet-name="Ventas">
    <tr><th>Boleta</th><th>Fecha (Chile)</th><th>Nombre</th><th>Correo</th><th>Total (CLP)</th><th>Método de pago</th><th>Estado</th><th>Monto de la orden (moneda original)</th></tr>
    {{#each ventas}}<tr>
      <td data-cell-type="number">{{venta_id}}</td><td>{{fecha}}</td>
      <td class="ancho">{{usuario}}</td><td class="ancho">{{correo}}</td>
      <td data-cell-type="number" data-cell-format-str="#,##0">{{total_venta}}</td>
      <td>{{metodo_pago}}</td><td>{{estado}}</td><td>{{cobro}}</td>
    </tr>{{else}}<tr><td colspan="8">Sin ventas para los filtros indicados.</td></tr>{{/each}}
  </table>
  <table data-sheet-name="Resumen">
    <tr><th colspan="2">Ventas realizadas — EMERGEN</th></tr>
    <tr><td>Generado (Chile)</td><td>{{generado}}</td></tr>
    <tr><td>Filtros</td><td class="ancho">{{filtros}}</td></tr>
    <tr><td>Ventas registradas</td><td data-cell-type="number">{{total}}</td></tr>
    <tr><td>Total pagado (CLP)</td><td data-cell-type="number" data-cell-format-str="#,##0">{{total_pagado_clp}}</td></tr>
    <tr><td colspan="2">El total pagado considera únicamente ventas en estado PAGADO.</td></tr>
  </table>
</body></html>`;
