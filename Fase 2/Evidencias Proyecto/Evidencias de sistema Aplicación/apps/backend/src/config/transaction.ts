import { DataSource, EntityManager } from 'typeorm';
import { codigoPostgres } from './postgres-error';

/** Only database work belongs here. External payment calls must stay outside retries. */
export async function transaction<T>(source: DataSource, operation: (manager: EntityManager) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await source.transaction(operation);
    } catch (error) {
      if (attempt >= 2 || !['40001', '40P01'].includes(codigoPostgres(error) ?? '')) throw error;
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    }
  }
}
