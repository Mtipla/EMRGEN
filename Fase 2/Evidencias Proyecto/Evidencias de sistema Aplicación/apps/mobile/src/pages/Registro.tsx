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
} from '@ionic/react';
import { Notice, Pendiente } from '@repo/ui/wireframe';

/**
 * "Registrar usuario". PENDIENTE DE INTEGRACIÓN: el alta real (Firebase + verificación de
 * correo + POST /usuarios/registro) está en apps/web/src/features/auth/AuthForm.tsx.
 */
const Registro: React.FC = () => {
  const [campos, setCampos] = useState({ usuario: '', correo: '', password: '', confirmacion: '' });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(false);

  const campo = (clave: keyof typeof campos) => ({
    value: campos[clave],
    onIonInput: (e: CustomEvent<{ value?: string | null }>) =>
      setCampos((actual) => ({ ...actual, [clave]: String(e.detail.value ?? '') })),
  });

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (campos.password.length < 8) return setError('Usa al menos 8 caracteres.');
    if (campos.password !== campos.confirmacion) return setError('Las contraseñas no coinciden.');
    setError('');
    setAviso(true);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Registrar usuario</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <Pendiente>el registro móvil aún no crea la cuenta; usa la web para registrarte</Pendiente>
        <form onSubmit={enviar}>
          <IonInput label="Nombre de usuario" labelPlacement="stacked" minlength={2} maxlength={50} {...campo('usuario')} required />
          <IonInput label="Correo electrónico" labelPlacement="stacked" type="email" {...campo('correo')} required />
          <IonInput label="Contraseña" labelPlacement="stacked" type="password" {...campo('password')} required />
          <IonInput label="Confirmar contraseña" labelPlacement="stacked" type="password" {...campo('confirmacion')} required />
          {error && (
            <IonText color="danger">
              <p role="alert">{error}</p>
            </IonText>
          )}
          <IonButton type="submit" expand="block">
            Siguiente
          </IonButton>
        </form>
        {aviso && (
          <Notice
            title="Confirmando registro"
            message="Aquí se enviará la verificación a tu correo electrónico para poder iniciar sesión (pendiente de integración)."
            onClose={() => setAviso(false)}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Registro;
