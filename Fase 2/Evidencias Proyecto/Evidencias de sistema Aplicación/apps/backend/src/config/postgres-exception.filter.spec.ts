import { ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { PostgresExceptionFilter } from './postgres-exception.filter';
describe('errores PostgreSQL públicos',()=>{
 it.each([['23503',409],['23505',409],['23514',409],['23001',409],['23502',409],['40001',503],['40P01',503],['XX000',500]])('%s produce %s sin exponer SQL', (code,status)=>{
  const response={status:jest.fn(),json:jest.fn()};response.status.mockReturnValue(response);
  const host={switchToHttp:()=>({getResponse:()=>response})} as unknown as ArgumentsHost;
  new PostgresExceptionFilter().catch(new QueryFailedError('SQL CONFIDENCIAL',['secreto'],{code,message:'detalle interno'} as Error),host);
  expect(response.status).toHaveBeenCalledWith(status);
  expect(JSON.stringify(response.json.mock.calls)).not.toMatch(/CONFIDENCIAL|secreto|detalle interno/);
 });
});
