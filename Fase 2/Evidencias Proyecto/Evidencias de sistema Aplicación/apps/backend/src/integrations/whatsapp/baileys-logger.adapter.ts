import type { Logger } from '@nestjs/common';
import type { UserFacingSocketConfig } from '@whiskeysockets/baileys';

/** Interfaz de logger (estilo pino) que recibe makeWASocket. */
type ILogger = NonNullable<UserFacingSocketConfig['logger']>;

const LEVELS = ['trace', 'debug', 'info', 'warn', 'error'] as const;
type Level = (typeof LEVELS)[number];

/**
 * Adapta el logger estilo pino que exige Baileys al Logger de Nest.
 * Solo escribe evento y nivel: mensajes, errores y objetos de Baileys pueden
 * contener material de sesión o datos personales y nunca se serializan.
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

    // Strict field allowlist: transport messages/errors can contain session material.
    const text = { event: 'whatsapp_transport', level };

    if (level === 'error') this.logger.error(text);
    else if (level === 'warn') this.logger.warn(text);
    else this.logger.debug(text);
  }
}
