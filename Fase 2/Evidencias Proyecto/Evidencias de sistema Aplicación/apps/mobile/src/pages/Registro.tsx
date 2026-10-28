import { useState, type FormEvent } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { FirebaseAuthError } from '@repo/api-client';
import { env, firebaseAuth } from '../lib/api';

type Sesion = Awaited<ReturnType<typeof firebaseAuth.signUp>>;

/** Cuenta de Firebase a la espera de confirmar el correo; `creada` indica si se creó en este intento. */
type Pendiente = { sesion: Sesion; creada: boolean };

// Mismos mensajes que la web (AuthForm.tsx).
const MENSAJES_FIREBASE: Record<string, string> = {
  EMAIL_EXISTS: 'Ya existe una cuenta con ese correo.',
  INVALID_LOGIN_CREDENTIALS:
    'Ya existe una cuenta con ese correo. Si no terminaste el registro, usa la misma contraseña.',
  INVALID_EMAIL: 'El correo electrónico no es válido.',
  WEAK_PASSWORD: 'La contraseña es demasiado débil.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos. Espera unos minutos.',
};

/** Lee el claim email_verified; solo decide la UI, el backend verifica la firma del token. */
function correoConfirmado(idToken: string) {
  try {
    const payload = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return (JSON.parse(atob(payload)) as { email_verified?: boolean }).email_verified === true;
  } catch {
    return false;
  }
}

/**
 * POST /usuarios/registro con el ID token de Firebase, o /usuarios/registro/validar sin token (antes
 * de crear la cuenta de Firebase). Lanza el status para distinguir el 403 (falta confirmar).
 */
