/** Duración común para sesiones web, móvil y panel; los JWT existentes conservan su exp. */
export function sessionDurationSeconds(raw: string | undefined): number {
  const hours = raw?.trim() || '2';
  if (!/^[1-9]\d*$/.test(hours) || Number(hours) > 168) {
    throw new Error(
      'JWT_SESSION_HOURS debe ser un número entero de 1 a 168 horas.',
    );
  }
  return Number(hours) * 60 * 60;
}
