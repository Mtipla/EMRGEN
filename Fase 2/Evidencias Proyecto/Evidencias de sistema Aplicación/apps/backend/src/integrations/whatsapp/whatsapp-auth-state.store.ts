import { Injectable } from '@nestjs/common';
import { readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { AuthenticationState } from '@whiskeysockets/baileys';
import { loadBaileys } from './baileys.loader';
import { whatsappAuthDir } from './whatsapp.constants';

export interface WhatsappAuthState {
  state: AuthenticationState;
  /** Se llama en cada `creds.update` para persistir las llaves rotadas. */
  saveCreds: () => Promise<void>;
}

/**
 * Dónde se guardan las credenciales de la sesión de WhatsApp. Es una clase abstracta
 * para usarla como token de inyección: se puede reemplazar por un almacén en PostgreSQL
 * (recomendado en producción por Baileys) sin tocar WhatsappConnectionService.
 */
export abstract class WhatsappAuthStateStore {
  abstract load(): Promise<WhatsappAuthState>;
  /** Borra la sesión: el próximo `load()` empieza sin vincular (nuevo QR). */
  abstract clear(): Promise<void>;
}

/** Guarda la sesión en archivos JSON dentro de WHATSAPP_AUTH_DIR (por defecto `auth_info_baileys/`). */
@Injectable()
export class MultiFileAuthStateStore extends WhatsappAuthStateStore {
  private readonly folder = resolve(process.cwd(), whatsappAuthDir());

  async load(): Promise<WhatsappAuthState> {
    const { useMultiFileAuthState } = await loadBaileys();
    return useMultiFileAuthState(this.folder);
  }

  // Se vacía el contenido y no la carpeta: en Docker es el punto de montaje de un volumen.
  async clear(): Promise<void> {
    const entries = await readdir(this.folder).catch(() => []);
    await Promise.all(
      entries.map((entry) =>
        rm(join(this.folder, entry), { recursive: true, force: true }),
      ),
    );
  }
}
