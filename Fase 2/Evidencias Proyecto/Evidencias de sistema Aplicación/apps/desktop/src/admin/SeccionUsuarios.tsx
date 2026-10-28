import { AdminPlanes, type ApiPlanes } from '@repo/ui/admin-planes'
import { adminApi, describirError } from './api'

function conError<A extends unknown[], T>(accion: (...args: A) => Promise<T>) {
  return async (...args: A) => {
    try { return await accion(...args) }
    catch (causa) { throw new Error(await describirError(causa), { cause: causa }) }
  }
}
const api: ApiPlanes = {
  listar: conError(adminApi.listarUsuarios),
  planes: conError(adminApi.listarPlanes),
  consultar: conError(adminApi.verExpediente),
  guardar: conError(adminApi.guardarPlan),
}

/** Las modificaciones de cuentas se realizan en Administrar cuentas. */
export function SeccionUsuarios() { return <AdminPlanes api={api} /> }
