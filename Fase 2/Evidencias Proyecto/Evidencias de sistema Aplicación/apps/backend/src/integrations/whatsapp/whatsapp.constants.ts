import { readEnv } from '../../config/env';

export const INTEGRATION = 'WhatsApp';

export const MAX_RECIPIENTS = 5;

const DEFAULT_AUTH_DIR = 'auth_info_baileys';

const DEFAULT_COUNTRY_CODE = '56';

export const isWhatsappEnabled = (): boolean =>
  readEnv('WHATSAPP_ENABLED')?.toLowerCase() === 'true';

export const whatsappAuthDir = (): string =>
  readEnv('WHATSAPP_AUTH_DIR') ?? DEFAULT_AUTH_DIR;

export const defaultCountryCode = (): string =>
  readEnv('WHATSAPP_DEFAULT_COUNTRY_CODE') ?? DEFAULT_COUNTRY_CODE;
