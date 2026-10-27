import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Pin from './pages/Pin';
import Perfil from './pages/Perfil';
import Cuentas from './pages/Cuentas';
import Soporte from './pages/Soporte';
import { bloqueo, type Accion } from '@repo/ui/permisos';
import { getUser } from './lib/session';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

/** Pantallas que exigen sesión con PIN creado (y un permiso si se indica); se evalúa al montar. Home muestra el motivo del bloqueo. */
const Privada: React.FC<{ children: React.ReactElement; accion?: Accion }> = ({ children, accion }) => {
  const user = getUser();
  if (user?.requiere_pin !== false) return <Navigate to="/login" replace />;
  return !accion || !bloqueo(user, accion) ? children : <Navigate to="/home" replace />;
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/pin" element={<Pin />} />
        <Route path="/home" element={<Privada><Home /></Privada>} />
        <Route path="/perfil" element={<Privada><Perfil /></Privada>} />
        <Route path="/cuentas" element={<Privada accion="cuentas.apadrinadas"><Cuentas /></Privada>} />
        <Route path="/soporte" element={<Privada accion="soporte.solicitar"><Soporte /></Privada>} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
