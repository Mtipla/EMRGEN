import { useState, type FormEvent } from "react";
import { PinDialog } from "./wireframe";

export interface DatosPerfilPersonal {
  nombre_usuario?: string;
  PIN?: string;
}
interface Props {
  nombreUsuario: string;
  variante: "soporte" | "administrador";
  onGuardarPersonal?: (datos: DatosPerfilPersonal) => Promise<void>;
}
export function PerfilPersonal({
  nombreUsuario,
  variante,
  onGuardarPersonal,
}: Props) {
  const [usuario, setUsuario] = useState(nombreUsuario);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [pin, setPin] = useState(false);
  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!onGuardarPersonal || ocupado) return;
    setOcupado(true);
    setMensaje("");
    try {
      await onGuardarPersonal({
        nombre_usuario: usuario.trim(),
      });
      setMensaje("Datos guardados.");
    } catch (causa) {
      setMensaje(
        causa instanceof Error ? causa.message : "No se pudo guardar.",
      );
    } finally {
      setOcupado(false);
    }
  }
  return (
    <>
      <form className="wf-card wf-form" onSubmit={guardar}>
        <h1>Modificar usuario</h1>
        <label>
          Nombre de usuario
          <input
            required
            minLength={2}
            maxLength={50}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </label>
        {mensaje && <p role="status">{mensaje}</p>}
        <div className="wf-actions">
          <button
            type="submit"
            className="wf-button"
            disabled={ocupado || !onGuardarPersonal}
          >
            Guardar cambios
          </button>
          {variante === "administrador" && (
            <button
              type="button"
              className="wf-button wf-button--secondary"
              disabled={ocupado || !onGuardarPersonal}
              onClick={() => setPin(true)}
            >
              Modificar PIN
            </button>
          )}
        </div>
      </form>
      {pin && (
        <PinDialog
          title="Modificar PIN"
          onClose={() => setPin(false)}
          onSubmit={async (PIN) => {
            await onGuardarPersonal!({ PIN });
            setPin(false);
            setMensaje("PIN actualizado.");
          }}
        />
      )}
    </>
  );
}
