import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { WhatsappConnectionState, WhatsappStatusResponse } from '@repo/api-types';
import type {
  AnyMessageContent,
  ConnectionState,
  WASocket,
} from '@whiskeysockets/baileys';
import { BaileysLoggerAdapter } from './baileys-logger.adapter';
import { loadBaileys } from './baileys.loader';
import { normalizePhoneNumber, toUserJid } from './phone-number';
import { WhatsappAuthStateStore } from './whatsapp-auth-state.store';
import { INTEGRATION, isWhatsappEnabled } from './whatsapp.constants';

const MAX_RECONNECT_DELAY_MS = 30_000;

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** Baileys entrega el motivo del cierre como un Boom con `output.statusCode`. */
const statusCodeOf = (error: unknown): number | undefined =>
  (error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode;

/**
 * Sesión de WhatsApp (Baileys) del número emisor de EMERGEN: conecta, expone el QR o el
 * código de emparejamiento, persiste las credenciales y reconecta con backoff.
 *
 * La conexión arranca en segundo plano después del bootstrap: la API REST queda
 * disponible aunque WhatsApp tarde, esté sin vincular o caído. No contiene lógica de
 * alertas: WhatsappAlertService la usa a través de `send()` y `findAccount()`.
 */
@Injectable()
export class WhatsappConnectionService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(WhatsappConnectionService.name);
  private readonly baileysLogger = new BaileysLoggerAdapter(this.logger);

  private socket?: WASocket;
  private state: WhatsappConnectionState = 'disabled';
  private qr?: string;
  private lastError?: string;
  /** Se incrementa en cada conexión; los eventos de sockets anteriores se descartan. */
  private generation = 0;
  private reconnectAttempts = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private stopped = false;

  constructor(private readonly authStore: WhatsappAuthStateStore) {}

  onApplicationBootstrap(): void {
    if (!isWhatsappEnabled()) {
      this.logger.log(
        'Deshabilitado: define WHATSAPP_ENABLED=true para conectar (ver readme-apis.md).',
      );
      return;
    }
    this.setState('connecting');
    // Fuera del ciclo de arranque: la API queda disponible mientras se negocia la sesión.
    setImmediate(() => void this.connect());
  }

  onModuleDestroy(): void {
    this.stopped = true;
    clearTimeout(this.reconnectTimer);
    this.generation++;
    this.closeSocket();
  }

  getStatus(): WhatsappStatusResponse {
    const user = this.state === 'open' ? this.socket?.user?.id : undefined;
    return {
      enabled: isWhatsappEnabled(),
      state: this.state,
      qrAvailable: Boolean(this.qr),
      // "56912345678:3@s.whatsapp.net" → "56912345678"
      phoneNumber: user?.split(/[:@]/)[0],
      lastError: this.lastError,
    };
  }

  /** QR vigente (texto a codificar), o `undefined` si no hay vinculación pendiente. */
  getQrCode(): string | undefined {
    return this.qr;
  }

  isReady(): boolean {
    return this.state === 'open' && this.socket !== undefined;
  }

  /** Lanza 503 si la sesión no está lista para enviar. */
  assertReady(): void {
    this.readySocket();
  }

  /** Alternativa al QR: código de 8 caracteres para "Vincular con número de teléfono". */
  async requestPairingCode(phoneNumber: string): Promise<string> {
    this.assertEnabled();
    if (this.state === 'open') {
      throw new ConflictException(
        `${INTEGRATION} ya está vinculado. Cierra la sesión antes de vincular otro número.`,
      );
    }
    if (this.state !== 'waiting_for_link' || !this.socket) {
      throw new ServiceUnavailableException(
        `${INTEGRATION} aún no está listo para vincular (estado: ${this.state}). Reintenta en unos segundos.`,
      );
    }
    const digits = normalizePhoneNumber(phoneNumber);
    if (!digits) throw new BadRequestException('phoneNumber no es un número válido');
    return this.socket.requestPairingCode(digits);
  }

  /** Desvincula el número emisor, borra las credenciales y genera un QR nuevo. */
  async logout(): Promise<void> {
    this.assertEnabled();
    const socket = this.socket;
    this.generation++;
    this.socket = undefined;
    if (this.state === 'open' && socket) {
      await socket.logout().catch((error: unknown) =>
        this.logger.warn(`No se pudo cerrar la sesión en WhatsApp: ${errorMessage(error)}`),
      );
    } else {
      socket?.end(undefined).catch(() => undefined);
    }
    await this.authStore.clear();
    this.logger.log('Sesión cerrada: se generará un QR nuevo.');
    void this.connect();
  }

  /** JID de la cuenta de WhatsApp del número, o `undefined` si no usa WhatsApp. */
  async findAccount(digits: string): Promise<string | undefined> {
    const [result] = (await this.readySocket().onWhatsApp(toUserJid(digits))) ?? [];
    return result?.exists ? result.jid : undefined;
  }

  /** Envía un mensaje y devuelve su id. */
  async send(jid: string, content: AnyMessageContent): Promise<string | undefined> {
    const message = await this.readySocket().sendMessage(jid, content);
    return message?.key.id ?? undefined;
  }

  private async connect(): Promise<void> {
    if (this.stopped) return;
    const generation = ++this.generation;
    this.closeSocket();
    this.setState('connecting');

    try {
      const baileys = await loadBaileys();
      const { state, saveCreds } = await this.authStore.load();
      const { version } = await baileys.fetchLatestBaileysVersion();
      if (generation !== this.generation) return;

      const socket = baileys.makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: baileys.makeCacheableSignalKeyStore(state.keys, this.baileysLogger),
        },
        logger: this.baileysLogger,
        browser: baileys.Browsers.ubuntu('EMERGEN'),
        // Cuenta solo emisora: no se marca "en línea" ni pide el historial completo.
        // No desactivar shouldSyncHistoryMessage: Baileys necesita la sincronización
        // inicial para los mapeos LID y sin ella la sesión se vuelve inestable.
        markOnlineOnConnect: false,
        syncFullHistory: false,
      });
      this.socket = socket;

      socket.ev.on('creds.update', () => {
        saveCreds().catch((error: unknown) =>
          this.logger.error(`No se pudieron guardar las credenciales: ${errorMessage(error)}`),
        );
      });
      socket.ev.on('connection.update', (update) => {
        void this.onConnectionUpdate(generation, update);
      });
    } catch (error) {
      this.lastError = errorMessage(error);
      this.logger.error(`No se pudo iniciar la conexión: ${this.lastError}`);
      this.scheduleReconnect(generation);
    }
  }

  private async onConnectionUpdate(
    generation: number,
    { connection, lastDisconnect, qr }: Partial<ConnectionState>,
  ): Promise<void> {
    if (generation !== this.generation) return;

    if (qr) {
      this.qr = qr;
      this.reconnectAttempts = 0;
      if (this.setState('waiting_for_link')) {
        this.logger.log(
          'Sin sesión: escanea el QR (GET /notifications/whatsapp/qr) o pide un código (POST /notifications/whatsapp/pairing-code).',
        );
      }
    }

    if (connection === 'open') {
      this.qr = undefined;
      this.lastError = undefined;
      this.reconnectAttempts = 0;
      this.setState('open');
      this.logger.log(`Conectado como ${this.getStatus().phoneNumber ?? 'desconocido'}.`);
    }

    if (connection === 'close') await this.onClose(generation, lastDisconnect?.error);
  }

  private async onClose(generation: number, error: unknown): Promise<void> {
    this.socket = undefined;
    this.qr = undefined;
    if (this.stopped) return;

    const { DisconnectReason } = await loadBaileys();
    const code = statusCodeOf(error);
    this.lastError = error ? errorMessage(error) : undefined;

    switch (code) {
      case DisconnectReason.loggedOut:
        this.logger.warn('La sesión se cerró desde el teléfono: se borran las credenciales.');
        await this.authStore.clear();
        return this.scheduleReconnect(generation, 0);
      case DisconnectReason.restartRequired:
        // Normal justo después de escanear el QR.
        return this.scheduleReconnect(generation, 0);
      case DisconnectReason.connectionReplaced:
      case DisconnectReason.forbidden:
        // Otra instancia abrió la misma sesión, o WhatsApp bloqueó el número: reconectar empeoraría.
        this.setState('closed');
        this.logger.error(
          `Conexión detenida (código ${code}): ${this.lastError ?? ''}. Revisa el número emisor y reinicia el backend.`,
        );
        return;
      default:
        this.logger.warn(`Conexión cerrada (código ${code ?? '?'}); se reintentará.`);
        return this.scheduleReconnect(generation);
    }
  }

  private scheduleReconnect(generation: number, delayMs?: number): void {
    if (this.stopped || generation !== this.generation) return;
    const wait =
      delayMs ?? Math.min(1_000 * 2 ** this.reconnectAttempts++, MAX_RECONNECT_DELAY_MS);
    this.setState('connecting');
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => void this.connect(), wait);
    // El temporizador no mantiene vivo el proceso (tests, apagado).
    this.reconnectTimer.unref();
  }

  private closeSocket(): void {
    const socket = this.socket;
    this.socket = undefined;
    this.qr = undefined;
    socket?.end(undefined).catch(() => undefined);
  }

  /** Devuelve `true` si el estado cambió. */
  private setState(state: WhatsappConnectionState): boolean {
    const changed = this.state !== state;
    this.state = state;
    return changed;
  }

  private assertEnabled(): void {
    if (!isWhatsappEnabled()) {
      throw new ServiceUnavailableException(
        `${INTEGRATION} no está configurado: define WHATSAPP_ENABLED=true en el archivo .env (ver readme-apis.md).`,
      );
    }
  }

  private readySocket(): WASocket {
    this.assertEnabled();
    if (this.state !== 'open' || !this.socket) {
      throw new ServiceUnavailableException(
        `${INTEGRATION} no está conectado (estado: ${this.state}). Vincula el número emisor (ver readme-apis.md).`,
      );
    }
    return this.socket;
  }
}
