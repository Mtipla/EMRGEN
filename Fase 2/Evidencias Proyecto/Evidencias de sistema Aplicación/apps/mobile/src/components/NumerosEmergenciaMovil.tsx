import { useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { NumerosEmergencia } from '@repo/ui/wireframe';

const EmergencyDialer = registerPlugin<{
  openDialer(options: { numero: string }): Promise<void>;
}>('EmergencyDialer');

const NumerosEmergenciaMovil = () => {
  const [error, setError] = useState('');

  function abrirMarcador(numero: string) {
    setError('');
    void EmergencyDialer.openDialer({ numero }).catch(() => {
      setError(`No se pudo abrir el marcador. Puedes marcar ${numero} manualmente en la aplicación Teléfono.`);
    });
  }

  return (
    <div>
      <NumerosEmergencia
        descripcion="Una vez presionado un número de emergencia, se redirigirá y digitará para un llamado rápido."
        onSeleccionar={Capacitor.getPlatform() === 'android' ? abrirMarcador : undefined}
      />
      {error && <p role="alert" className="wf-message wf-message--error">{error}</p>}
    </div>
  );
};

export default NumerosEmergenciaMovil;
