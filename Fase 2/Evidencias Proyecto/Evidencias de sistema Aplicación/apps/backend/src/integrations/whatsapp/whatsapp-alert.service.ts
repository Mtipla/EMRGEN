import { Injectable, Logger } from '@nestjs/common';
import type {
  EmergencyAlertDelivery,
  EmergencyAlertResult,
  SendEmergencyAlertRequest,
} from '@repo/api-types';
import type { AnyMessageContent } from '@whiskeysockets/baileys';
import {
  buildEmergencyAlertText,
  buildFinalizedAlertText,
  buildLocationMessage,
} from './emergency-alert.message';
import { maskPhoneNumber, normalizePhoneNumber } from './phone-number';
import { withRetry } from './retry';
import { WhatsappConnectionService } from './whatsapp-connection.service';

/** Esperas entre reintentos ante un error temporal (CA-08.1): 3 intentos en total. */
export const RETRY_DELAYS_MS = [500, 1_500] as const;

/**
 * API de notificaciones de emergencia por WhatsApp para el resto del backend.
 * Envía a todos los contactos en paralelo (HU-08) un texto con el mensaje, la ubicación
 * y los antecedentes médicos, seguido del pin de ubicación nativo, si hay coordenadas.
 *
 * No consulta la BD: el despachador SOS resuelve los números
 * desde CONTACTO_EMERGENCIA y registra el resultado en la bitácora.
 */
@Injectable()
export class WhatsappAlertService {
  private readonly logger = new Logger(WhatsappAlertService.name);

  constructor(private readonly connection: WhatsappConnectionService) {}

  /**
   * Lanza 503 si no hay sesión de WhatsApp. Si la hay, nunca lanza por un contacto:
   * el resultado de cada uno viene en `deliveries`.
   */
  async sendEmergencyAlert(
    alert: SendEmergencyAlertRequest,
  ): Promise<EmergencyAlertResult> {
    const text = buildEmergencyAlertText(alert);
    const location = alert.location
      ? buildLocationMessage(alert.location)
      : undefined;
    return this.sendToRecipients(alert.recipients, text, location);
  }

  async sendFinalizedAlert(
    alert: Pick<
      SendEmergencyAlertRequest,
      'recipients' | 'senderName' | 'senderEmail'
    >,
  ): Promise<EmergencyAlertResult> {
    return this.sendToRecipients(
      alert.recipients,
      buildFinalizedAlertText(alert),
    );
  }

  private async sendToRecipients(
    phoneNumbers: string[],
    text: string,
    location?: AnyMessageContent,
  ): Promise<EmergencyAlertResult> {
    this.connection.assertReady();
    // "+56912345678" y "912345678" son el mismo contacto: se envía una sola vez.
    const recipients = [
      ...new Map(
        phoneNumbers.map((phone) => [
          normalizePhoneNumber(phone) ?? phone,
          phone,
        ]),
      ).values(),
    ];
    const deliveries = await Promise.all(
      recipients.map((phoneNumber) =>
        this.deliver(phoneNumber, text, location),
      ),
    );

    const sent = deliveries.filter(
      (delivery) => delivery.status === 'sent',
    ).length;
    return {
      sentAt: new Date().toISOString(),
      sent,
      failed: deliveries.length - sent,
      deliveries,
    };
  }

  private async deliver(
    phoneNumber: string,
    text: string,
    location: AnyMessageContent | undefined,
  ): Promise<EmergencyAlertDelivery> {
    const digits = normalizePhoneNumber(phoneNumber);
    if (!digits)
      return { phoneNumber, status: 'invalid_number', messageIds: [] };

    let jid: string | undefined;
    const messageIds: string[] = [];
    try {
      jid = await withRetry(
        () => this.connection.findAccount(digits),
        RETRY_DELAYS_MS,
      );
      if (!jid) return { phoneNumber, status: 'not_on_whatsapp', messageIds };

      const accountJid = jid;
      const textId = await withRetry(
        () => this.connection.send(accountJid, { text }),
        RETRY_DELAYS_MS,
      );
      if (textId) messageIds.push(textId);
    } catch (error) {
      this.logger.error(
        `No se pudo enviar la alerta a ${maskPhoneNumber(digits)}: ${(error as Error).message}`,
      );
      return {
        phoneNumber,
        status: 'failed',
        messageIds,
        error: 'No se pudo entregar el mensaje por WhatsApp.',
      };
    }

    // El texto ya incluye el link de Maps: si el pin falla, la alerta igual llegó.
    if (!location) return { phoneNumber, status: 'sent', messageIds };
    try {
      const locationId = await this.connection.send(jid, location);
      if (locationId) messageIds.push(locationId);
    } catch (error) {
      this.logger.warn(
        `Se envió el texto pero no el pin de ubicación a ${maskPhoneNumber(digits)}: ${(error as Error).message}`,
      );
    }
    return { phoneNumber, status: 'sent', messageIds };
  }
}
