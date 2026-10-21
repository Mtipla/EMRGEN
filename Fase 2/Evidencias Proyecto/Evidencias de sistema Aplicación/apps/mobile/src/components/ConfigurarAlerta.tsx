import { useEffect, useState } from 'react';
import { Modal, Notice } from '@repo/ui/wireframe';
import { BOTONES_ALERTA, mismaSecuencia, PRUEBAS_REQUERIDAS } from '../lib/alerta';

type Paso = 'cuenta' | 'grabando' | 'probar' | 'exito' | 'error';

/**
 * Flujo "Configurar alerta en segundo plano": cuenta atrás, grabación, 2 pruebas y resultado.
 * PENDIENTE: los botones físicos y el guardado de la secuencia requieren integración nativa/backend.
 */
const ConfigurarAlerta: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [paso, setPaso] = useState<Paso>('cuenta');
  const [segundos, setSegundos] = useState(5);
  const [secuencia, setSecuencia] = useState<string[]>([]);
  const [intento, setIntento] = useState<string[]>([]);
  const [pruebas, setPruebas] = useState(0);

  useEffect(() => {
    if (paso !== 'cuenta') return;
    const timer = setTimeout(() => (segundos > 1 ? setSegundos(segundos - 1) : setPaso('grabando')), 1000);
    return () => clearTimeout(timer);
  }, [paso, segundos]);

  function comprobar() {
    if (!mismaSecuencia(secuencia, intento)) return setPaso('error');
    setIntento([]);
    if (pruebas + 1 >= PRUEBAS_REQUERIDAS) setPaso('exito');
    else setPruebas(pruebas + 1);
  }

  const botones = (pulsar: (boton: string) => void) =>
    BOTONES_ALERTA.map((boton) => (
      <button key={boton} type="button" className="wf-button wf-button--secondary" onClick={() => pulsar(boton)}>
        {boton}
      </button>
    ));

  if (paso === 'cuenta') {
    return (
      <Notice
        title="Configurar alerta"
        message={`En ${segundos} segundos su aplicación grabará una secuencia de botones que se activarán como señal de alerta en segundo plano.`}
        onClose={onClose}
      />
    );
  }

  if (paso === 'grabando') {
    return (
      <Modal
        title="Grabando"
        onClose={onClose}
        actions={
          <button type="button" className="wf-button" disabled={secuencia.length === 0} onClick={() => setPaso('probar')}>
            Terminar grabación
          </button>
        }
      >
        <div className="wf-row">{botones((b) => setSecuencia([...secuencia, b]))}</div>
        <p className="wf-muted">Secuencia: {secuencia.join(' → ') || '—'}</p>
      </Modal>
    );
  }

  if (paso === 'probar') {
    return (
      <Modal
        title="Probar"
        onClose={onClose}
        actions={
          <button type="button" className="wf-button" disabled={intento.length === 0} onClick={comprobar}>
            Comprobar Test {pruebas + 1}
          </button>
        }
      >
        <p>Para finalizar necesita repetir la secuencia grabada {PRUEBAS_REQUERIDAS} veces para asegurar su funcionamiento.</p>
        <p>
          Test 1 {pruebas >= 1 ? '✔' : '○'} · Test 2 {pruebas >= 2 ? '✔' : '○'}
        </p>
        <div className="wf-row">{botones((b) => setIntento([...intento, b]))}</div>
        <p className="wf-muted">Intento: {intento.join(' → ') || '—'}</p>
      </Modal>
    );
  }

  return paso === 'exito' ? (
    <Notice
      title="Prueba exitosa"
      tone="success"
      message="Su prueba fue exitosa: cada vez que utilice este código se enviará un mensaje de alerta a sus contactos vinculados. (La secuencia aún no se guarda: pendiente de integración.)"
      onClose={onClose}
    />
  ) : (
    <Notice
      title="Prueba errónea"
      tone="error"
      message="Ocurrió un error en su prueba, vuelva a intentar la grabación nuevamente."
      onClose={onClose}
    />
  );
};

export default ConfigurarAlerta;
