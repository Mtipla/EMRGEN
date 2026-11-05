import { defaultCountryCode } from './whatsapp.constants';


export const PHONE_NUMBER = /^\+?\d{8,15}$/;

/**
 * Normaliza a formato internacional sin "+" (E.164), que es lo que usa WhatsApp.
 * - "+56912345678" → "56912345678"
 * - "912345678" (número nacional, ≤ 9 dígitos) → código de país por defecto + número
 * - "56912345678" (más de 9 dígitos sin "+") → se asume que ya trae el código de país
 * Devuelve `undefined` si el número no es válido.
 */
export function normalizePhoneNumber(
  raw: string,
  countryCode: string = defaultCountryCode(),
): string | undefined {
  const value = raw.trim();
  if (!PHONE_NUMBER.test(value)) return undefined;

  const digits = value.startsWith('+')
    ? value.slice(1)
    : value.length <= 9
      ? `${countryCode}${value}`
      : value;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : undefined;
}


export const toUserJid = (digits: string): string => `${digits}@s.whatsapp.net`;


export const maskPhoneNumber = (digits: string): string =>
  digits.length <= 6
    ? '***'
    : `${digits.slice(0, 3)}${'*'.repeat(digits.length - 6)}${digits.slice(-3)}`;
