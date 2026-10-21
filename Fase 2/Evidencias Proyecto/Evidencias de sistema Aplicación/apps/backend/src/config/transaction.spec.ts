import { DataSource, QueryFailedError } from 'typeorm';
import { transaction } from './transaction';
describe('transacciones PostgreSQL: reintentos acotados',()=>{
 it.each(['40001','40P01'])('repite la operación completa tras %s y confirma una sola vez',async(code)=>{
  const operation=jest.fn().mockResolvedValue('ok');
  const source={transaction:jest.fn().mockRejectedValueOnce(new QueryFailedError('',[],{code} as Error)).mockImplementation(operation)};
  expect(await transaction(source as unknown as DataSource,operation)).toBe('ok');
  expect(source.transaction).toHaveBeenCalledTimes(2);
 });
 it('agota tres intentos y preserva el error',async()=>{
  const error=new QueryFailedError('',[],{code:'40001'} as Error);
  const source={transaction:jest.fn().mockRejectedValue(error)};
  await expect(transaction(source as unknown as DataSource,jest.fn())).rejects.toBe(error);
  expect(source.transaction).toHaveBeenCalledTimes(3);
 });
 it('no reintenta una violación permanente de integridad',async()=>{
  const error=new QueryFailedError('',[],{code:'23514'} as Error);
  const source={transaction:jest.fn().mockRejectedValue(error)};
  await expect(transaction(source as unknown as DataSource,jest.fn())).rejects.toBe(error);
  expect(source.transaction).toHaveBeenCalledTimes(1);
 });
});
