import { useEffect, useState } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { SolicitudSoporte, type Ticket } from "@repo/ui/soporte";
import { errorText, internalFetch } from "../lib/session";

/** "Solicitar soporte": categorías y tickets propios de internal-api (GET/POST /internal/v1/tickets-soporte). */
const Soporte: React.FC = () => {
  const [categorias, setCategorias] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [carga, setCarga] = useState({ cargando: true, error: "" });
  const [version, setVersion] = useState(0);
  const [visible, setVisible] = useState(true);
  const [primerPlano, setPrimerPlano] = useState(() => !document.hidden);

  useIonViewWillEnter(() => {
    setVisible(true);
    setVersion((actual) => actual + 1);
  });
  useIonViewDidLeave(() => setVisible(false));

  useEffect(() => {
    let vigente = true;
    const actualizar = () => {
      if (!vigente) return;
      setPrimerPlano(!document.hidden);
      if (!document.hidden) setVersion((actual) => actual + 1);
    };
    document.addEventListener("visibilitychange", actualizar);
    window.addEventListener("focus", actualizar);
    const listener = Capacitor.isNativePlatform()
      ? App.addListener("appStateChange", ({ isActive }) => {
          if (!vigente) return;
          setPrimerPlano(isActive && !document.hidden);
          if (isActive) setVersion((actual) => actual + 1);
        }).catch(() => null)
      : Promise.resolve(null);
    return () => {
      vigente = false;
      document.removeEventListener("visibilitychange", actualizar);
      window.removeEventListener("focus", actualizar);
      void listener.then((handle) => handle?.remove()).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!visible || !primerPlano) return;
    let activo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    let peticion: AbortController | undefined;
    let catalogo: { categoria_id: number; nombre: string }[] | undefined;
    async function consultar() {
      const controller = new AbortController();
      peticion = controller;
      try {
        const [categoriasActuales, lista] = await Promise.all([
          catalogo ??
            internalFetch<{ categoria_id: number; nombre: string }[]>(
              "/tickets-soporte/categorias",
              { signal: controller.signal, cache: "no-store" },
            ),
          internalFetch<Ticket[]>("/tickets-soporte", {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);
        if (!activo) return;
        if (!catalogo) {
          catalogo = categoriasActuales;
          setCategorias(
            catalogo.map((f) => ({ id: f.categoria_id, nombre: f.nombre })),
          );
        }
        setTickets(lista);
        setCarga({ cargando: false, error: "" });
      } catch (cause) {
        if (activo && !controller.signal.aborted) {
          setCarga({
            cargando: false,
            error: `${errorText(cause)} El listado puede estar desactualizado.`,
          });
        }
      } finally {
        if (activo) temporizador = setTimeout(() => void consultar(), 3000);
      }
    }
    void consultar();
    return () => {
      activo = false;
      clearTimeout(temporizador);
      peticion?.abort();
    };
  }, [version, visible, primerPlano]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Volver" />
          </IonButtons>
          <IonTitle>Solicitar soporte</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setVersion((actual) => actual + 1)}>
              Actualizar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <SolicitudSoporte
          categorias={categorias}
          tickets={tickets}
          cargando={carga.cargando}
          error={carga.error}
          onCrear={async (descripcion, categoria_id) => {
            await internalFetch("/tickets-soporte", {
              method: "POST",
              body: JSON.stringify({ descripcion, categoria_id }),
            });
            setVersion((v) => v + 1);
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Soporte;
