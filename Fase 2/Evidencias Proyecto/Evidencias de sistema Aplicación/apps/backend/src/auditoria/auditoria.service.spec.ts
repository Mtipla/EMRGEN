import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { JsreportService } from '../integrations/jsreport/jsreport.service';
import { AuditoriaService, EntradaBitacora, EventoAuditado } from './auditoria.service';
import { BitacoraSistema } from './bitacora.entity';

describe('AuditoriaService', () => {
  const ADMIN = { sub: 1, rol_ID: 1 };
  let renderInline: jest.Mock;
  let transaction: jest.Mock;
  /** Manager del repositorio (fuera de transacción) y manager de la transacción. */
  let managerBase: EntityManager;
  let managerTransaccion: EntityManager;
  let service: AuditoriaService;

  const evento: EventoAuditado = {
    actor: ADMIN,
    accion: 'Cambio de estado del usuario 7 a 2',
    tipo: 'MODIFICACION',
    entidad: 'USUARIO',
    usuario_afectado_ID: 7,
  };

  const entrada: EntradaBitacora = {
    bitacora_sistema_ID: 5,
    // 15:00 UTC = 12:00 en Chile (horario de verano, UTC-3).
    fecha_accion: new Date('2026-09-30T15:00:00.000Z'),
    accion_realizada: 'Cambio de estado del usuario 7 a 2',
    tipo_accion: 'MODIFICACION',
    entidad_afectada: 'USUARIO',
    resultado: 'EXITOSA',
    cambios: { estado_ID: { antes: 1, despues: 2 } },
    usuario_ID: 1,
    nombre_usuario: 'Admin',
    rol_actor_ID: 1,
    usuario_afectado_ID: 7,
    nombre_usuario_afectado: 'Juan',
    aplicacion_ID: 3,
    origen_aplicacion: 'ESCRITORIO',
  };

  beforeEach(() => {
    renderInline = jest.fn();
    managerTransaccion = { nombre: 'transaccion' } as unknown as EntityManager;
    transaction = jest.fn((trabajo: (m: EntityManager) => Promise<unknown>) =>
      trabajo(managerTransaccion),
    );
    managerBase = { connection: { transaction } } as unknown as EntityManager;
    service = new AuditoriaService(
      { manager: managerBase } as unknown as Repository<BitacoraSistema>,
      { renderInline } as unknown as JsreportService,
    );
  });

  describe('registrar', () => {
    it('inserta actor, rol, afectado y cambios con la hora UTC de PostgreSQL y la acción completa', async () => {
      const insert = {
        insert: () => insert,
        into: () => insert,
        values: jest.fn(() => insert),
        execute: jest.fn(),
      };
      const values = insert.values;
      const manager = { createQueryBuilder: () => insert } as unknown as EntityManager;

      await service.registrar(manager, {
        ...evento,
        accion: 'x'.repeat(200),
        cambios: { estado_ID: { antes: 1, despues: 2 } },
      });

      const [fila] = values.mock.calls[0] as [Record<string, unknown>];
      expect(fila).toMatchObject({
        usuario_ID: 1,
        rol_actor_ID: 1,
        usuario_afectado_ID: 7,
        tipo_accion: 'MODIFICACION',
        entidad_afectada: 'USUARIO',
        resultado: 'EXITOSA',
        aplicacion_ID: 3,
        cambios: { estado_ID: { antes: 1, despues: 2 } },
      });
      expect(fila.accion_realizada).toHaveLength(200);
      expect((fila.fecha_accion as () => string)()).toBe("now()");
      expect(insert.execute).toHaveBeenCalled();
    });
  });

  describe('auditar', () => {
    let registrar: jest.SpyInstance;

    beforeEach(() => {
      registrar = jest.spyOn(service, 'registrar').mockResolvedValue();
    });

    it('registra la acción con el manager de la misma transacción que la aplica', async () => {
      const operacion = jest.fn().mockResolvedValue({
        valor: 'ok',
        cambios: { estado_ID: { antes: 1, despues: 2 } },
      });

      await expect(service.auditar(evento, operacion)).resolves.toBe('ok');

      expect(operacion).toHaveBeenCalledWith(managerTransaccion);
      expect(registrar).toHaveBeenCalledTimes(1);
      expect(registrar).toHaveBeenCalledWith(managerTransaccion, {
        ...evento,
        cambios: { estado_ID: { antes: 1, despues: 2 } },
      });
    });

    it('la operación puede precisar el evento (tipo, descripción y usuario afectado)', async () => {
      await service.auditar({ ...evento, usuario_afectado_ID: undefined }, () =>
        Promise.resolve({ valor: 1, tipo: 'CREACION', accion: 'Alta', usuario_afectado_ID: 9 }),
      );

      expect(registrar).toHaveBeenCalledWith(
        managerTransaccion,
        expect.objectContaining({ tipo: 'CREACION', accion: 'Alta', usuario_afectado_ID: 9 }),
      );
    });

    it('si la operación falla la registra como FALLIDA, fuera de la transacción, y propaga el error', async () => {
      const error = new NotFoundException('El usuario no existe en la base de datos');

      await expect(service.auditar(evento, () => Promise.reject(error))).rejects.toBe(error);

      expect(registrar).toHaveBeenCalledTimes(1);
      expect(registrar).toHaveBeenCalledWith(managerBase, {
        ...evento,
        accion: 'Cambio de estado del usuario 7 a 2: El usuario no existe en la base de datos',
        resultado: 'FALLIDA',
        usuario_afectado_ID: null,
      });
    });

    it('no copia a la bitácora el detalle de un error interno', async () => {
      await expect(
        service.auditar(evento, () => Promise.reject(new Error('password authentication failed'))),
      ).rejects.toThrow('password authentication failed');

      expect(registrar).toHaveBeenCalledWith(
        managerBase,
        expect.objectContaining({
          accion: 'Cambio de estado del usuario 7 a 2: error interno',
          resultado: 'FALLIDA',
        }),
      );
    });

    it('si falla el registro, la operación no se da por aplicada', async () => {
      registrar.mockRejectedValueOnce(new Error('bitácora caída'));

      await expect(
        service.auditar(evento, () => Promise.resolve({ valor: 'ok' })),
      ).rejects.toThrow('bitácora caída');
    });
  });

  describe('generarReporte', () => {
    it('envía a jsReport el actor, el afectado y los cambios, con fechas en hora de Chile', async () => {
      jest.spyOn(service, 'listar').mockResolvedValueOnce([entrada]);
      renderInline.mockResolvedValueOnce({
        content: Buffer.from('%PDF-1.7'),
        contentType: 'application/pdf',
      });

      const reporte = await service.generarReporte({ usuario_afectado_ID: 7 });

      expect(reporte.contentType).toBe('application/pdf');
      const [plantilla, datos] = renderInline.mock.calls[0];
      expect(plantilla.content).toContain('{{#each entradas}}');
      expect(datos.total).toBe(1);
      expect(datos.filtros).toContain('usuario afectado 7');
      expect(datos.entradas[0]).toMatchObject({
        bitacora_sistema_ID: 5,
        actor: 'Admin',
        rol: 'ADMINISTRADOR',
        afectado: '7 - Juan',
        tipo: 'MODIFICACION',
        entidad: 'USUARIO',
        aplicacion: 'ESCRITORIO',
        resultado: 'EXITOSA',
        fallida: false,
        cambios: ['estado_ID: 1 → 2'],
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

    it('genera Excel con los mismos filtros y datos, conservando los cambios de auditoría', async () => {
      const listar = jest.spyOn(service, 'listar').mockResolvedValueOnce([entrada]);
      renderInline.mockResolvedValueOnce({
        content: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      await service.generarReporte({ usuario_afectado_ID: 7, limite: 10 }, 'xlsx');
      expect(listar).toHaveBeenCalledWith({ usuario_afectado_ID: 7, limite: 10 });
      const [plantilla, datos] = renderInline.mock.calls[0];
      expect(plantilla.recipe).toBe('html-to-xlsx');
      expect(plantilla.content).toContain('data-sheet-name="Bitacora"');
      expect(datos.entradas[0]).toMatchObject({
        bitacora_sistema_ID: 5,
        actor: 'Admin',
        cambios: ['estado_ID: 1 → 2'],
      });
    });

    it('rechaza un PDF cuando se solicitó Excel', async () => {
      jest.spyOn(service, 'listar').mockResolvedValueOnce([]);
      renderInline.mockResolvedValueOnce({
        content: Buffer.from('%PDF-1.7'),
        contentType: 'application/pdf',
      });
      await expect(service.generarReporte({}, 'xlsx')).rejects.toThrow('Excel válido');
    });
  });

  describe('exportarReporte', () => {
    it('registra el formato Excel en la exportación exitosa y en el intento fallido', async () => {
      const registrar = jest.spyOn(service, 'registrar').mockResolvedValue();
      jest.spyOn(service, 'generarReporte')
        .mockResolvedValueOnce({ content: Buffer.from('xlsx'), contentType: 'application/octet-stream' })
        .mockRejectedValueOnce(new BadGatewayException('jsReport: sin respuesta'));
      await service.exportarReporte({}, ADMIN, 'xlsx');
      expect(registrar).toHaveBeenLastCalledWith(managerBase, expect.objectContaining({
        accion: 'Exportación de la bitácora a Excel',
        tipo: 'EXPORTACION',
      }));
      await expect(service.exportarReporte({}, ADMIN, 'xlsx')).rejects.toBeInstanceOf(BadGatewayException);
      expect(registrar).toHaveBeenLastCalledWith(managerBase, expect.objectContaining({
        accion: 'Exportación de la bitácora a Excel: jsReport: sin respuesta',
        resultado: 'FALLIDA',
      }));
    });

    it('registra la exportación solo cuando el PDF se generó', async () => {
      const registrar = jest.spyOn(service, 'registrar').mockResolvedValue();
      const generar = jest.spyOn(service, 'generarReporte');
      generar.mockRejectedValueOnce(new BadGatewayException('jsReport: sin respuesta'));
      generar.mockResolvedValueOnce({ content: Buffer.from('%PDF'), contentType: 'application/pdf' });

      await expect(service.exportarReporte({}, ADMIN)).rejects.toBeInstanceOf(BadGatewayException);
      expect(registrar).toHaveBeenLastCalledWith(
        managerBase,
        expect.objectContaining({ tipo: 'EXPORTACION', resultado: 'FALLIDA' }),
      );

      await service.exportarReporte({ usuario_afectado_ID: 7 }, ADMIN);
      expect(registrar).toHaveBeenLastCalledWith(managerBase, {
        actor: ADMIN,
        accion: 'Exportación de la bitácora a PDF',
        tipo: 'EXPORTACION',
        entidad: 'BITACORA_SISTEMA',
        usuario_afectado_ID: 7,
      });
    });
  });
});
