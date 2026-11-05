import { useEffect, useState } from "react";
import "./wireframe.css";

/**
 * Alertas visuales flotantes (éxito, error, información) para confirmar o advertir cada acción.
 * `avisar` se puede llamar desde cualquier componente; solo se ven donde la app monta <Avisos />
 * (sin <Avisos /> la llamada no hace nada, así móvil y escritorio siguen igual).
 * (Extensión .tsx porque el mapa `exports` de @repo/ui solo expone ./src/*.tsx.)
 */

export type TipoAviso = "exito" | "error" | "info";

interface Aviso {
  id: number;
  tipo: TipoAviso;
  texto: string;
}

const ICONO: Record<TipoAviso, string> = { exito: "✓", error: "✕", info: "i" };
const TITULO: Record<TipoAviso, string> = {
  exito: "Listo",
  error: "Algo salió mal",
  info: "Información",
};
const DURACION_MS = 5000;

let siguienteId = 1;
const oyentes = new Set<(aviso: Aviso) => void>();

export function avisar(tipo: TipoAviso, texto: string) {
  const aviso = { id: siguienteId++, tipo, texto };
  oyentes.forEach((oyente) => oyente(aviso));
}

/** Mensaje legible de un error lanzado por fetch/apiFetch. */
export const mensajeError = (causa: unknown, alternativo = "No se pudo completar la acción.") =>
  causa instanceof Error && causa.message ? causa.message : alternativo;

export const Avisos = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const cerrar = (id: number) => setAvisos((actuales) => actuales.filter((a) => a.id !== id));

  useEffect(() => {
    const oyente = (aviso: Aviso) => {
      setAvisos((actuales) => [...actuales.slice(-3), aviso]);
      setTimeout(() => cerrar(aviso.id), DURACION_MS);
    };
    oyentes.add(oyente);
    return () => {
      oyentes.delete(oyente);
    };
  }, []);

  return (
    <div className="wf-avisos" aria-live="polite">
      {avisos.map((aviso) => (
        <div
          key={aviso.id}
          className={`wf-aviso wf-aviso--${aviso.tipo}`}
          role={aviso.tipo === "error" ? "alert" : "status"}
        >
          <span className="wf-aviso-icono" aria-hidden="true">
            {ICONO[aviso.tipo]}
          </span>
          <div>
            <strong>{TITULO[aviso.tipo]}</strong>
            <p>{aviso.texto}</p>
          </div>
          <button
            type="button"
            className="wf-aviso-cerrar"
            aria-label="Cerrar aviso"
            onClick={() => cerrar(aviso.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
