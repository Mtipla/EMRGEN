import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { IonButton, IonContent, IonHeader, IonInput, IonPage, IonText, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { Pendiente, PinDialog } from '@repo/ui/wireframe';
import { apiFetch, clearSession, getUser, saveSession } from '../lib/session';

/** Paso PIN tras el login: crea el PIN inicial (POST /usuarios/me/pin) o pide el PIN existente. */
const Pin: React.FC = () => {
  const router = useIonRouter();
  const user = getUser();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  async function crearPin(PIN: string) {
    await apiFetch('/usuarios/me/pin', { method: 'POST', body: JSON.stringify({ PIN }) });
    saveSession({ ...user!, requiere_pin: false });
    router.push('/home', 'root', 'replace');
  }

  function salir() {
    clearSession();
    router.push('/login', 'root', 'replace');
  }

  function continuar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{4}$/.test(pin)) return setError('El PIN debe tener 4 dígitos.');
    router.push('/home', 'root', 'replace');
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
        {user.requiere_pin ? (
          <PinDialog
            title="Primer inicio"
            info="Esta cuenta no se encuentra vinculada con ningún PIN de ingreso. Deberás crear uno de 4 dígitos."
            onSubmit={crearPin}
            onClose={salir}
          />
        ) : (
          <form onSubmit={continuar}>
            <Pendiente>el backend aún no verifica el PIN al iniciar sesión; se continúa sin validarlo</Pendiente>
            <IonInput
              label="PIN"
              labelPlacement="stacked"
              type="password"
              inputmode="numeric"
              maxlength={4}
              value={pin}
              onIonInput={(e) => setPin(String(e.detail.value ?? '').replace(/\D/g, ''))}
            />
            {error && (
              <IonText color="danger">
                <p role="alert">{error}</p>
              </IonText>
            )}
            <IonButton type="submit" expand="block">
              Siguiente
            </IonButton>
            <IonButton fill="clear" expand="block" onClick={salir}>
              Cerrar sesión
            </IonButton>
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Pin;
