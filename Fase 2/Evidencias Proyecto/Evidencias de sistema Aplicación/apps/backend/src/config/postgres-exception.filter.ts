import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { codigoPostgres } from './postgres-error';

@Catch(QueryFailedError)
export class PostgresExceptionFilter implements ExceptionFilter {
  catch(error: QueryFailedError, host: ArgumentsHost) {
    const code = codigoPostgres(error);
    const known = ['23503', '23505', '23514', '23001', '23502', '22001', '22P02'].includes(code ?? '');
    const status = known ? 409 : ['40001', '40P01'].includes(code ?? '') ? 503 : 500;
    host.switchToHttp().getResponse().status(status).json({
      statusCode: status,
      message: known ? 'La operación contradice una restricción de los datos. Revisa referencias, duplicados y límites.' :
        status === 503 ? 'Conflicto temporal; reintenta la operación.' : 'Error interno de base de datos',
      error: status === 409 ? 'Conflict' : status === 503 ? 'Service Unavailable' : 'Internal Server Error',
    });
  }
}
