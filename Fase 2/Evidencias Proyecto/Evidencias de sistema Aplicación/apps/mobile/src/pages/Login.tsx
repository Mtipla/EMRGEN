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

/** Mismo flujo que la web (AuthForm): credenciales de la principal, elegir perfil, su PIN y, si es temporal, cambiarlo. */
type Paso = 'credenciales' | 'perfil' | 'pin' | 'cambio';

type Perfil = { usuario_ID: number; nombre_usuario: string; tipo: 'PRINCIPAL' | 'APADRINADO'; tiene_pin: boolean };

type LoginResponse = {
  access_token?: string;
  usuario?: SessionUser;
  perfiles?: Perfil[];
  cambio_pin_requerido?: true;
};

const soloDigitos = (value: unknown) => String(value ?? '').replace(/\D/g, '').slice(0, 4);

/** "Inicio de sesión": POST /usuarios/login, igual que la web. */
const Login: React.FC = () => {
  const router = useIonRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [paso, setPaso] = useState<Paso>('credenciales');
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [pin, setPin] = useState('');
  const [pinNuevo, setPinNuevo] = useState('');
  const [pinConfirmacion, setPinConfirmacion] = useState('');
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (paso === 'cambio' && pinNuevo !== pinConfirmacion) return setError('Los PIN no coinciden.');
    setCargando(true);
    try {
      const data = await apiFetch<LoginResponse>('/usuarios/login', {
        method: 'POST',
        body: JSON.stringify({
          correo_usuario: correo.trim(),
          password,
          ...(perfil && paso !== 'credenciales' && { perfil_ID: perfil.usuario_ID, PIN: pin }),
          ...(paso === 'cambio' && { PIN_nuevo: pinNuevo }),
        }),
      });
      if (data.perfiles) {
        setPerfiles(data.perfiles);
        setPaso('perfil');
        return;
      }
      if (data.cambio_pin_requerido) {
        setPaso('cambio');
        setAviso('Es tu primer ingreso: reemplaza el PIN temporal por uno propio.');
        return;
      }
      if (!data.usuario || !data.access_token) throw new Error('Respuesta de inicio de sesión inesperada');
      saveSession(data.usuario, data.access_token);
      // Una principal sin PIN aún recibe sesión con requiere_pin y lo crea en /pin.
      router.push(data.usuario.requiere_pin ? '/pin' : '/home', 'root', 'replace');
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setCargando(false);
    }
  }

  function volver() {
    setError('');
    setAviso('');
    setPaso(paso === 'perfil' ? 'credenciales' : 'perfil');
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>FIND ME</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>
          {paso === 'credenciales' ? 'Inicio de sesión' : paso === 'perfil' ? '¿Quién eres?' : `PIN de ${perfil?.nombre_usuario}`}
        </h1>
        <form onSubmit={(event) => void entrar(event)}>
          {paso === 'credenciales' && (
            <>
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
            </>
          )}
          {paso === 'perfil' &&
            perfiles.map((p) => (
              <IonButton
                key={p.usuario_ID}
                expand="block"
                fill="outline"
                disabled={!p.tiene_pin}
                onClick={() => {
                  setPerfil(p);
                  setPin('');
                  setError('');
                  setPaso('pin');
                }}
              >
                {p.nombre_usuario} · {p.tipo === 'PRINCIPAL' ? 'Principal' : 'Apadrinado'}
                {!p.tiene_pin && ' · sin PIN'}
              </IonButton>
            ))}
          {(paso === 'pin' || paso === 'cambio') && (
            <IonInput
              label={paso === 'cambio' ? 'PIN temporal' : 'PIN'}
              labelPlacement="stacked"
              type="password"
              inputmode="numeric"
              maxlength={4}
              value={pin}
              readonly={paso === 'cambio'}
              onIonInput={(e) => setPin(soloDigitos(e.detail.value))}
              required
            />
          )}
          {paso === 'cambio' && (
            <>
              <IonInput
                label="PIN nuevo"
                labelPlacement="stacked"
                type="password"
                inputmode="numeric"
                maxlength={4}
                value={pinNuevo}
                onIonInput={(e) => setPinNuevo(soloDigitos(e.detail.value))}
                required
              />
              <IonInput
                label="Confirmar PIN nuevo"
                labelPlacement="stacked"
                type="password"
                inputmode="numeric"
                maxlength={4}
                value={pinConfirmacion}
                onIonInput={(e) => setPinConfirmacion(soloDigitos(e.detail.value))}
                required
              />
            </>
          )}
          {aviso && (
            <IonText color="primary">
              <p>{aviso}</p>
            </IonText>
          )}
          {error && (
            <IonText color="danger">
              <p role="alert">{error}</p>
            </IonText>
          )}
          {paso !== 'perfil' && (
            <IonButton type="submit" expand="block" disabled={cargando}>
              {cargando ? 'Procesando…' : 'Siguiente'}
            </IonButton>
          )}
        </form>
        {paso === 'credenciales' ? (
          <>
            <IonButton fill="clear" expand="block" routerLink="/registro">
              No tengo cuenta
            </IonButton>
            <p className="ion-text-center">
              {/* PENDIENTE DE INTEGRACIÓN BACKEND: no hay flujo de recuperación de credenciales. */}
              <IonText color="medium">¿Has olvidado tu correo electrónico o contraseña?</IonText>
            </p>
          </>
        ) : (
          <IonButton fill="clear" expand="block" onClick={volver}>
            Volver
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Login;
