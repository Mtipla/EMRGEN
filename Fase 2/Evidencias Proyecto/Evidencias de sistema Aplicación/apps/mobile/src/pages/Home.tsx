import { useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonPopover,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { MENSAJE_BLOQUEO, bloqueo } from '@repo/ui/permisos';
import { ResumenCuenta } from '@repo/ui/resumen-cuenta';
import { NumerosEmergencia } from '@repo/ui/wireframe';
import AlertaSos from '../components/AlertaSos';
import ConfigurarAlerta from '../components/ConfigurarAlerta';
import { clearSession, getUser } from '../lib/session';
import './Home.css';

/** Home con sesión: alerta rápida, alerta en segundo plano y menú de usuario. */
const Home: React.FC = () => {
  const router = useIonRouter();
  const user = getUser();
  // Menú según la matriz de permisos; el backend sigue autorizando cada llamada.
  const cuentasBloqueadas = !user || bloqueo(user, 'cuentas.apadrinadas') !== null;
  // shortcut: el SOS no se deshabilita aunque la sesión guardada diga "sin Premium" (puede estar desactualizada); el backend responde 409 con el motivo.
  const sosSinPremium = user ? bloqueo(user, 'alertas.emitir') === 'premium' : false;
  const [modal, setModal] = useState<'sos' | 'configurar' | null>(null);

  function cerrarSesion() {
    clearSession();
    router.push('/login', 'root', 'replace');
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{user?.nombre_usuario ?? 'FIND ME'}</IonTitle>
          <IonButtons slot="end">
            <IonButton id="menu-usuario">Menú ▾</IonButton>
          </IonButtons>
          <IonPopover trigger="menu-usuario" dismissOnSelect>
            <IonList>
              <IonItem button detail={false} routerLink="/perfil">
                Modificar usuario
              </IonItem>
              {!cuentasBloqueadas && (
                <IonItem button detail={false} routerLink="/cuentas">
                  Administrar cuentas
                </IonItem>
              )}
              <IonItem button detail={false} onClick={cerrarSesion}>
                Cerrar sesión
              </IonItem>
            </IonList>
          </IonPopover>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="block" color="danger" size="large" onClick={() => setModal('sos')}>
          Alerta rápida en la APP
        </IonButton>
        {sosSinPremium && <p className="wf-message wf-message--error">{MENSAJE_BLOQUEO.premium}</p>}

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Configurar alerta en segundo plano</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Realiza una secuencia de botones determinada por usted en un tiempo de 20 segundos.</p>
            <IonButton onClick={() => setModal('configurar')}>Configurar alerta</IonButton>
          </IonCardContent>
        </IonCard>

        {user && <ResumenCuenta user={user} />}

        <NumerosEmergencia />

        {modal === 'sos' && <AlertaSos onClose={() => setModal(null)} />}
        {modal === 'configurar' && <ConfigurarAlerta onClose={() => setModal(null)} />}
      </IonContent>
    </IonPage>
  );
};

export default Home;
