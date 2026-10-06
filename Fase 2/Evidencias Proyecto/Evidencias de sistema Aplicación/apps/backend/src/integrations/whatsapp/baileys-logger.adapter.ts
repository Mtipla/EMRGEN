import type { Logger } from '@nestjs/common';
import type { UserFacingSocketConfig } from '@whiskeysockets/baileys';

/** Interfaz de logger (estilo pino) que recibe makeWASocket. */
type ILogger = NonNullable<UserFacingSocketConfig['logger']>;

const LEVELS = ['trace', 'debug', 'info', 'warn', 'error'] as const;
type Level = (typeof LEVELS)[number];

/**
 * Adapta el logger estilo pino que exige Baileys al Logger de Nest.
 * Solo se escriben el mensaje y el texto de los errores: los objetos que adjunta Baileys
 * pueden contener llaves de la sesión o números de teléfono, así que nunca se serializan.
 */
export class BaileysLoggerAdapter implements ILogger {
  constructor(
    private readonly logger: Logger,
    public level: string = 'warn',
  ) {}

  child(): ILogger {
    return this;
  }

  trace(obj: unknown, msg?: string): void {
    this.write('trace', obj, msg);
  }

  debug(obj: unknown, msg?: string): void {
    this.write('debug', obj, msg);
  }

  info(obj: unknown, msg?: string): void {
    this.write('info', obj, msg);
  }

  warn(obj: unknown, msg?: string): void {
    this.write('warn', obj, msg);
  }

  error(obj: unknown, msg?: string): void {
    this.write('error', obj, msg);
  }

  private write(level: Level, obj: unknown, msg?: string): void {
    const minimum = LEVELS.indexOf(this.level as Level);
    if (LEVELS.indexOf(level) < (minimum === -1 ? LEVELS.indexOf('warn') : minimum))
      return;

    const message = typeof obj === 'string' ? obj : (msg ?? '');
    const error = obj instanceof Error ? obj : (obj as { err?: unknown } | null)?.err;
    const text = error instanceof Error ? `${message} (${error.message})` : message;
    if (!text) return;

    if (level === 'error') this.logger.error(text);
    else if (level === 'warn') this.logger.warn(text);
    else this.logger.debug(text);
  }
}
