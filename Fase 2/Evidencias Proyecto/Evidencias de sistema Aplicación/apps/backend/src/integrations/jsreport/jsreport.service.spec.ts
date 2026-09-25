import { BadGatewayException, Logger } from '@nestjs/common';
import { JsreportService } from './jsreport.service';

describe('JsreportService', () => {
  const originalEnv = { ...process.env };
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    process.env.JSREPORT_URL = 'http://jsreport.local:5488/';
    process.env.JSREPORT_USERNAME = 'admin';
    process.env.JSREPORT_PASSWORD = 'pass';
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('envía la plantilla y devuelve el PDF', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(Buffer.from('%PDF-1.7'), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      }),
    );

    const report = await new JsreportService().renderTemplate(
      'alertas-mensual',
      { total: 3 },
    );

    expect(report.contentType).toBe('application/pdf');
    expect(report.content.toString()).toBe('%PDF-1.7');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://jsreport.local:5488/api/report');
    expect(JSON.parse(init.body as string)).toEqual({
      template: { name: 'alertas-mensual' },
      data: { total: 3 },
    });
    expect(init.headers.Authorization).toBe(
      `Basic ${Buffer.from('admin:pass').toString('base64')}`,
    );
  });

  it('usa localhost:5488 y omite Authorization si no hay credenciales', async () => {
    delete process.env.JSREPORT_URL;
    delete process.env.JSREPORT_PASSWORD;
    fetchMock.mockResolvedValueOnce(
      new Response('%PDF', {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      }),
    );

    await new JsreportService().renderTemplate('x', {});

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:5488/api/report');
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('renderInline aplica handlebars + chrome-pdf y asume PDF sin Content-Type', async () => {
    // Body binario: a diferencia de un string, no agrega Content-Type por defecto.
    fetchMock.mockResolvedValueOnce(
      new Response(Buffer.from('%PDF'), { status: 200 }),
    );

    const report = await new JsreportService().renderInline(
      { content: '<h1>{{titulo}}</h1>' },
      { titulo: 'Hola' },
    );

    expect(
      JSON.parse(fetchMock.mock.calls[0][1].body as string).template,
    ).toEqual({
      engine: 'handlebars',
      recipe: 'chrome-pdf',
      content: '<h1>{{titulo}}</h1>',
    });
    expect(report.contentType).toBe('application/pdf');
  });

  it('usa 60 s de timeout (Chrome tarda en renderizar)', async () => {
    const timeout = jest.spyOn(AbortSignal, 'timeout');
    fetchMock.mockResolvedValueOnce(new Response('%PDF', { status: 200 }));
    await new JsreportService().renderTemplate('x', {});
    expect(timeout).toHaveBeenCalledWith(60_000);
  });

  it.each([401, 404, 500])(
    'responde 502 si jsReport devuelve HTTP %i',
    async (status) => {
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
      fetchMock.mockResolvedValueOnce(new Response('error', { status }));
      await expect(
        new JsreportService().renderTemplate('no-existe', {}),
      ).rejects.toBeInstanceOf(BadGatewayException);
    },
  );
});
