import { useState } from 'react';
import { PRIORIDADES } from '@repo/ui/mocks';
import { Modal, NumerosEmergencia } from '@repo/ui/wireframe';
import { enviarSos, errorSos, type Alerta } from '../lib/sos';

/** El éxito solo se muestra después de que la API confirma el registro del SOS. */
const AlertaSos: React.FC<{ onClose: () => void; onRegistrada: () => void }> = ({
  onClose,
  onRegistrada,
}) => {
  const [solicitud, setSolicitud] = useState(() => ({
    prioridad: PRIORIDADES[2].id as number,
    clave: crypto.randomUUID(),
  }));
  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function enviar() {
    if (enviando) return;
    setEnviando(true);
    setError('');
    try {
      // Un reintento conserva UUID y contenido para no duplicar un envío confirmado por el servidor.
      const registrada = await enviarSos(solicitud.prioridad, solicitud.clave);
      setAlerta(registrada);
      onRegistrada();
    } catch (causa) {
      setError(errorSos(causa));
    } finally {
      setEnviando(false);
    }
  }

  if (alerta)
    return (
      <Modal
        title={`Alerta #${alerta.alerta_id} registrada`}
        tone="success"
        onClose={onClose}
        actions={
          <button type="button" className="wf-button" onClick={onClose}>
            Ver mis alertas
          </button>
        }
      >
        <p>
          Estado: <strong>{alerta.estado_alerta}</strong>. Puedes consultar y finalizar la alerta
          desde el apartado Alertas, ingresando tu PIN.
        </p>
      </Modal>
    );

  return (
    <Modal
      title="Alerta rápida"
      tone="error"
      onClose={() => {
        if (!enviando) onClose();
      }}
      actions={null}
    >
      <div className="wf-form">
        <label>
          Tipo de emergencia
          <select
            value={solicitud.prioridad}
            disabled={enviando}
            onChange={(e) =>
              setSolicitud({ prioridad: Number(e.target.value), clave: crypto.randomUUID() })
            }
          >
            {PRIORIDADES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="wf-message wf-message--error">
          {error}
        </p>
      )}
      <div className="wf-actions">
        <button
          type="button"
          className="wf-button wf-button--secondary"
          disabled={enviando}
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="wf-button"
          disabled={enviando}
          onClick={() => void enviar()}
        >
          {enviando ? 'Enviando…' : 'Enviar SOS'}
        </button>
      </div>
      <div className="mobile-sos-numeros">
        <NumerosEmergencia />
      </div>
    </Modal>
  );
};

export default AlertaSos;
