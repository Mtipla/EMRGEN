import type * as Baileys from '@whiskeysockets/baileys';

export type BaileysLib = typeof Baileys;

let baileys: Promise<BaileysLib> | undefined;

/**
 * Baileys v7 es solo ESM y el backend compila a CommonJS: se carga con `import()`
 * dinámico (TypeScript lo conserva con `module: nodenext`). Además, así la librería no
 * se evalúa al importar AppModule (tests e2e o WHATSAPP_ENABLED=false).
 */
export function loadBaileys(): Promise<BaileysLib> {
  baileys ??= import('@whiskeysockets/baileys');
  return baileys;
}
