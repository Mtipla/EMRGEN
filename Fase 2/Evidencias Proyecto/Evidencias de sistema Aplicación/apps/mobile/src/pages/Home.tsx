import { useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonPopover,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonViewWillEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import { bloqueo, visible as permitido } from '@repo/ui/permisos';
import { ResumenCuenta } from '@repo/ui/resumen-cuenta';
import { Notice } from '@repo/ui/wireframe';
import AlertaSos from '../components/AlertaSos';
import AlertasActivas from '../components/AlertasActivas';
import ConfigurarAlerta from '../components/ConfigurarAlerta';
import AlertaVolumen from '../components/AlertaVolumen';
import { apiFetch, clearSession, getUser, saveSession, type SessionUser } from '../lib/session';
import { MENSAJE_REQUIERE_PLAN } from '../lib/sos';
import './Home.css';

/** Home con sesión: SOS y seguimiento propio disponibles con plan efectivo. */
const Home: React.FC = () => {
  const router = useIonRouter();
  const [user, setUser] = useState(getUser);
  const [visible, setVisible] = useState(true);
  const [revision, setRevision] = useState(0);
  const [versionAlertas, setVersionAlertas] = useState(0);
  const [modal, setModal] = useState<'sos' | 'configurar' | 'plan' | null>(null);
  const cuentasBloqueadas = !user || bloqueo(user, 'cuentas.apadrinadas') !== null;
  const tienePlan = user?.plan_efectivo === true;

  useIonViewWillEnter(() => {
    setUser(getUser());
    setVisible(true);
    setRevision((v) => v + 1);
  });
  useIonViewDidLeave(() => {
    setVisible(false);
    setModal(null);
  });

  useEffect(() => {
    if (!visible) return;
    const peticion = new AbortController();
    // Actualiza el plan al volver al Home; la sesión guardada puede anteceder una compra.
    void apiFetch<SessionUser>('/usuarios/me', { signal: peticion.signal })
      .then((actual) => {
        if (!peticion.signal.aborted) {
          saveSession(actual);
          setUser(actual);
        }
      })
      .catch(() => {
        /* Se conserva la última sesión; cada operación sigue autorizándose en servidor. */
      });
    return () => peticion.abort();
  }, [visible, revision]);

  useEffect(() => {
    const actualizar = () => setRevision((v) => v + 1);
    window.addEventListener('focus', actualizar);
    return () => window.removeEventListener('focus', actualizar);
  }, []);

  function abrir(accion: 'sos' | 'configurar') {
    setModal(tienePlan ? accion : 'plan');
  }

  function cerrarSesion() {
    clearSession();
    setVisible(false);
    setUser(null);
    setModal(null);
    router.push('/login', 'root', 'replace');
  }

  return (
    <IonPage className="mobile-home">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{user?.nombre_usuario ?? 'EMERGEN'}</IonTitle>
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
              {user && permitido(user, 'soporte.solicitar') && (
                <IonItem button detail={false} routerLink="/soporte">
                  Solicitar soporte
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
        {/* abrir bloquea la acción; el control sigue recibiendo pulsaciones para explicar el requisito. */}
        <button
          type="button"
          aria-disabled={!tienePlan}
          className={`wf-button mobile-plan-action mobile-alerta-rapida${tienePlan ? '' : ' mobile-plan-locked'}`}
          onClick={() => abrir('sos')}
        >
          Alerta rápida en la APP
        </button>

        <AlertaVolumen tienePlan={tienePlan} onConfigurar={() => abrir('configurar')} />

        {user && <ResumenCuenta user={user} />}
        {tienePlan && user && visible && (
          <AlertasActivas
            key={user.usuario_ID}
            usuarioId={user.usuario_ID}
            version={versionAlertas}
          />
        )}
      </IonContent>

      {modal === 'plan' && (
        <Notice
          title="Requiere un plan"
          message={MENSAJE_REQUIERE_PLAN}
          onClose={() => setModal(null)}
        />
      )}
      {tienePlan && modal === 'sos' && (
        <AlertaSos
          onClose={() => setModal(null)}
          onRegistrada={() => setVersionAlertas((v) => v + 1)}
        />
      )}
      {tienePlan && modal === 'configurar' && <ConfigurarAlerta onClose={() => setModal(null)} />}
    </IonPage>
  );
};

export default Home;
