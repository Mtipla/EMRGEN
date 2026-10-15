import { BadGatewayException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { JsreportService } from '../integrations/jsreport/jsreport.service';
import { AuditoriaService, EntradaBitacora } from './auditoria.service';
import { BitacoraSistema } from './bitacora.entity';

describe('AuditoriaService', () => {
  let renderInline: jest.Mock;
  let service: AuditoriaService;

  const entrada: EntradaBitacora = {
    bitacora_sistema_ID: 5,
    // 15:00 UTC = 12:00 en Chile (horario de verano, UTC-3).
    fecha_accion: new Date('2026-09-30T15:00:00.000Z'),
    accion_realizada: 'Cambio de estado del usuario 7 a 3',
    usuario_ID: 1,
    nombre_usuario: 'Admin',
    aplicacion_ID: 3,
    origen_aplicacion: 'ESCRITORIO',
  };

  beforeEach(() => {
    renderInline = jest.fn();
    service = new AuditoriaService(
      {} as Repository<BitacoraSistema>,
      { renderInline } as unknown as JsreportService,
    );
  });

  describe('registrar', () => {
    it('inserta con la hora UTC de PostgreSQL, aplicación escritorio por defecto y acción recortada a 150', async () => {
      const insert = {
        insert: () => insert,
        into: () => insert,
        values: jest.fn(() => insert),
        execute: jest.fn(),
      };
      const values = insert.values;
      const manager = { createQueryBuilder: () => insert } as unknown as EntityManager;

      await service.registrar(manager, { usuario_ID: 1, accion: 'x'.repeat(200) });

      const [fila] = values.mock.calls[0] as [Record<string, unknown>];
      expect(fila).toMatchObject({ usuario_ID: 1, aplicacion_ID: 3 });
      expect(fila.accion_realizada).toHaveLength(150);
      expect((fila.fecha_accion as () => string)()).toBe("timezone('UTC', now())");
      expect(insert.execute).toHaveBeenCalled();
    });
  });

  describe('generarReporte', () => {
    it('envía a jsReport la bitácora con fechas en hora de Chile', async () => {
      jest.spyOn(service, 'listar').mockResolvedValueOnce([entrada]);
      renderInline.mockResolvedValueOnce({
        content: Buffer.from('%PDF-1.7'),
        contentType: 'application/pdf',
      });

      const reporte = await service.generarReporte({ usuario_ID: 1 });

      expect(reporte.contentType).toBe('application/pdf');
      const [plantilla, datos] = renderInline.mock.calls[0];
      expect(plantilla.content).toContain('{{#each entradas}}');
      expect(datos.total).toBe(1);
      expect(datos.filtros).toContain('usuario 1');
      expect(datos.entradas[0]).toMatchObject({
        bitacora_sistema_ID: 5,
        usuario: 'Admin',
        aplicacion: 'ESCRITORIO',
      });
      expect(datos.entradas[0].fecha).toContain('12:00:00');
    });

    it('si jsReport no responde, devuelve 502 indicando la alternativa JSON', async () => {
      jest.spyOn(service, 'listar').mockResolvedValueOnce([]);
      renderInline.mockRejectedValueOnce(
        new BadGatewayException('jsReport: no se pudo contactar al proveedor.'),
      );

      const error: unknown = await service.generarReporte().catch((e: unknown) => e);

      expect(error).toBeInstanceOf(BadGatewayException);
      expect((error as Error).message).toContain('GET /admin/auditoria');
    });
  });
});
