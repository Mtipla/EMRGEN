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
    fetchMock.mockRestore();
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
});
