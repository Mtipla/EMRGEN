import { useEffect, useState } from 'react';
import { PRIORIDADES } from '@repo/ui/mocks';
import { PinDialog } from '@repo/ui/wireframe';
import { errorSos, finalizarSos, listarActivas, type Alerta } from '../lib/sos';

/** Solo muestra SOS propios; salir del Home desmonta el monitor y cancela la consulta. */
export default function AlertasActivas({
  usuarioId,
  version,
}: {
  usuarioId: number;
  version: number;
}) {
  const [recarga, setRecarga] = useState(0);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState<{ alertas: Alerta[]; cargando: boolean; error: string }>({
    alertas: [],
    cargando: true,
    error: '',
  });

  useEffect(() => {
    let vigente = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    let peticion: AbortController;
    async function consultar() {
      peticion = new AbortController();
      try {
        const lista = await listarActivas(usuarioId, peticion.signal);
        if (vigente)
          setEstado({
            alertas: lista.filter(
              (a) => a.usuario_id === usuarioId && a.estado_alerta === 'ACTIVA',
            ),
            cargando: false,
            error: '',
          });
      } catch (causa) {
        if (vigente && !peticion.signal.aborted)
          setEstado((anterior) => ({ ...anterior, cargando: false, error: errorSos(causa) }));
      } finally {
        if (vigente) temporizador = setTimeout(() => void consultar(), 3000);
      }
    }
    void consultar();
    return () => {
      vigente = false;
      clearTimeout(temporizador);
      peticion?.abort();
    };
  }, [usuarioId, version, recarga]);

  const paraFinalizar = estado.alertas.find((a) => a.alerta_id === seleccion);

  return (
    <section className="wf-card mobile-alertas" aria-labelledby="mis-alertas-titulo">
      <div className="mobile-alertas-cabecera">
        <h2 id="mis-alertas-titulo">Alertas</h2>
        <button
          type="button"
          className="wf-button wf-button--secondary"
          onClick={() => setRecarga((v) => v + 1)}
        >
          Actualizar
        </button>
      </div>
      <p className="wf-muted">
        Tus alertas activas se actualizan automáticamente. Para finalizarlas debes ingresar tu PIN.
      </p>
      {estado.cargando && <p role="status">Consultando alertas…</p>}
      {estado.error && (
        <p className="wf-message wf-message--error" role="alert">
          {estado.error}
          {estado.alertas.length > 0 && ' El listado puede estar desactualizado.'}
        </p>
      )}
      {mensaje && (
        <p className="wf-message" role="status">
          {mensaje}
        </p>
      )}
      {!estado.cargando && !estado.error && estado.alertas.length === 0 && (
        <p>No tienes alertas activas.</p>
      )}
      <ul className="mobile-alertas-lista">
        {estado.alertas.map((a) => (
          <li key={a.alerta_id}>
            <div className="mobile-alertas-cabecera">
              <h3>Alerta #{a.alerta_id}</h3>
              <span className="mobile-alerta-activa">ACTIVA</span>
            </div>
            <p>
              <strong>
                {PRIORIDADES.find((p) => p.id === a.prioridad_id)?.nombre ?? 'Emergencia'}
              </strong>
            </p>
            <p className="wf-muted">{new Date(a.fecha_creacion).toLocaleString('es-CL')}</p>
            <p>{a.mensaje}</p>
            {a.ubicacion && <p>Ubicación: {a.ubicacion}</p>}
            <button
              type="button"
              className="wf-button"
              onClick={() => {
                setMensaje('');
                setSeleccion(a.alerta_id);
              }}
            >
              Finalizar alerta
            </button>
          </li>
        ))}
      </ul>
      {paraFinalizar && (
        <PinDialog
          key={paraFinalizar.alerta_id}
          title={`Finalizar alerta #${paraFinalizar.alerta_id}`}
          confirmar={false}
          onClose={() => setSeleccion(null)}
          onSubmit={async (pin) => {
            try {
              await finalizarSos(paraFinalizar.alerta_id, pin);
            } catch (causa) {
              throw new Error(errorSos(causa), { cause: causa });
            }
            setEstado((anterior) => ({
              ...anterior,
              alertas: anterior.alertas.filter((a) => a.alerta_id !== paraFinalizar.alerta_id),
            }));
            setSeleccion(null);
            setMensaje(`Alerta #${paraFinalizar.alerta_id} finalizada.`);
            setRecarga((v) => v + 1);
          }}
        />
      )}
    </section>
  );
}
