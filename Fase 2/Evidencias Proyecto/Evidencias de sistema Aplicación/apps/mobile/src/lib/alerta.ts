/** Botones con los que se graba la secuencia de alerta en segundo plano (simulan los físicos). */
export const BOTONES_ALERTA = ['Volumen +', 'Volumen −'] as const;

export const PRUEBAS_REQUERIDAS = 2;

export const mismaSecuencia = (grabada: readonly string[], intento: readonly string[]) =>
  grabada.length > 0 && grabada.length === intento.length && grabada.every((boton, i) => boton === intento[i]);
