import { AdminTickets } from '@repo/ui/admin-tickets'
import { adminApi, describirError } from './api'

function conErrorLegible<A extends unknown[], T>(accion: (...args: A) => Promise<T>) {
  return async (...args: A) => {
    try { return await accion(...args) }
    catch (causa) { throw new Error(await describirError(causa), { cause: causa }) }
  }
}
const listar = conErrorLegible(adminApi.listarTickets)
const listarEstados = conErrorLegible(adminApi.listarEstadosTickets)
const actualizar = conErrorLegible(adminApi.actualizarTicket)

export function VistaTickets({ esAdministrador }: { esAdministrador: boolean }) {
  return <AdminTickets esAdministrador={esAdministrador} listar={listar} listarEstados={listarEstados} actualizar={actualizar} />
}
