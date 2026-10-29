/** Etiquetas de las únicas teclas físicas permitidas. El reconocimiento se ejecuta en Android. */
export const BOTONES_ALERTA = ['Volumen +', 'Volumen −'] as const;

export const PRUEBAS_REQUERIDAS = 2;

export const mismaSecuencia = (grabada: readonly string[], intento: readonly string[]) =>
  grabada.length > 0 && grabada.length === intento.length && grabada.every((boton, i) => boton === intento[i]);
