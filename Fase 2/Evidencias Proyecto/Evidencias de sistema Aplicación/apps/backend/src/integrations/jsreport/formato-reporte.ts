import { BadGatewayException } from '@nestjs/common';
import type { InlineReportTemplate, RenderedReport } from './jsreport.service';

export type FormatoReporte = 'pdf' | 'xlsx';

export function plantillaReporte(
  formato: FormatoReporte,
  pdf: string,
  excel: string,
): InlineReportTemplate {
  return formato === 'xlsx'
    ? { content: excel, recipe: 'html-to-xlsx' }
    : { content: pdf, chrome: { landscape: true } };
}

/** Evita descargar un error HTML o un documento con una extensión incorrecta. */
export function validarReporte(
  reporte: RenderedReport,
  formato: FormatoReporte,
): void {
  const excel = formato === 'xlsx';
  const tipo = excel
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'application/pdf';
  const firmaValida = excel
    ? reporte.content.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
    : reporte.content.subarray(0, 5).toString() === '%PDF-';
  if (!reporte.contentType.toLowerCase().includes(tipo) || !firmaValida) {
    throw new BadGatewayException(
      `jsReport no devolvió un ${excel ? 'Excel' : 'PDF'} válido. Intenta nuevamente.`,
    );
  }
}
