import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { PerfilForm } from '@repo/ui/perfil-form';
import { accesoCompleto } from '@repo/ui/permisos';
import { apiFetch, getUser, saveSession, type SessionUser } from '../lib/session';

/** "Modificar Usuario": nombre de usuario y correo con PATCH /usuarios/me; el resto pendiente. */
const Perfil: React.FC = () => {
  const user = getUser();

  async function guardar(nombre_usuario: string, correo_usuario: string) {
    saveSession(
      await apiFetch<SessionUser>('/usuarios/me', {
        method: 'PATCH',
        body: JSON.stringify({ nombre_usuario, correo_usuario }),
      }),
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
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
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Perfil;
