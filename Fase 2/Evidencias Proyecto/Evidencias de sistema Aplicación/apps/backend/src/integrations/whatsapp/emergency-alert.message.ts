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
  senderEmail,
  occurredAt,
  emergencyType,
  message,
  location,
  locationLabel,
  medicalInfo,
}: Omit<SendEmergencyAlertRequest, 'recipients'>): string {
  const date = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(occurredAt ?? Date.now()));
  const place = location
    ? [locationLabel ?? location.address, googleMapsLink(location)]
        .filter(Boolean)
        .join(' · ')
    : (locationLabel ?? 'No disponible');
  const lines = [
    'MENSAJE MEDIANTE APLICACIÓN EMERGEN',
    '',
    `El usuario ${senderName ?? 'de EMERGEN'} de correo ${senderEmail ?? 'no informado'} ha generado una alerta`,
    '',
    `TIPO DE EMERGENCIA: ${emergencyType ?? 'No informado'}`,
    `FECHA/HORA: ${date} (America/Santiago)`,
    `UBICACIÓN: ${place}`,
    `"${message}"`,
    '',
    'ANTECEDENTES MÉDICOS:',
  ];
  const ficha = medicalInfo?.record;
  if (ficha) {
    const value = (text: string) => text.trim() || 'No informado';
    lines.push(
      `Tipo de sangre: ${value(ficha.tipo_sangre)}`,
      `Alergias: ${value(ficha.alergias)}`,
      `Enfermedades crónicas: ${value(ficha.enfermedades_cronicas)}`,
      `Medicamentos actuales: ${value(ficha.medicamentos_actuales)}`,
      `Discapacidad: ${value(ficha.discapacidad_presente)}`,
      `Donante de órganos: ${ficha.donante_organos ? 'Sí' : 'No'}`,
    );
  } else {
    lines.push(medicalInfo?.summary || 'Sin antecedentes registrados.');
  }
  return lines.join('\n');
}

export function buildFinalizedAlertText({
  senderName,
  senderEmail,
}: Pick<SendEmergencyAlertRequest, 'senderName' | 'senderEmail'>): string {
  return [
    'MENSAJE MEDIANTE APLICACIÓN EMERGEN',
    '',
    `La alerta reciente del usuario ${senderName ?? 'de EMERGEN'} de correo ${senderEmail ?? 'no informado'}, ha sido FINALIZADA`,
  ].join('\n');
}

/** Acepta el formato que guarda el móvil; nunca inventa coordenadas. */
export function parseAlertLocation(
  value: string | null,
): EmergencyAlertLocation | undefined {
  const match = /^(?:SIMULADA: )?(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/.exec(
    value ?? '',
  );
  if (!match) return undefined;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : undefined;
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
