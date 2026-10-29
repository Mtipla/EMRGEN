import { useCallback, useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { Modal, Notice } from "@repo/ui/wireframe";
import { mismaSecuencia, PRUEBAS_REQUERIDAS } from "../lib/alerta";
import {
  etiquetaVolumen,
  secuenciaValida,
  volumeSos,
  volumenAndroid,
  type VolumeKey,
} from "../lib/volumen-nativo";
import { errorText } from "../lib/session";

type Paso =
  "inicio" | "grabando" | "probar" | "probando" | "guardando" | "exito";
type Captura = {
  id: string;
  mode: "record" | "test" | null;
  keys: VolumeKey[];
  invalid: boolean;
};

/** La configuración solo recibe teclas nativas; estas pruebas nunca registran un SOS. */
const ConfigurarAlerta: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [paso, setPaso] = useState<Paso>("inicio");
  const [keys, setKeys] = useState<VolumeKey[]>([]);
  const [secuencia, setSecuencia] = useState<VolumeKey[]>([]);
  const [pruebas, setPruebas] = useState(0);
  const [error, setError] = useState("");
  const capture = useRef<Captura>({
    id: "",
    mode: null,
    keys: [],
    invalid: false,
  });
  const cerrar = useRef(onClose);
  const mounted = useRef(true);
  useEffect(() => {
    cerrar.current = onClose;
  }, [onClose]);

  const detener = useCallback(async () => {
    const id = capture.current.id;
    capture.current = { id: "", mode: null, keys: [], invalid: false };
    if (id) await volumeSos.endCapture({ captureId: id });
  }, []);

  useEffect(() => {
    if (!volumenAndroid()) return;
    mounted.current = true;
    let active = true;
    const listener = volumeSos.addListener("volumeKey", (event) => {
      if (!active || event.captureId !== capture.current.id) return;
      capture.current.keys = event.keys;
      capture.current.invalid ||=
        event.overflow || (capture.current.mode === "test" && event.gap);
      setKeys(event.keys);
      if (event.overflow)
        setError("Máximo 12 pulsaciones. Vuelve a grabar la secuencia.");
      else if (capture.current.mode === "test" && event.gap)
        setError("La pausa superó 2 segundos. Repite la prueba.");
    });
    const appListener = App.addListener("appStateChange", ({ isActive }) => {
      if (active && !isActive) cerrar.current();
    });
    return () => {
      active = false;
      mounted.current = false;
      void listener.then((handle) => handle.remove()).catch(() => {});
      void appListener.then((handle) => handle.remove()).catch(() => {});
      void detener().catch(() => {});
    };
  }, [detener]);

  const terminarGrabacion = useCallback(async () => {
    const current = capture.current;
    await detener();
    if (!secuenciaValida(current.keys) || current.invalid) {
      setError("Graba entre 3 y 12 pulsaciones, incluyendo volumen + y −.");
      setPaso("inicio");
      return;
    }
    setSecuencia(current.keys);
    setPruebas(0);
    setKeys([]);
    setPaso("probar");
  }, [detener]);

  useEffect(() => {
    if (paso !== "grabando" && paso !== "probando") return;
    const timeout = setTimeout(() => {
      if (paso === "grabando")
        void terminarGrabacion().catch((cause) => setError(errorText(cause)));
      else
        void detener().finally(() => {
          setPaso("probar");
          setError(
            "Se agotaron los 20 segundos de prueba. Inténtalo otra vez.",
          );
        });
    }, 20_000);
    return () => clearTimeout(timeout);
  }, [paso, detener, terminarGrabacion]);

  async function comenzar(mode: "record" | "test") {
    setError("");
    try {
      await detener();
      const result = await volumeSos.beginCapture();
      if (!mounted.current) {
        await volumeSos.endCapture({ captureId: result.captureId });
        return;
      }
      capture.current = {
        id: result.captureId,
        mode,
        keys: [],
        invalid: false,
      };
      setKeys([]);
      setPaso(mode === "record" ? "grabando" : "probando");
    } catch (cause) {
      setError(errorText(cause));
    }
  }
  async function comprobar() {
    const current = capture.current;
    try {
      await detener();
      if (current.invalid || !mismaSecuencia(secuencia, current.keys)) {
        setPruebas(0);
        setPaso("probar");
        setError(
          "La secuencia no coincide o contiene una pausa larga. Repite las dos pruebas.",
        );
        return;
      }
      if (pruebas + 1 < PRUEBAS_REQUERIDAS) {
        setPruebas(pruebas + 1);
        setPaso("probar");
        setKeys([]);
        return;
      }
      setPaso("guardando");
      await volumeSos.saveSequence({ keys: secuencia });
      setPaso("exito");
    } catch (cause) {
      setPaso("probar");
      setError(errorText(cause));
    }
  }

  if (!volumenAndroid())
    return (
      <Notice
        title="Botones físicos"
        message="La grabación de teclas de volumen está disponible en el APK Android."
        onClose={onClose}
      />
    );
  if (paso === "exito")
    return (
      <Notice
        title="Secuencia guardada"
        tone="success"
        message="Las dos pruebas fueron correctas. Vuelve al inicio y pulsa Activar segundo plano para habilitar el envío. Estas pruebas no generaron alertas."
        onClose={onClose}
      />
    );

  return (
    <Modal
      title={
        paso === "grabando"
          ? "Grabando botones físicos"
          : paso === "probando"
            ? "Prueba " + (pruebas + 1)
            : "Configurar secuencia de volumen"
      }
      onClose={onClose}
      actions={null}
    >
      <p>
        Usa únicamente las teclas físicas Volumen + y Volumen − del teléfono.
        Entre 3 y 12 pulsaciones, incluyendo ambas teclas y dejando como máximo
        2 segundos entre ellas. Mantener una tecla pulsada cuenta una sola vez.
      </p>
      {paso === "inicio" && (
        <>
          <p>
            Al comenzar se desactiva cualquier detección anterior. Tendrás 20
            segundos para grabar; después repetirás la secuencia dos veces sin
            enviar SOS.
          </p>
          <button
            type="button"
            className="wf-button"
            onClick={() => void comenzar("record")}
          >
            Comenzar grabación
          </button>
        </>
      )}
      {paso === "grabando" && (
        <>
          <p role="status">
            Secuencia:{" "}
            {keys.map(etiquetaVolumen).join(" → ") ||
              "Pulsa las teclas físicas…"}
          </p>
          <button
            type="button"
            className="wf-button"
            disabled={!secuenciaValida(keys)}
            onClick={() =>
              void terminarGrabacion().catch((cause) =>
                setError(errorText(cause)),
              )
            }
          >
            Terminar grabación
          </button>
          <button
            type="button"
            className="wf-button wf-button--secondary"
            onClick={() =>
              void detener()
                .then(() => setPaso("inicio"))
                .catch((cause) => setError(errorText(cause)))
            }
          >
            Cancelar grabación
          </button>
        </>
      )}
      {(paso === "probar" || paso === "probando") && (
        <>
          <p>
            Secuencia guardada para comprobar:{" "}
            {secuencia.map(etiquetaVolumen).join(" → ")}.
          </p>
          <p>
            Pruebas correctas: {pruebas}/{PRUEBAS_REQUERIDAS}.
          </p>
          {paso === "probar" ? (
            <button
              type="button"
              className="wf-button"
              onClick={() => void comenzar("test")}
            >
              Comenzar prueba {pruebas + 1}
            </button>
          ) : (
            <>
              <p role="status">
                Intento:{" "}
                {keys.map(etiquetaVolumen).join(" → ") ||
                  "Pulsa las teclas físicas…"}
              </p>
              <button
                type="button"
                className="wf-button"
                disabled={keys.length === 0}
                onClick={() => void comprobar()}
              >
                Comprobar prueba
              </button>
            </>
          )}
          <button
            type="button"
            className="wf-button wf-button--secondary"
            onClick={() => void comenzar("record")}
          >
            Grabar otra secuencia
          </button>
        </>
      )}
      {paso === "guardando" && <p role="status">Guardando la secuencia…</p>}
      {error && (
        <p className="wf-message wf-message--error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
};
export default ConfigurarAlerta;
