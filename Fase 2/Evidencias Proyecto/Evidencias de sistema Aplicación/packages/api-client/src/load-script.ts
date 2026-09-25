const pending = new Map<string, Promise<void>>();

/** Inserta un <script> una sola vez por URL y espera a que cargue. */
export function loadScript(src: string): Promise<void> {
  let promise = pending.get(src);
  if (!promise) {
    promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        pending.delete(src);
        script.remove();
        reject(new Error(`No se pudo cargar el script ${new URL(src).origin}`));
      };
      document.head.appendChild(script);
    });
    pending.set(src, promise);
  }
  return promise;
}
