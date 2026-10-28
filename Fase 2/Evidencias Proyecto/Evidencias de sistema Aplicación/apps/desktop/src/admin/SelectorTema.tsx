import { useState } from 'react'

/** Preferencia del panel completo, independiente de la sesión y de sus rutas. */
export function SelectorTema() {
  const [oscuro, setOscuro] = useState(() => document.documentElement.dataset.tema === 'oscuro')

  function alternar() {
    const siguiente = !oscuro
    const tema = siguiente ? 'oscuro' : 'claro'
    document.documentElement.dataset.tema = tema
    setOscuro(siguiente)
    try {
      localStorage.setItem('emergen-desktop-tema', tema)
    } catch {
      // Si el almacenamiento no está disponible, el selector sigue funcionando en esta ventana.
    }
  }

  return (
    <button
      type="button"
      className="wf-button wf-button--secondary desktop-admin-theme"
      aria-label="Modo oscuro"
      aria-pressed={oscuro}
      onClick={alternar}
    >
      {oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    </button>
  )
}