async function registrarEnBackend(nombre: string, correo: string, password: string, idToken?: string) {
  const response = await fetch(`${env.apiUrl}/usuarios/${idToken ? 'registro' : 'registro/validar'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(idToken && { Authorization: `Bearer ${idToken}` }) },
    body: JSON.stringify({ nombre_usuario: nombre, correo_usuario: correo, password }),
  });
  if (response.ok) return;
  const data = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const mensaje = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
  throw Object.assign(new Error(mensaje ?? 'No se pudo crear la cuenta'), { status: response.status });
}

function describirError(causa: unknown) {
  if (causa instanceof FirebaseAuthError) {
    return MENSAJES_FIREBASE[causa.code] ?? 'No se pudo crear la cuenta en Firebase. Inténtalo nuevamente.';
  }
  if (causa instanceof TypeError) return `No se pudo conectar con el backend (${env.apiUrl}).`;
  return causa instanceof Error ? causa.message : 'Ocurrió un error inesperado';
}

/** "Registrar usuario": mismo flujo que la web: Firebase, correo de confirmación y POST /usuarios/registro. */
const Registro: React.FC = () => {
  const router = useIonRouter();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const campo = (set: (valor: string) => void) => ({
    onIonInput: (e: CustomEvent<{ value?: string | null }>) => set(String(e.detail.value ?? '')),
  });

  async function ejecutar(accion: () => Promise<void>) {
    setMensaje('');
    setError('');
    setCargando(true);
    try {
      await accion();
    } catch (causa) {
      setError(describirError(causa));
    } finally {
      setCargando(false);
    }
  }

  /** Crea el usuario en la BD. Si el backend lo rechaza, borra la cuenta de Firebase creada en este intento. */
  async function completar(cuenta: Pendiente) {
    try {
      await registrarEnBackend(nombre.trim(), correo.trim(), password, cuenta.sesion.idToken);
    } catch (causa) {
      if (cuenta.creada && !(causa instanceof TypeError)) {
        await firebaseAuth.deleteAccount(cuenta.sesion.idToken).catch(() => undefined);
      }
      setPendiente(null);
      throw causa;
    }
    setPendiente(null);
    router.push('/login', 'root', 'replace');
  }

  async function iniciarRegistro() {
    const email = correo.trim();
    // Primero el backend: si rechaza el correo o los datos, no se crea nada en Firebase.
    await registrarEnBackend(nombre.trim(), email, password);
    let cuenta: Pendiente;
    try {
      cuenta = { sesion: await firebaseAuth.signUp(email, password), creada: true };
    } catch (causa) {
      // Registro anterior sin terminar: se retoma con la misma contraseña.
      if (!(causa instanceof FirebaseAuthError && causa.code === 'EMAIL_EXISTS')) throw causa;
      cuenta = { sesion: await firebaseAuth.signIn(email, password), creada: false };
    }

    if (correoConfirmado(cuenta.sesion.idToken)) return completar(cuenta);

    // Con el correo sin confirmar el backend responde 403; cualquier otro error cancela el alta.
    try {
      await registrarEnBackend(nombre.trim(), email, password, cuenta.sesion.idToken);
    } catch (causa) {
      if ((causa as { status?: number }).status !== 403) {
        if (cuenta.creada && !(causa instanceof TypeError)) {
          await firebaseAuth.deleteAccount(cuenta.sesion.idToken).catch(() => undefined);
        }
        throw causa;
      }
    }
    await firebaseAuth.sendEmailVerification(cuenta.sesion.idToken);
    setPendiente(cuenta);
  }

  /** El claim email_verified solo cambia al refrescar el ID token. */
  async function refrescar(cuenta: Pendiente): Promise<Pendiente> {
    const sesion = await firebaseAuth.refresh(cuenta.sesion.refreshToken);
    const actualizada = { ...cuenta, sesion: { ...sesion, email: cuenta.sesion.email } };
    setPendiente(actualizada);
    return actualizada;
  }

  async function comprobarConfirmacion() {
    if (!pendiente) return;
    const cuenta = await refrescar(pendiente);
    if (!correoConfirmado(cuenta.sesion.idToken)) {
      throw new Error('Aún no confirmas tu correo. Revisa tu bandeja de entrada o la carpeta de spam.');
    }
    await completar(cuenta);
  }

  async function reenviarCorreo() {
    if (!pendiente) return;
    const cuenta = await refrescar(pendiente);
    await firebaseAuth.sendEmailVerification(cuenta.sesion.idToken);
    setMensaje(`Te enviamos un nuevo correo de confirmación a ${cuenta.sesion.email}.`);
  }

  async function cancelarRegistro() {
    if (pendiente?.creada) {
      const cuenta = await refrescar(pendiente).catch(() => pendiente);
      await firebaseAuth.deleteAccount(cuenta.sesion.idToken).catch(() => undefined);
    }
    setPendiente(null);
  }

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) return setError('Usa al menos 8 caracteres.');
    if (password !== confirmacion) return setError('Las contraseñas no coinciden.');
    void ejecutar(iniciarRegistro);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" text="Volver" />
          </IonButtons>
          <IonTitle>{pendiente ? 'Confirma tu correo' : 'Registrar usuario'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {pendiente ? (
          <>
            <p>
              Enviamos un enlace de confirmación a <strong>{pendiente.sesion.email}</strong>. Ábrelo y luego vuelve
              aquí para terminar de crear tu cuenta.
            </p>
            {mensaje && <IonText color="success"><p>{mensaje}</p></IonText>}
            {error && <IonText color="danger"><p role="alert">{error}</p></IonText>}
            <IonButton expand="block" disabled={cargando} onClick={() => void ejecutar(comprobarConfirmacion)}>
              {cargando ? 'Procesando…' : 'Ya confirmé mi correo'}
            </IonButton>
            <IonButton expand="block" fill="clear" disabled={cargando} onClick={() => void ejecutar(reenviarCorreo)}>
              ¿No te llegó? Reenviar correo
            </IonButton>
            <IonButton expand="block" fill="outline" disabled={cargando} onClick={() => void ejecutar(cancelarRegistro)}>
              Cancelar registro
            </IonButton>
          </>
        ) : (
          <form onSubmit={enviar}
            // IonButton no es un botón nativo: sin esto, Enter en un campo no envía el formulario.
            onKeyDown={(event) => {
              if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
                event.preventDefault();
                event.currentTarget.requestSubmit();
              }
            }}
          >
            <IonInput label="Nombre" labelPlacement="stacked" value={nombre} {...campo(setNombre)} minlength={2} required />
            <IonInput label="Correo electrónico" labelPlacement="stacked" type="email" value={correo} {...campo(setCorreo)} required />
            <IonInput label="Contraseña" labelPlacement="stacked" type="password" value={password} {...campo(setPassword)} required />
            <IonInput label="Confirmar contraseña" labelPlacement="stacked" type="password" value={confirmacion} {...campo(setConfirmacion)} required />
            {error && <IonText color="danger"><p role="alert">{error}</p></IonText>}
            <IonButton type="submit" expand="block" disabled={cargando}>
              {cargando ? 'Procesando…' : 'Registrarme'}
            </IonButton>
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Registro;
