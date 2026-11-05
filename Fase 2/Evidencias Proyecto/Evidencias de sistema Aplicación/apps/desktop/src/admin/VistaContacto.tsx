import { AdminContacto } from '@repo/ui/admin-contacto'
import { adminApi, describirError } from './api'

function conErrorLegible<A extends unknown[], T>(accion: (...args: A) => Promise<T>) {
  return async (...args: A) => {
    try { return await accion(...args) }
    catch (causa) { throw new Error(await describirError(causa), { cause: causa }) }
  }
}
const listar = conErrorLegible(adminApi.listarMensajesContacto)
const listarEstados = conErrorLegible(adminApi.listarEstadosContacto)
const actualizar = conErrorLegible(adminApi.actualizarMensajeContacto)

export function VistaContacto() {
  return <AdminContacto listar={listar} listarEstados={listarEstados} actualizar={actualizar} />
}
