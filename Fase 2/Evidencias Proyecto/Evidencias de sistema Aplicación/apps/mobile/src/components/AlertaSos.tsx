import { useEffect, useRef, useState } from 'react';
import { PRIORIDADES } from '@repo/ui/mocks';
import { Modal } from '@repo/ui/wireframe';
import NumerosEmergenciaMovil from './NumerosEmergenciaMovil';
import { consultarSos, enviarSos, errorSos, estadoWhatsapp, finalidadPerfil, type Alerta } from '../lib/sos';
import { obtenerUbicacionSos } from '../lib/ubicacion-sos';

/** El éxito solo se muestra después de que la API confirma el registro del SOS. */
const AlertaSos: React.FC<{
  onClose: () => void;
  onRegistrada: () => void;
}> = ({ onClose, onRegistrada }) => {
  const [solicitud, setSolicitud] = useState(() => ({
    prioridad: PRIORIDADES[2].id as number,
    clave: crypto.randomUUID(),
  }));
  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [intentoIniciado, setIntentoIniciado] = useState(false);
  const [error, setError] = useState('');
  const [avisoUbicacion, setAvisoUbicacion] = useState('');
  const contenido = useRef<{ clave: string; ubicacion?: string } | null>(null);
  const alertaId = alerta?.alerta_id;
  const pendientes = alerta?.whatsapp?.pendientes ?? 0;
  const elegidoAMano = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    finalidadPerfil(controller.signal)
      .then((prioridad) => {
        // No pisa una elección del usuario ni un envío ya iniciado (su clave lleva el tipo original).
        if (prioridad && !elegidoAMano.current && !contenido.current) setSolicitud((s) => ({ ...s, prioridad }));
      })
      .catch(() => {
        /* Sin perfil se mantiene EMERGENCIA. */
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!alertaId || pendientes === 0) return;
    const controller = new AbortController();
    const timer = setInterval(() => {
      void consultarSos(alertaId, controller.signal)
        .then((actualizada) => {
          if (!controller.signal.aborted) setAlerta(actualizada);
        })
        .catch(() => {
          /* El listado permite volver a consultar si se pierde la conexión. */
        });
    }, 3000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [alertaId, pendientes]);

  async function enviar() {
    if (enviando) return;
    setIntentoIniciado(true);
    setEnviando(true);
    setError('');
    try {
      // Un reintento conserva UUID y contenido para no duplicar un envío confirmado por el servidor.
      if (contenido.current?.clave !== solicitud.clave) {
        setAvisoUbicacion('');
        contenido.current = {
          clave: solicitud.clave,
          ubicacion: await obtenerUbicacionSos(setAvisoUbicacion),
        };
      }
      const registrada = await enviarSos(
        solicitud.prioridad,
        solicitud.clave,
        contenido.current.ubicacion,
      );
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
        <p role="status">{estadoWhatsapp(alerta)}</p>
        <p>El estado enviado confirma el despacho, no la lectura del contacto.</p>
        {!alerta.ubicacion && (
          <p>
            {avisoUbicacion || 'No se pudo obtener tu ubicación.'} La alerta se registró sin ella.
          </p>
        )}
        <div className="mobile-sos-numeros">
          <NumerosEmergenciaMovil />
        </div>
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
        <p>
          Se enviará tu mensaje de emergencia configurado y tu ubicación a tus contactos por
          WhatsApp.
        </p>
        <label>
          Tipo de emergencia
          <select
            value={solicitud.prioridad}
            disabled={enviando}
            onChange={(e) => {
              elegidoAMano.current = true;
              setSolicitud({
                prioridad: Number(e.target.value),
                clave: crypto.randomUUID(),
              });
            }}
          >
            {PRIORIDADES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>
      {enviando && (
        <p role="status">
          Enviando SOS… El estado de WhatsApp aparecerá cuando se registre la alerta.
        </p>
      )}
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
      {intentoIniciado && (
        <div className="mobile-sos-numeros">
          <NumerosEmergenciaMovil />
        </div>
      )}
    </Modal>
  );
};

export default AlertaSos;
