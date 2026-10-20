import type {
  EmergencyAlertLocation,
  SendEmergencyAlertRequest,
} from '@repo/api-types';
import type { AnyMessageContent } from '@whiskeysockets/baileys';

export const googleMapsLink = ({ lat, lng }: EmergencyAlertLocation): string =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/**
 * Texto de la alerta. Lleva el link de Google Maps aunque después se envíe el pin
 * nativo, para que la ubicación llegue aunque falle el segundo mensaje.
 */
export function buildEmergencyAlertText({
  senderName,
  message,
  location,
  medicalInfo,
}: Omit<SendEmergencyAlertRequest, 'recipients'>): string {
  const lines = [
    '🚨 *ALERTA DE EMERGENCIA* 🚨',
    senderName
      ? `*${senderName}* activó una alerta en EMERGEN y te tiene como contacto de emergencia.`
      : 'Un usuario de EMERGEN te tiene como contacto de emergencia y activó una alerta.',
    '',
    `💬 *Mensaje:* ${message}`,
    '',
    `📍 *Ubicación:*${location.address ? ` ${location.address}` : ''}`,
    googleMapsLink(location),
  ];

  if (medicalInfo?.summary || medicalInfo?.url) {
    lines.push('');
    if (medicalInfo.summary) lines.push(`🩺 *Información médica:* ${medicalInfo.summary}`);
    if (medicalInfo.url) lines.push(`🔗 *Ficha médica:* ${medicalInfo.url}`);
  }

  // RF14: se muestran los números oficiales sin afirmar que fueron notificados.
  lines.push(
    '',
    '_Números de emergencia en Chile: SAMU 131 · Bomberos 132 · Carabineros 133._',
  );
  return lines.join('\n');
}

/** Pin de ubicación nativo de WhatsApp. */
export const buildLocationMessage = (
  location: EmergencyAlertLocation,
): AnyMessageContent => ({
  location: {
    degreesLatitude: location.lat,
    degreesLongitude: location.lng,
    name: 'Ubicación de la emergencia',
    address: location.address,
  },
});
