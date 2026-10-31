import { Injectable } from '@nestjs/common';
import { readEnv } from '../../config/env';
import { boundedExternalBody, requestExternal } from '../http-client';

const INTEGRATION = 'jsReport';
const DEFAULT_URL = 'http://localhost:5488';

/** Plantilla definida en el propio request (útil desde otros servicios del backend). */
export interface InlineReportTemplate {
  content: string;
  engine?: 'handlebars' | 'jsrender' | 'none';
  recipe?: 'chrome-pdf' | 'html-to-xlsx' | 'html' | 'xlsx' | 'docx';
  /** Opciones de la receta chrome-pdf (p. ej. hoja horizontal para tablas anchas). */
  chrome?: { landscape?: boolean };
}

export interface RenderedReport {
  content: Buffer;
  contentType: string;
}

/**
 * Cliente de la API HTTP de jsReport (`POST /api/report`).
 * jsReport es un servidor propio (Docker o jsreportonline.net) donde viven las plantillas;
 * el backend solo envía el nombre de la plantilla y los datos, y recibe el PDF.
 */
@Injectable()
export class JsreportService {
  /** Renderiza una plantilla guardada en el servidor jsReport. */
  renderTemplate(
    templateName: string,
    data: Record<string, unknown>,
  ): Promise<RenderedReport> {
    return this.render({ name: templateName }, data);
  }

  /**
   * Renderiza una plantilla escrita en el código. Solo para uso interno del backend:
   * nunca pasar aquí HTML recibido del cliente (Chrome lo ejecutaría en el servidor jsReport).
   */
  renderInline(
    template: InlineReportTemplate,
    data: Record<string, unknown>,
  ): Promise<RenderedReport> {
    return this.render(
      { engine: 'handlebars', recipe: 'chrome-pdf', ...template },
      data,
    );
  }

  private async render(
    template: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<RenderedReport> {
    const baseUrl = (readEnv('JSREPORT_URL') ?? DEFAULT_URL).replace(
      /\/+$/,
      '',
    );
    const response = await requestExternal(
      INTEGRATION,
      `${baseUrl}/api/report`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.authHeader() },
        body: JSON.stringify({ template, data }),
        timeoutMs: 60_000,
      },
    );

    return {
      content: Buffer.from(await boundedExternalBody(response, 16_777_216)),
      contentType: response.headers.get('content-type') ?? 'application/pdf',
    };
  }

  /** La autenticación es opcional: solo se usa si el servidor jsReport la tiene activada. */
  private authHeader(): Record<string, string> {
    const username = readEnv('JSREPORT_USERNAME');
    const password = readEnv('JSREPORT_PASSWORD');
    if (!username || !password) return {};
    return {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    };
  }
}
