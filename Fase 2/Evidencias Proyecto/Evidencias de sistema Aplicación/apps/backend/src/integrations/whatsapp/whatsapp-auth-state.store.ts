import { Injectable } from '@nestjs/common';
import { readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { AuthenticationState } from '@whiskeysockets/baileys';
import { loadBaileys } from './baileys.loader';
import { whatsappAuthDir } from './whatsapp.constants';

export interface WhatsappAuthState {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}

/**
 * Dónde se guardan las credenciales de la sesión de WhatsApp. Es una clase abstracta
 * para usarla como token de inyección: se puede reemplazar por un almacén en PostgreSQL
 * (recomendado en producción por Baileys) sin tocar WhatsappConnectionService.
 */
export abstract class WhatsappAuthStateStore {
  abstract load(): Promise<WhatsappAuthState>;
  abstract clear(): Promise<void>;
}


@Injectable()
export class MultiFileAuthStateStore extends WhatsappAuthStateStore {
  private readonly folder = resolve(process.cwd(), whatsappAuthDir());

  async load(): Promise<WhatsappAuthState> {
    const { useMultiFileAuthState } = await loadBaileys();
    return useMultiFileAuthState(this.folder);
  }


  async clear(): Promise<void> {
    const entries = await readdir(this.folder).catch(() => []);
    await Promise.all(
      entries.map((entry) =>
        rm(join(this.folder, entry), { recursive: true, force: true }),
      ),
    );
  }
}
