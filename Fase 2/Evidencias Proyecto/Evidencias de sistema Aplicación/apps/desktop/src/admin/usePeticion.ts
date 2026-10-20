import { useState } from 'react'
import { describirError } from './api'

/**
 * Ejecuta una petición y deja su resultado como texto para mostrarlo bajo el formulario.
 * `ejecutar` devuelve los datos, o `null` si la petición falló.
 */
export function usePeticion() {
  const [salida, setSalida] = useState('')

  async function ejecutar<T>(accion: string, peticion: () => Promise<T>): Promise<T | null> {
    setSalida(`${accion}: enviando…`)
    try {
      const datos = await peticion()
      setSalida(`${accion}: OK\n${resumir(datos)}`)
      return datos
    } catch (error) {
      setSalida(`${accion}: ERROR\n${await describirError(error)}`)
      return null
    }
  }

  return { salida, ejecutar }
}

function resumir(datos: unknown): string {
  if (Array.isArray(datos)) return `${datos.length} registro(s)`
  if (datos instanceof Blob) return `Archivo de ${datos.size} bytes (${datos.type})`
  if (datos === undefined || datos === '') return '(sin contenido)'
  return JSON.stringify(datos, null, 2)
}
