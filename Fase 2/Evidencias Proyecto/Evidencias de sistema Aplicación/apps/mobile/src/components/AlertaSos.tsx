import { useState } from 'react';
import { PRIORIDADES } from '@repo/ui/mocks';
import { Modal, Notice, PinDialog } from '@repo/ui/wireframe';
import { errorText, internalFetch } from '../lib/session';

type Alerta = { alerta_id: number; estado_alerta: string };

type Paso = { tipo: 'elegir' } | { tipo: 'activa'; alerta: Alerta } | { tipo: 'cerrar'; alerta: Alerta } | { tipo: 'aviso'; titulo: string; texto: string; error?: boolean };

/**
 * SOS (HU-06) y finalización con PIN (HU-14) contra internal-api:
 * POST /internal/v1/alertas y POST /internal/v1/alertas/{id}/cerrar.
 * El backend exige plan del principal y al menos un contacto propio (409 si no).
 */
const AlertaSos: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [paso, setPaso] = useState<Paso>({ tipo: 'elegir' });
  const [prioridad, setPrioridad] = useState<number>(PRIORIDADES[2].id);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    try {
      const alerta = await internalFetch<Alerta>('/alertas', {
        method: 'POST',
        body: JSON.stringify({ clave_idempotencia: crypto.randomUUID(), prioridad_id: prioridad }),
      });
      setPaso({ tipo: 'activa', alerta });
    } catch (cause) {
      setPaso({ tipo: 'aviso', titulo: 'No se pudo enviar la alerta', texto: errorText(cause), error: true });
    } finally {
      setEnviando(false);
    }
  }

  if (paso.tipo === 'elegir') {
    return (
      <Modal
        title="Alerta rápida"
        tone="error"
        onClose={onClose}
        actions={
          <>
            <button type="button" className="wf-button wf-button--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="wf-button" disabled={enviando} onClick={() => void enviar()}>
              {enviando ? 'Enviando…' : 'Enviar SOS'}
            </button>
          </>
        }
      >
        <div className="wf-form">
          <label>
            Tipo de emergencia
            <select value={prioridad} onChange={(e) => setPrioridad(Number(e.target.value))}>
              {PRIORIDADES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Modal>
    );
  }

  if (paso.tipo === 'activa') {
    return (
      <Modal
        title={`Alerta ${paso.alerta.alerta_id} enviada`}
        tone="success"
        onClose={onClose}
        actions={
          <>
            <button type="button" className="wf-button wf-button--secondary" onClick={onClose}>
              Cerrar ventana
            </button>
            <button type="button" className="wf-button" onClick={() => setPaso({ tipo: 'cerrar', alerta: paso.alerta })}>
              Finalizar alerta
            </button>
          </>
        }
      >
        <p>Estado: {paso.alerta.estado_alerta}. El envío a los contactos (WhatsApp) aún no está conectado a este servicio.</p>
      </Modal>
    );
  }

  if (paso.tipo === 'cerrar') {
    return (
      <PinDialog
        title="Finalizar alerta"
        info="Para finalizar la alerta ingresa tu PIN (o el de tu cuenta principal si tu acceso es parcial)."
        confirmar={false}
        onClose={onClose}
        onSubmit={async (pin) => {
          // Los errores (403 PIN incorrecto, 429 bloqueo) los muestra PinDialog.
          await internalFetch(`/alertas/${paso.alerta.alerta_id}/cerrar`, { method: 'POST', body: JSON.stringify({ pin }) });
          setPaso({ tipo: 'aviso', titulo: 'Alerta finalizada', texto: 'Tus contactos sabrán que la situación terminó.' });
        }}
      />
    );
  }

  return <Notice title={paso.titulo} tone={paso.error ? 'error' : 'success'} message={paso.texto} onClose={onClose} />;
};

export default AlertaSos;
