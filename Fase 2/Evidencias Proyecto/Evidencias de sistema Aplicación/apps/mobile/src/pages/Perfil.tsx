import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { PerfilForm, perfilApi } from '@repo/ui/perfil-form';
import { accesoCompleto } from '@repo/ui/permisos';
import { apiFetch, getUser, saveSession, type SessionUser } from '../lib/session';

// Fuera del componente: PerfilForm recarga cuando cambia `api`.
const perfilDatos = perfilApi(apiFetch);

/** "Modificar Usuario": nombre y correo con PATCH /usuarios/me; datos de emergencia con /usuarios/me/perfil y /contactos. */
const Perfil: React.FC = () => {
  const user = getUser();

  async function guardar(nombre_usuario: string, correo_usuario: string, PIN_principal?: string) {
    saveSession(
      await apiFetch<SessionUser>('/usuarios/me', {
        method: 'PATCH',
        body: JSON.stringify({ nombre_usuario, correo_usuario, PIN_principal }),
      }),
    );
  }

  async function cambiarPassword(password_actual: string, password_nueva: string) {
    await apiFetch('/usuarios/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ password_actual, password_nueva }),
    });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Volver" />
          </IonButtons>
          <IonTitle>Modificar usuario</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {user && (
          <PerfilForm
            nombreUsuario={user.nombre_usuario}
            correo={user.correo_usuario}
            accesoParcial={user.estado_ID !== undefined && !accesoCompleto(user)}
            onGuardar={guardar}
            api={perfilDatos}
            onCambiarPassword={cambiarPassword}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Perfil;
