import { BadGatewayException, HttpException } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import type { JsreportService } from '../integrations/jsreport/jsreport.service';
import { AdminTicketsService, type TicketCerrado } from './admin-tickets.service';
import { reportLimit } from '../config/security';

describe('Informe de tickets cerrados', () => {
  let query: jest.Mock;
  let renderInline: jest.Mock;
  let service: AdminTicketsService;
  const ticket: TicketCerrado = {
    ticket_id: 42, estado: 'CERRADO', usuario_id: 9,
    nombre_usuario: 'Emisor', correo_usuario: 'emisor@emergen.test',
    categoria: 'Cuenta', descripcion: 'No puedo acceder\nDesde ayer',
    solucion: 'Acceso restablecido', trabajador_id: 12,
    trabajador_nombre: 'Trabajadora', trabajador_correo: 'trabajadora@emergen.test',
  };

  beforeEach(() => {
    query = jest.fn().mockResolvedValue([ticket]);
    renderInline = jest.fn();
    service = new AdminTicketsService(
      { query } as unknown as DataSource,
      { renderInline } as unknown as JsreportService,
    );
  });

  it.each(['pdf', 'xlsx'] as const)('incluye emisor, descripción, solución y autor en %s con tope de filas (sin truncado silencioso)', async (formato) => {
    const reporte = formato === 'pdf'
      ? { content: Buffer.from('%PDF-1.7'), contentType: 'application/pdf' }
      : { content: Buffer.from([0x50, 0x4b, 0x03, 0x04]), contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    renderInline.mockResolvedValue(reporte);
    expect(await service.generarReporte(formato)).toBe(reporte);
    const sql = query.mock.calls[0][0] as string;
    expect(sql).toMatch(/WHERE UPPER\(e.estado_ticket\) = 'CERRADO'/);
    // PRE-SEC-006: el informe se acota en el servidor; el tope es reportLimit()+1 para detectar
    // desbordamiento y fallar con 413 en vez de truncar en silencio (ver caso de desbordamiento).
    expect(sql).toMatch(/\bLIMIT\b/i);
    expect(query.mock.calls[0][1]).toEqual([reportLimit() + 1]);
    const [plantilla, datos] = renderInline.mock.calls[0];
    expect(plantilla).toMatchObject(formato === 'xlsx'
      ? { recipe: 'html-to-xlsx' }
      : { chrome: { landscape: true } });
    expect(datos).toMatchObject({ total: 1, tickets: [ticket] });
    for (const campo of ['descripcion', 'solucion', 'nombre_usuario', 'correo_usuario', 'trabajador_nombre', 'trabajador_correo']) {
      expect(plantilla.content).toContain(`{{${campo}}}`);
      expect(plantilla.content).not.toContain(`{{{${campo}}}`);
    }
  });

  it('no atribuye respuestas antiguas a un trabajador inventado', async () => {
    query.mockResolvedValue([{ ...ticket, solucion: null, trabajador_id: null, trabajador_nombre: null, trabajador_correo: null }]);
    renderInline.mockResolvedValue({ content: Buffer.from('%PDF-1.7'), contentType: 'application/pdf' });
    await service.generarReporte();
    expect(renderInline.mock.calls[0][1].tickets[0]).toMatchObject({
      solucion: 'Sin solución registrada', trabajador_nombre: 'Sin trabajador registrado', trabajador_id: null,
    });
  });

  it('rechaza con 413 cuando los tickets cerrados superan el tope (sin truncar en silencio)', async () => {
    const exceso = Array.from({ length: reportLimit() + 1 }, (_, i) => ({ ...ticket, ticket_id: i }));
    query.mockResolvedValue(exceso);
    await expect(service.generarReporte()).rejects.toMatchObject({ status: 413 });
    await expect(service.generarReporte()).rejects.toBeInstanceOf(HttpException);
    expect(renderInline).not.toHaveBeenCalled();
  });

  it('permite un informe vacío sin inventar tickets', async () => {
    query.mockResolvedValue([]);
    renderInline.mockResolvedValue({ content: Buffer.from('%PDF-1.7'), contentType: 'application/pdf' });
    await service.generarReporte();
    expect(renderInline.mock.calls[0][1]).toMatchObject({ total: 0, tickets: [] });
  });

  it.each(['pdf', 'xlsx'] as const)('rechaza un error HTML recibido en lugar del archivo %s', async (formato) => {
    renderInline.mockResolvedValue({ content: Buffer.from('<html>Error</html>'), contentType: 'text/html' });
    await expect(service.generarReporte(formato)).rejects.toBeInstanceOf(BadGatewayException);
  });
});
