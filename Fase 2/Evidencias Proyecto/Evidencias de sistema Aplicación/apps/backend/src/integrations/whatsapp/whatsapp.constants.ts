import { readEnv } from '../../config/env';

export const INTEGRATION = 'WhatsApp';

/** Máximo de contactos de emergencia por usuario (CA-03.2). */
export const MAX_RECIPIENTS = 5;

/**
 * Carpeta por defecto del estado de sesión, relativa al cwd del backend (apps/backend,
 * o /app/apps/backend en Docker). Contiene las llaves de la cuenta: está excluida en
 * .gitignore y .dockerignore y NUNCA se versiona.
 */
const DEFAULT_AUTH_DIR = 'auth_info_baileys';

/** Chile: CONTACTO_EMERGENCIA.num_emergencia guarda 9 dígitos sin código de país. */
const DEFAULT_COUNTRY_CODE = '56';

export const isWhatsappEnabled = (): boolean =>
  readEnv('WHATSAPP_ENABLED')?.toLowerCase() === 'true';

export const whatsappAuthDir = (): string =>
  readEnv('WHATSAPP_AUTH_DIR') ?? DEFAULT_AUTH_DIR;

export const defaultCountryCode = (): string =>
  readEnv('WHATSAPP_DEFAULT_COUNTRY_CODE') ?? DEFAULT_COUNTRY_CODE;
