import { Readable } from 'node:stream';
import type { Request, Response } from 'express';
import { boundedJson, completeRows, validateStructure, WindowBudget } from './security';

const parse = (chunks: string[], maximum = 32) => new Promise<{ status: number; body?: unknown }>(resolve => {
  const req = Readable.from(chunks.map(s => Buffer.from(s))) as Request;
  Object.assign(req, { originalUrl: '/synthetic', headers: { 'content-type': 'application/json' } });
  Object.defineProperty(req, 'query', { value: {} });
  const res = { headersSent: false, setHeader() {}, status(code: number) { this.code = code; return this; },
    code: 200, json() { this.headersSent = true; resolve({ status: this.code }); } };
  boundedJson(maximum)(req, res as unknown as Response, () => resolve({ status: 200, body: req.body }));
});

describe('presupuestos y cuerpo reales aislados', () => {
  it('acepta un contrato JSON pequeño', async () => expect(await parse(['{"ok":true}'])).toEqual({ status: 200, body: { ok: true } }));
  it('rechaza bytes chunked sin Content-Length antes del handler', async () => expect((await parse(['{"x":"', 'a'.repeat(30), '"}'])).status).toBe(413));
  it('rechaza estructura profunda sin construir un cuerpo enorme', () => {
    let value: unknown = {};
    for (let i = 0; i < 10; i++) value = { child: value };
    expect(() => validateStructure(value)).toThrow();
  });
  it('cuota con reloj falso: permite, rechaza y libera sin carga', () => {
    let now = 1000;
    const budget = new WindowBudget(() => now, 1);
    expect(budget.allow('synthetic', 1, 1000)).toBe(true);
    expect(budget.allow('synthetic', 1, 1000)).toBe(false);
    now = 2001;
    expect(budget.allow('synthetic', 1, 1000)).toBe(true);
  });
  it('un reporte excesivo se rechaza y no se presenta truncado', () => {
    const before = process.env.API_REPORT_MAX_ROWS;
    process.env.API_REPORT_MAX_ROWS = '2';
    try { expect(() => completeRows([1, 2, 3])).toThrow(); }
    finally { if (before === undefined) delete process.env.API_REPORT_MAX_ROWS; else process.env.API_REPORT_MAX_ROWS = before; }
  });
});
