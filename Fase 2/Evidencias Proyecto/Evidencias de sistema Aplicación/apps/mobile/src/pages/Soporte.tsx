import { useEffect, useState } from 'react';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { SolicitudSoporte, type Ticket } from '@repo/ui/soporte';
import { errorText, internalFetch } from '../lib/session';

/** "Solicitar soporte": categorías y tickets propios de internal-api (GET/POST /internal/v1/tickets-soporte). */
const Soporte: React.FC = () => {
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [carga, setCarga] = useState({ cargando: true, error: '' });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let activo = true;
    Promise.all([
      internalFetch<{ categoria_id: number; nombre: string }[]>('/tickets-soporte/categorias'),
      internalFetch<Ticket[]>('/tickets-soporte'),
    ]).then(
      ([catalogo, lista]) => {
        if (!activo) return;
        setCategorias(catalogo.map((f) => ({ id: f.categoria_id, nombre: f.nombre })));
        setTickets(lista);
        setCarga({ cargando: false, error: '' });
      },
      (cause: unknown) => activo && setCarga({ cargando: false, error: errorText(cause) }),
    );
    return () => {
      activo = false;
    };
  }, [version]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Volver" />
          </IonButtons>
          <IonTitle>Solicitar soporte</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <SolicitudSoporte
          categorias={categorias}
          tickets={tickets}
          cargando={carga.cargando}
          error={carga.error}
          onCrear={async (descripcion, categoria_id) => {
            await internalFetch('/tickets-soporte', { method: 'POST', body: JSON.stringify({ descripcion, categoria_id }) });
            setVersion((v) => v + 1);
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Soporte;
