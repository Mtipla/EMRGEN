import { Navigate } from 'react-router-dom';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { PinDialog } from '@repo/ui/wireframe';
import { apiFetch, clearSession, getUser, saveSession } from '../lib/session';

/** Primer inicio de una principal sin PIN: lo crea (POST /usuarios/me/pin). El PIN de cada perfil se verifica en el login. */
const Pin: React.FC = () => {
  const router = useIonRouter();
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;
  if (!user.requiere_pin) return <Navigate to="/home" replace />;

  async function crearPin(PIN: string) {
    await apiFetch('/usuarios/me/pin', { method: 'POST', body: JSON.stringify({ PIN }) });
    saveSession({ ...user!, requiere_pin: false });
    router.push('/home', 'root', 'replace');
  }

  function salir() {
    clearSession();
    router.push('/login', 'root', 'replace');
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>FIND ME</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>{user.correo_usuario}</p>
        <PinDialog
          title="Primer inicio"
          info="Esta cuenta no se encuentra vinculada con ningún PIN de ingreso. Deberás crear uno de 4 dígitos."
          onSubmit={crearPin}
          onClose={salir}
        />
      </IonContent>
    </IonPage>
  );
};

export default Pin;
