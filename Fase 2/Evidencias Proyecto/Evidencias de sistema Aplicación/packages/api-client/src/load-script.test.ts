// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { loadGoogleMaps } from './google-maps';
import { loadScript } from './load-script';

const lastScript = () => document.head.querySelector<HTMLScriptElement>('script:last-of-type')!;

describe('loadScript', () => {
  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('inserta el script una sola vez por URL', async () => {
    const first = loadScript('https://cdn.test/a.js');
    const second = loadScript('https://cdn.test/a.js');
    expect(document.head.querySelectorAll('script')).toHaveLength(1);

    lastScript().dispatchEvent(new Event('load'));
    await expect(Promise.all([first, second])).resolves.toBeDefined();
  });

  it('permite reintentar después de un error de carga', async () => {
    const failed = loadScript('https://cdn.test/b.js');
    lastScript().dispatchEvent(new Event('error'));
    await expect(failed).rejects.toThrow('No se pudo cargar el script https://cdn.test');
    expect(document.head.querySelectorAll('script')).toHaveLength(0);

    const retry = loadScript('https://cdn.test/b.js');
    expect(document.head.querySelectorAll('script')).toHaveLength(1);
    lastScript().dispatchEvent(new Event('load'));
    await expect(retry).resolves.toBeUndefined();
  });

  it('el mensaje de error no incluye la API key', async () => {
    const loading = loadGoogleMaps('CLAVE-NAVEGADOR');
    lastScript().dispatchEvent(new Event('error'));
    const error = (await loading.catch((e: unknown) => e)) as Error;
    expect(error.message).not.toContain('CLAVE-NAVEGADOR');
  });

  it('Google Maps: error claro si el script carga pero google.maps no existe', async () => {
    const loading = loadGoogleMaps('otra-key');
    lastScript().dispatchEvent(new Event('load'));
    await expect(loading).rejects.toThrow('Google Maps no se inicializó');
  });
});
