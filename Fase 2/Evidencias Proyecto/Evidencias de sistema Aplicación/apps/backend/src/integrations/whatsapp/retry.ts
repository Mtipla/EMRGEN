const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Ejecuta `task` y, si falla, la reintenta tras cada espera de `delaysMs`
 * (ej. [500, 1500] = 3 intentos en total). Lanza el último error.
 */
export async function withRetry<T>(
  task: () => Promise<T>,
  delaysMs: readonly number[],
): Promise<T> {
  for (const delay of delaysMs) {
    try {
      return await task();
    } catch {
      await sleep(delay);
    }
  }
  return task();
}
