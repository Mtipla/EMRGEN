import { useEffect, useState } from "react";
import { App } from "@capacitor/app";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import {
  apiFetch,
  errorText,
  restaurarSesionNativa,
  type SessionUser,
} from "../lib/session";
import {
  etiquetaVolumen,
  volumeSos,
  volumenAndroid,
  type VolumeSosState,
} from "../lib/volumen-nativo";
import "./AlertaVolumen.css";

export default function AlertaVolumen({
  tienePlan,
  onConfigurar,
}: {
  tienePlan: boolean;
  onConfigurar: () => void;
}) {
  const [state, setState] = useState<VolumeSosState | null>(null);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const android = volumenAndroid();
  const running = Boolean(state?.enabled || state?.recovering);
  useEffect(() => {
    if (!android) return;
    let active = true;
    const refresh = () =>
      void volumeSos
        .getStatus()
        .then((value) => {
          if (active) setState(value);
        })
        .catch((cause) => {
          if (active) setError(errorText(cause));
        });
    refresh();
    const stateListener = volumeSos.addListener("stateChanged", (value) => {
      if (active) setState(value);
    });
    const appListener = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) refresh();
    });
    return () => {
      active = false;
      void stateListener.then((handle) => handle.remove()).catch(() => {});
      void appListener.then((handle) => handle.remove()).catch(() => {});
    };
  }, [android]);

  async function alternar() {
    if (!state || ocupado) return;
    setOcupado(true);
    setError("");
    try {
      if (!running) {
        const user = await apiFetch<SessionUser>("/usuarios/me");
        if (!user.plan_efectivo)
          throw new Error("Se requiere un plan para activar esta función.");
        const profile = await apiFetch<{ prioridad_ID: number | null }>(
          "/usuarios/me/perfil",
        );
        if (!profile.prioridad_ID)
          throw new Error(
            "Configura la finalidad de tu perfil: será la prioridad del SOS.",
          );
        await restaurarSesionNativa();
      }
      setState(await volumeSos.setEnabled({ enabled: !running }));
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>SOS con botones de volumen</IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="volume-sos">
        <p>
          Tu secuencia activa la alerta con la prioridad guardada en tu perfil.
        </p>
        <section
          className="volume-sos__section"
          aria-labelledby="volume-sos-sequence"
        >
          <h3 id="volume-sos-sequence">Tu secuencia</h3>
          {android ? (
            <>
              <p className="volume-sos__sequence">
                {state?.sequence.length
                  ? state.sequence.map(etiquetaVolumen).join(" → ")
                  : "Graba y comprueba tu secuencia."}
              </p>
              <p className="volume-sos__hint">
                Máximo 2 segundos entre pulsaciones. Mantener una tecla cuenta
                una vez.
              </p>
            </>
          ) : (
            <p>Esta función requiere el APK Android.</p>
          )}
          <button
            type="button"
            className="wf-button wf-button--secondary"
            aria-disabled={!tienePlan}
            disabled={android && (!state || !state.authorized)}
            onClick={onConfigurar}
          >
            Configurar alerta
          </button>
        </section>
        {android && (
          <>
            {state && !state.authorized && (
              <p className="wf-message wf-message--error">
                Vuelve a iniciar sesión para configurar o activar la detección.
              </p>
            )}
            <section
              className="volume-sos__section"
              aria-labelledby="volume-sos-background"
            >
              <div className="volume-sos__heading">
                <h3 id="volume-sos-background">Segundo plano</h3>
                <strong
                  role="status"
                  className={`volume-sos__badge${state?.enabled ? " volume-sos__badge--active" : ""}`}
                >
                  {state?.recovering
                    ? "RECONECTANDO"
                    : state?.enabled
                      ? "ACTIVADO"
                      : "DESACTIVADO"}
                </strong>
              </div>
              <p className="volume-sos__hint">
                Permite la actividad en segundo plano y evita restricciones de
                batería.
              </p>
              {!state?.accessibilityEnabled && (
                <div className="volume-sos__permission">
                  <p>
                    Habilita «EMERGEN · Secuencia de volumen» en Accesibilidad.
                    Solo accede a las teclas de volumen.
                  </p>
                  <button
                    className="wf-button wf-button--secondary"
                    type="button"
                    onClick={() =>
                      void volumeSos
                        .openAccessibilitySettings()
                        .catch((cause) => setError(errorText(cause)))
                    }
                  >
                    Habilitar acceso a los botones
                  </button>
                </div>
              )}
              <div className="volume-sos__actions">
                <button
                  type="button"
                  className="wf-button"
                  disabled={
                    ocupado ||
                    !state ||
                    (!running && (!tienePlan || !state.sequence.length))
                  }
                  onClick={() => void alternar()}
                >
                  {ocupado
                    ? "Preparando…"
                    : running
                      ? "Desactivar segundo plano"
                      : "Activar segundo plano"}
                </button>
                <button
                  type="button"
                  className="wf-button wf-button--secondary"
                  onClick={() =>
                    void volumeSos
                      .openAppSettings()
                      .catch((cause) => setError(errorText(cause)))
                  }
                >
                  Permisos y batería
                </button>
              </div>
            </section>
            <section
              className="volume-sos__section"
              aria-labelledby="volume-sos-location"
            >
              <h3 id="volume-sos-location">Ubicación</h3>
              <p role="status">
                {state?.location?.message ?? "Consultando ubicación…"}
                {state?.location?.available &&
                  state.location.accuracyMeters >= 0 && (
                    <span className="volume-sos__detail">
                      Precisión estimada: ±
                      {Math.ceil(state.location.accuracyMeters)} m.
                    </span>
                  )}
              </p>
              <p className="volume-sos__hint">
                Sin ubicación reciente, la alerta se envía sin coordenadas.
              </p>
            </section>
            {state?.authorized && (
              <section
                className="volume-sos__section"
                aria-labelledby="volume-sos-session"
              >
                <h3 id="volume-sos-session">Sesión</h3>
                <p>
                  Disponible hasta{" "}
                  <time dateTime={new Date(state.expiresAt).toISOString()}>
                    {new Date(state.expiresAt).toLocaleString("es-CL", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </time>
                  .
                </p>
                <p className="volume-sos__hint">
                  Al vencer, inicia sesión y vuelve a activar la detección.
                </p>
              </section>
            )}
            {state?.lastResult.message && (
              <p className="volume-sos__result" role="status">
                {state.lastResult.message}
              </p>
            )}
          </>
        )}
        {error && (
          <p className="wf-message wf-message--error" role="alert">
            {error}
          </p>
        )}
      </IonCardContent>
    </IonCard>
  );
}
