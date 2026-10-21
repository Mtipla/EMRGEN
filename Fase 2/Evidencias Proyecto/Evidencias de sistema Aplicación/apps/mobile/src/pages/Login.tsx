import { useState, type FormEvent } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { apiFetch, errorText, saveSession, type SessionUser } from '../lib/session';

/** "Inicio de sesión": POST /usuarios/login, igual que la web. */
const Login: React.FC = () => {
  const router = useIonRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setCargando(true);
    try {
      const data = await apiFetch<{ access_token: string; usuario: SessionUser }>('/usuarios/login', {
        method: 'POST',
        body: JSON.stringify({ correo_usuario: correo.trim(), password }),
      });
      saveSession(data.usuario, data.access_token);
      router.push('/pin', 'forward', 'replace');
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setCargando(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>FIND ME</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Inicio de sesión</h1>
        <form onSubmit={(event) => void entrar(event)}>
          <IonInput
            label="Correo electrónico"
            labelPlacement="stacked"
            type="email"
            autocomplete="email"
            value={correo}
            onIonInput={(e) => setCorreo(String(e.detail.value ?? ''))}
            required
          />
          <IonInput
            label="Contraseña"
            labelPlacement="stacked"
            type="password"
            autocomplete="current-password"
            value={password}
            onIonInput={(e) => setPassword(String(e.detail.value ?? ''))}
            required
          />
          {error && (
            <IonText color="danger">
              <p role="alert">{error}</p>
            </IonText>
          )}
          <IonButton type="submit" expand="block" disabled={cargando}>
            {cargando ? 'Procesando…' : 'Siguiente'}
          </IonButton>
        </form>
        <IonButton fill="clear" expand="block" routerLink="/registro">
          No tengo cuenta
        </IonButton>
        <p className="ion-text-center">
          {/* PENDIENTE DE INTEGRACIÓN BACKEND: no hay flujo de recuperación de credenciales. */}
          <IonText color="medium">¿Has olvidado tu correo electrónico o contraseña?</IonText>
        </p>
      </IonContent>
    </IonPage>
  );
};

export default Login;
