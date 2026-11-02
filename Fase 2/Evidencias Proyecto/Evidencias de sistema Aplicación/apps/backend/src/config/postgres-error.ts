import { QueryFailedError } from 'typeorm';


export const PG_FOREIGN_KEY_VIOLATION = '23503';

export const PG_UNIQUE_VIOLATION = '23505';


export function codigoPostgres(error: unknown): string | undefined {
  return error instanceof QueryFailedError
    ? (error.driverError as { code?: string }).code
    : undefined;
}
