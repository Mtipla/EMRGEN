import { useEffect, useState } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react';
import type { ResumenCompraApadrinados } from '@repo/api-client';
import { CuentasApadrinadas } from '@repo/ui/cuentas-apadrinadas';
import { apiFetch, errorText } from '../lib/session';

/** "Administrar Cuentas" del principal: cupos de GET /compras/apadrinados. */
const Cuentas: React.FC = () => {
  const [presentAlert] = useIonAlert();
  const [cupos, setCupos] = useState<{ total: number | null; aviso: string }>();

  useEffect(() => {
    let activo = true;
    apiFetch<ResumenCompraApadrinados>('/compras/apadrinados').then(
      (resumen) => activo && setCupos({ total: resumen.cuposAdquiridos, aviso: '' }),
      (cause: unknown) => activo && setCupos({ total: null, aviso: errorText(cause) }),
    );
    return () => {
      activo = false;
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Administrar cuentas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {cupos ? (
          <CuentasApadrinadas
            cupos={cupos.total}
            aviso={cupos.aviso}
            onAnadir={() =>
              void presentAlert({
                header: 'Añadir cuenta',
                message: 'La compra de cuentas adicionales se realiza desde la web (Comprar Premium).',
                buttons: ['Ok, entiendo'],
              })
            }
          />
        ) : (
          <p>Cargando cuentas…</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Cuentas;
