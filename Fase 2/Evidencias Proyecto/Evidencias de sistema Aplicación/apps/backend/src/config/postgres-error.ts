import { QueryFailedError } from 'typeorm';

/** SQLSTATE: otra tabla referencia la fila (llave foránea). */
export const PG_FOREIGN_KEY_VIOLATION = '23503';
/** SQLSTATE: se viola un índice único. */
export const PG_UNIQUE_VIOLATION = '23505';

/** Código SQLSTATE de un error de PostgreSQL, o `undefined` si el error no viene de la BD. */
export function codigoPostgres(error: unknown): string | undefined {
  return error instanceof QueryFailedError
    ? (error.driverError as { code?: string }).code
    : undefined;
}
