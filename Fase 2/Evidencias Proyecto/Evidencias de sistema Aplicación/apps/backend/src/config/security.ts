import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { finalize } from 'rxjs';

export function securityNumber(name: string, fallback: number, max = 1_000_000): number {
  const text = process.env[name];
  if (text === undefined || text === '') return fallback;
  const value = Number(text);
  if (!/^[1-9][0-9]*$/.test(text) || !Number.isSafeInteger(value) || value > max)
    throw new Error(`${name}: debe ser entero positivo, máximo ${max}`);
  return value;
}

export function validateStructure(value: unknown, maxDepth = 8, maxNodes = 1024): void {
  const pending: [unknown, number][] = [[value, 0]];
  let nodes = 0;
  while (pending.length) {
    const [item, depth] = pending.pop()!;
    if (++nodes > maxNodes || depth > maxDepth) throw new Error('Estructura JSON excesiva');
    if (item && typeof item === 'object') {
      const entries = Object.entries(item);
      if (entries.length > (Array.isArray(item) ? 100 : 128)) throw new Error('Demasiados elementos');
      for (const [key, child] of entries) {
        if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('Propiedad no admitida');
        pending.push([child, depth + 1]);
      }
    }
  }
}

/** Bounded real stream, including chunked input; no reliance on Content-Length. */
export function boundedJson(maxBytes = securityNumber('API_MAX_BODY_BYTES', 16_384, 1_048_576)) {
  return (req: Request, res: Response, next: NextFunction) => {
    const fail = (status: number, message: string) => {
      if (!res.headersSent) res.status(status).json({ statusCode: status, message, error: 'Request rejected' });
    };
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'no-store');
    if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    if (Buffer.byteLength(req.originalUrl || req.url) > 4096 || Object.keys(req.query).length > 32)
      return fail(414, 'URL o consulta demasiado extensa');
    const chunks: Buffer[] = [];
    let bytes = 0;
    let rejected = false;
    req.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        rejected = true;
        chunks.length = 0;
        fail(413, 'Cuerpo de solicitud demasiado grande');
      } else if (!rejected) chunks.push(chunk);
    });
    req.on('error', () => fail(400, 'No se pudo leer la solicitud'));
    req.on('end', () => {
      if (rejected) return;
      if (!bytes) { req.body = {}; return next(); }
      if (!/^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(req.headers['content-type'] || ''))
        return fail(415, 'Usa application/json');
      try {
        const body: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!body || typeof body !== 'object') throw new Error('JSON debe ser objeto o array');
        validateStructure(body);
        req.body = body;
      } catch { return fail(400, 'JSON inválido o estructura no admitida'); }
      next();
    });
  };
}

/** Per-process fixed windows with TTL and finite cardinality. No account lockouts. */
export class WindowBudget {
  private readonly entries = new Map<string, { until: number; count: number }>();
  private lastSweep = 0;
  constructor(private readonly clock = Date.now, private readonly capacity = 10_000) {}
  allow(key: string, maximum: number, milliseconds: number): boolean {
    const now = this.clock();
    if (now - this.lastSweep >= 1000) {
      for (const [k, item] of this.entries) if (item.until <= now) this.entries.delete(k);
      this.lastSweep = now;
    }
    let entry = this.entries.get(key);
    if (!entry || entry.until <= now) {
      if (!entry && this.entries.size >= this.capacity) return false;
      entry = { until: now + milliseconds, count: 0 };
      this.entries.set(key, entry);
    }
    if (entry.count >= maximum) return false;
    entry.count++;
    return true;
  }
}

@Injectable()
export class OperationLimitsInterceptor implements NestInterceptor {
  private readonly budget = new WindowBudget();
  private exports = 0;
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<Request & { user?: { sub: number } }>();
    const path = req.path;
    const exporting = /(?:\/reporte|\/informe)$/.test(path);
    let operation: string | undefined;
    let maximum = 0;
    let window = 60_000;
    if (req.method === 'GET' && path === '/compras/precio') {
      operation = 'public-price'; maximum = securityNumber('API_PUBLIC_PRICE_PER_MINUTE', 60);
    } else if (req.method === 'POST' && path === '/usuarios/login') {
      operation = 'login'; maximum = securityNumber('API_LOGIN_PER_MINUTE', 10);
    } else if (/^\/usuarios\/(?:registro(?:\/validar)?|password\/firebase)$/.test(path)) {
      operation = 'identity'; maximum = securityNumber('API_IDENTITY_PER_15_MINUTES', 10); window *= 15;
    } else if (/^\/usuarios\/me\/password$/.test(path)) {
      operation = 'password'; maximum = 5; window *= 15;
    } else if (/^\/(?:maps|indicators)(?:\/|$)/.test(path)) {
      operation = 'auxiliary'; maximum = securityNumber('API_AUX_PER_MINUTE', 30);
    } else if (exporting) {
      operation = 'export'; maximum = securityNumber('API_EXPORT_PER_MINUTE', 4);
    } else if (req.method === 'POST' && path.startsWith('/compras/')) {
      operation = 'purchase'; maximum = securityNumber('API_PURCHASE_PER_MINUTE', 20);
    }
    // Deliberately no global quota and no quota on SOS/closing/PIN/health/preflight.
    if (!operation) return next.handle();
    const identity = req.user ? `user:${req.user.sub}` : `peer:${req.ip || req.socket.remoteAddress}`;
    if (!this.budget.allow(`${operation}:${identity}`, maximum, window)) {
      context.switchToHttp().getResponse<Response>().setHeader('Retry-After', String(window / 1000));
      throw new HttpException('Límite de esta operación; intenta más tarde', 429);
    }
    if (exporting) {
      if (this.exports >= securityNumber('API_EXPORT_CONCURRENCY', 2, 16))
        throw new HttpException('Otro informe está en proceso; intenta más tarde', 429);
      this.exports++;
      return next.handle().pipe(finalize(() => this.exports--));
    }
    return next.handle();
  }
}

export const reportLimit = () => securityNumber('API_REPORT_MAX_ROWS', 2000, 100_000);
export function completeRows<T>(rows: T[]): T[] {
  if (rows.length > reportLimit()) throw new HttpException('El resultado supera el límite. Reduce el rango o solicita una exportación operativa al responsable.', 413);
  return rows;
}
