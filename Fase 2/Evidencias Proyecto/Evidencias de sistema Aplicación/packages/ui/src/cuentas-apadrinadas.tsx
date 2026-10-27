import { useEffect, useState, type FormEvent } from "react";
import { avisar, mensajeError } from "./avisos";
import { MOCK_CUENTAS_APADRINADAS, type CuentaApadrinada } from "./mocks";
import { ACCESO } from "./permisos";
import { ConfirmDialog, Modal, Notice, Pendiente, PinDialog } from "./wireframe";

const MAX_APADRINADOS = 5;

interface CuentasApadrinadasProps {
  /** Cupos comprados (GET /compras/apadrinados → cuposAdquiridos); null si no se pudo leer. */
  cupos: number | null;
  /** Motivo por el que no se leyeron los cupos (p. ej. cuenta sin plan Premium). */
  aviso?: string;
  /** "Añadir Cuenta +": abre la compra de cupos existente. */
  onAnadir: () => void;
}

type Modal =
  | { tipo: "pin"; cuenta: CuentaApadrinada }
  | { tipo: "eliminar"; cuenta: CuentaApadrinada }
  | { tipo: "eliminada"; cuenta: CuentaApadrinada }
  | { tipo: "guardar" };

/** Arma un casillero por cupo; el contenido de cada casillero es MOCK TEMPORAL. */
function casilleros(cupos: number | null): CuentaApadrinada[] {
  const total = cupos ?? MOCK_CUENTAS_APADRINADAS.length;
  return Array.from(
    { length: total },
    (_, i) =>
      MOCK_CUENTAS_APADRINADAS[i] ?? {
        numero: i + 1,
        pinPrimerIngreso: null,
        usadaPor: null,
        accesoCompleto: false,
      },
  );
}

/** Pantalla "Administrar Cuentas" del usuario principal (web y móvil). */
export const CuentasApadrinadas = ({
  cupos,
  aviso,
  onAnadir,
}: CuentasApadrinadasProps) => {
  const [cuentas, setCuentas] = useState(() => casilleros(cupos));
  const [modal, setModal] = useState<Modal | null>(null);
  const cerrar = () => setModal(null);

  function actualizar(numero: number, cambios: Partial<CuentaApadrinada>) {
    setCuentas((actuales) =>
      actuales.map((c) => (c.numero === numero ? { ...c, ...cambios } : c)),
    );
  }

  return (
    <section className="wf-card">
      <h1>Administrar cuentas</h1>
      {aviso && <p className="wf-message wf-message--error">{aviso}</p>}
      <Pendiente>
        el backend aún no expone las cuentas apadrinadas ni su PIN; se muestran
        datos de ejemplo
        {cupos !== null && ` sobre tus ${cupos} cupos reales`}
      </Pendiente>

      <div className="wf-grid">
        {cuentas.map((cuenta) => (
          <article className="wf-card" key={cuenta.numero}>
            <h3>Cuenta {cuenta.numero}</h3>
            <p>
              PIN primer ingreso:{" "}
              {cuenta.pinPrimerIngreso ?? (
                <button
                  type="button"
                  className="wf-link"
                  onClick={() => setModal({ tipo: "pin", cuenta })}
                >
                  "Crear PIN"
                </button>
              )}
            </p>
            <p>Cuenta usada por: "{cuenta.usadaPor ?? ""}"</p>
            <label className="wf-row">
              <input
                type="checkbox"
                checked={cuenta.accesoCompleto}
                onChange={(e) =>
                  actualizar(cuenta.numero, {
                    accesoCompleto: e.target.checked,
                  })
                }
              />
              Acceso completo
            </label>
            {cuenta.usadaPor && (
              <div className="wf-actions">
                <button
                  type="button"
                  className="wf-button wf-button--secondary"
                  onClick={() => setModal({ tipo: "eliminar", cuenta })}
                >
                  Eliminar
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="wf-actions">
        {cuentas.length < MAX_APADRINADOS && (
          <button
            type="button"
            className="wf-button wf-button--secondary"
            onClick={onAnadir}
          >
            Añadir cuenta +
          </button>
        )}
        <button
          type="button"
          className="wf-button"
          onClick={() => setModal({ tipo: "guardar" })}
        >
          Guardar cambios
        </button>
      </div>

      {modal?.tipo === "pin" && (
        <PinDialog
          title={`Crear PIN de "Cuenta ${modal.cuenta.numero}"`}
          info={`Debes crear el PIN de 4 dígitos de "Cuenta ${modal.cuenta.numero}". ${
            modal.cuenta.accesoCompleto
              ? "Esta cuenta podrá modificar su PIN luego de ingresar."
              : "Esta cuenta NO podrá modificar su PIN."
          }`}
          onClose={cerrar}
          onSubmit={(pin) => {
            actualizar(modal.cuenta.numero, { pinPrimerIngreso: pin });
            cerrar();
          }}
        />
      )}
      {modal?.tipo === "eliminar" && (
        <ConfirmDialog
          title={`Eliminar a "${modal.cuenta.usadaPor}"`}
          message={`¿Está seguro que desea borrar a "${modal.cuenta.usadaPor}" de su lista?`}
          onCancel={cerrar}
          onConfirm={() =>
            setModal({ tipo: "eliminada", cuenta: modal.cuenta })
          }
        />
      )}
      {modal?.tipo === "eliminada" && (
        <Notice
          title={`Eliminar a "${modal.cuenta.usadaPor}"`}
          message={`Se le enviará un mensaje al número de "${modal.cuenta.usadaPor}" informando la decisión.`}
          onClose={() => {
            actualizar(modal.cuenta.numero, {
              usadaPor: null,
              pinPrimerIngreso: null,
            });
            cerrar();
          }}
        />
      )}
      {modal?.tipo === "guardar" && (
        <Notice
          title="Cambios no guardados"
          message="El backend aún no tiene endpoints para guardar cuentas apadrinadas, PIN ni acceso."
          onClose={cerrar}
        />
      )}
    </section>
  );
};

/** Fila de GET /usuarios/me/vinculadas. Correo, acceso y PIN solo llegan al principal. */
export interface CuentaVinculada {
  usuario_ID: number;
  nombre_usuario: string;
  tipo: "PRINCIPAL" | "APADRINADO";
  correo_usuario?: string;
  estado_ID?: number;
  tiene_pin?: boolean;
}

export interface NuevaCuenta {
  nombre_usuario: string;
  correo_usuario: string;
  password: string;
  acceso_completo: boolean;
  PIN?: string;
}

type Fetcher = <T>(path: string, init?: RequestInit) => Promise<T>;

/** Endpoints de /usuarios/me/apadrinados con el fetch autenticado de cada app. */
export function apadrinadosApi(fetcher: Fetcher) {
  const enviar = (method: string, path: string, body?: unknown) =>
    fetcher<CuentaVinculada[]>(path, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  return {
    listar: () => fetcher<CuentaVinculada[]>("/usuarios/me/vinculadas"),
    crear: (datos: NuevaCuenta) =>
      enviar("POST", "/usuarios/me/apadrinados", datos),
    // HU-10: PIN_principal autoriza cada acción crítica; el backend lo verifica y bloquea.
    definirPin: (id: number, PIN: string, PIN_principal: string) =>
      enviar("PUT", `/usuarios/me/apadrinados/${id}/pin`, { PIN, PIN_principal }),
    cambiarAcceso: (id: number, estado_ID: number, PIN_principal: string) =>
      enviar("PUT", `/usuarios/me/apadrinados/${id}/estado`, { estado_ID, PIN_principal }),
    eliminar: (id: number, PIN_principal: string) =>
      enviar("DELETE", `/usuarios/me/apadrinados/${id}`, { PIN_principal }),
  };
}

export type ApadrinadosApi = ReturnType<typeof apadrinadosApi>;

type ModalReal =
  | { tipo: "crear"; numero: number }
  | { tipo: "pin"; cuenta: CuentaVinculada }
  | { tipo: "eliminar"; cuenta: CuentaVinculada }
  | {
      tipo: "autorizar";
      titulo: string;
      accion: (pinPrincipal: string) => Promise<CuentaVinculada[]>;
      exito: string;
    };

interface GestionApadrinadosProps {
  /** Cupos comprados (GET /compras/apadrinados); null si no se pudieron leer. */
  cupos: number | null;
  /** Motivo por el que no se leyeron los cupos (p. ej. cuenta sin plan Premium). */
  aviso?: string;
  api: ApadrinadosApi;
  /** "Añadir cuenta +": abre la compra de cupos existente. */
  onAnadir: () => void;
}

/** "Administrar Cuentas" con datos reales (mockup web págs. 65-74): un casillero por cupo comprado. */
export const GestionApadrinados = ({
  cupos,
  aviso,
  api,
  onAnadir,
}: GestionApadrinadosProps) => {
  const [cuentas, setCuentas] = useState<CuentaVinculada[]>([]);
  const [carga, setCarga] = useState({ cargando: true, error: "" });
  const [modal, setModal] = useState<ModalReal | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const cerrar = () => setModal(null);

  useEffect(() => {
    let activo = true;
    api.listar().then(
      (filas) => {
        if (!activo) return;
        setCuentas(filas);
        setCarga({ cargando: false, error: "" });
      },
      (causa: unknown) => {
        if (activo) setCarga({ cargando: false, error: mensajeError(causa) });
      },
    );
    return () => {
      activo = false;
    };
  }, [api]);

  /** Ejecuta una acción del backend y avisa en verde o rojo según el resultado. */
  async function ejecutar(
    accion: () => Promise<CuentaVinculada[]>,
    exito: string,
  ) {
    setOcupado(true);
    try {
      setCuentas(await accion());
      avisar("exito", exito);
      return true;
    } catch (causa) {
      avisar("error", mensajeError(causa));
      return false;
    } finally {
      setOcupado(false);
    }
  }

  function cambiarAcceso(cuenta: CuentaVinculada, completo: boolean) {
    if (completo && !cuenta.tiene_pin) {
      avisar(
        "error",
        `Crea el PIN de "${cuenta.nombre_usuario}" antes de darle acceso completo.`,
      );
      return;
    }
    setModal({
      tipo: "autorizar",
      titulo: `Ingresa tu PIN para dar acceso ${completo ? "completo" : "parcial"} a "${cuenta.nombre_usuario}"`,
      accion: (pin) =>
        api.cambiarAcceso(
          cuenta.usuario_ID,
          completo ? ACCESO.COMPLETO : ACCESO.PARCIAL,
          pin,
        ),
      exito: `"${cuenta.nombre_usuario}" ahora tiene acceso ${completo ? "completo" : "parcial"}.`,
    });
  }

  const total = Math.max(cupos ?? 0, cuentas.length);
  const libres = total - cuentas.length;

  return (
    <section className="wf-card">
      <h1>Administrar cuentas</h1>
      {aviso && <p className="wf-message wf-message--error">{aviso}</p>}
      {carga.error && (
        <p className="wf-message wf-message--error">
          No se pudieron cargar tus cuentas: {carga.error}
        </p>
      )}
      <p className="wf-muted">
        {cupos === null
          ? `Tienes ${cuentas.length} cuentas apadrinadas.`
          : `Usas ${cuentas.length} de ${cupos} cupos comprados (máximo ${MAX_APADRINADOS}).`}
      </p>
      {carga.cargando && <p className="wf-muted">Cargando cuentas…</p>}

      <div className="wf-grid">
        {cuentas.map((cuenta, i) => (
          <article className="wf-card" key={cuenta.usuario_ID}>
            <h3>Cuenta {i + 1}</h3>
            <p>
              Cuenta usada por: <strong>{cuenta.nombre_usuario}</strong>
              <br />
              <span className="wf-muted">{cuenta.correo_usuario}</span>
            </p>
            <p>
              PIN de ingreso:{" "}
              {cuenta.tiene_pin ? (
                <span className="wf-ayuda wf-ayuda--ok">✓ definido</span>
              ) : (
                <span className="wf-ayuda wf-ayuda--error">✕ sin PIN</span>
              )}{" "}
              <button
                type="button"
                className="wf-link"
                disabled={ocupado}
                onClick={() => setModal({ tipo: "pin", cuenta })}
              >
                {cuenta.tiene_pin ? "Regenerar PIN" : "Generar PIN"}
              </button>
            </p>
            <label className="wf-row">
              <input
                type="checkbox"
                checked={cuenta.estado_ID === ACCESO.COMPLETO}
                disabled={ocupado}
                onChange={(e) => cambiarAcceso(cuenta, e.target.checked)}
              />
              Acceso completo
            </label>
            <div className="wf-actions">
              <button
                type="button"
                className="wf-button wf-button--secondary"
                disabled={ocupado}
                onClick={() => setModal({ tipo: "eliminar", cuenta })}
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
        {Array.from({ length: Math.max(libres, 0) }, (_, i) => (
          <article className="wf-card wf-contacto--vacio" key={`libre-${i}`}>
            <h3>Cuenta {cuentas.length + i + 1}</h3>
            <p>Cupo libre: aún no lo usa nadie.</p>
            <div className="wf-actions">
              <button
                type="button"
                className="wf-button"
                disabled={ocupado || carga.cargando}
                onClick={() =>
                  setModal({ tipo: "crear", numero: cuentas.length + i + 1 })
                }
              >
                Crear cuenta
              </button>
            </div>
          </article>
        ))}
      </div>

      {total < MAX_APADRINADOS && (
        <div className="wf-actions">
          <button
            type="button"
            className="wf-button wf-button--secondary"
            onClick={onAnadir}
          >
            Añadir cuenta +
          </button>
        </div>
      )}

      {modal?.tipo === "crear" && (
        <NuevaCuentaDialog
          numero={modal.numero}
          onClose={cerrar}
          onCrear={async (datos) => {
            const creada = await ejecutar(
              () => api.crear(datos),
              `Cuenta de "${datos.nombre_usuario}" creada.`,
            );
            if (creada) cerrar();
          }}
        />
      )}
      {modal?.tipo === "pin" && (
        <PinDialog
          title={`PIN de "${modal.cuenta.nombre_usuario}"`}
          info={
            modal.cuenta.estado_ID === ACCESO.COMPLETO
              ? `PIN de primer acceso para "${modal.cuenta.nombre_usuario}". Al entrar a su perfil deberá reemplazarlo por uno propio.`
              : `PIN del perfil de "${modal.cuenta.nombre_usuario}". Con acceso parcial no podrá cambiarlo.`
          }
          onClose={cerrar}
          onSubmit={(pin) => {
            const cuenta = modal.cuenta;
            setModal({
              tipo: "autorizar",
              titulo: `Ingresa tu PIN para guardar el PIN de "${cuenta.nombre_usuario}"`,
              accion: (pinPrincipal) => api.definirPin(cuenta.usuario_ID, pin, pinPrincipal),
              exito: `PIN de "${cuenta.nombre_usuario}" guardado.`,
            });
          }}
        />
      )}
      {modal?.tipo === "autorizar" && (
        <PinDialog
          title={modal.titulo}
          confirmar={false}
          onClose={cerrar}
          onSubmit={async (pin) => {
            // PinDialog muestra dentro el PIN incorrecto o el bloqueo de CA-10.1.
            setCuentas(await modal.accion(pin));
            avisar("exito", modal.exito);
            cerrar();
          }}
        />
      )}
      {modal?.tipo === "eliminar" && (
        <ConfirmDialog
          title={`Eliminar a "${modal.cuenta.nombre_usuario}"`}
          message={`¿Está seguro que desea borrar a "${modal.cuenta.nombre_usuario}" de su lista? Su cupo quedará libre.`}
          onCancel={cerrar}
          onConfirm={() => {
            const cuenta = modal.cuenta;
            setModal({
              tipo: "autorizar",
              titulo: `Ingresa tu PIN para eliminar a "${cuenta.nombre_usuario}"`,
              accion: (pin) => api.eliminar(cuenta.usuario_ID, pin),
              exito: `"${cuenta.nombre_usuario}" fue eliminada de tus cuentas.`,
            });
          }}
        />
      )}
    </section>
  );
};

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Alta de un apadrinado con validación en vivo (verde = correcto, rojo = revisar). */
const NuevaCuentaDialog = ({
  numero,
  onClose,
  onCrear,
}: {
  numero: number;
  onClose: () => void;
  onCrear: (datos: NuevaCuenta) => Promise<void>;
}) => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [completo, setCompleto] = useState(false);
  const [pin, setPin] = useState("");
  const [enviando, setEnviando] = useState(false);

  // null = campo vacío (sin color); true/false = válido/inválido.
  const estados = {
    nombre: nombre ? nombre.trim().length >= 2 : null,
    correo: correo ? CORREO.test(correo.trim()) : null,
    password: password ? password.length >= 8 : null,
    pin: pin ? /^\d{4}$/.test(pin) : null,
  };
  const clase = (ok: boolean | null) =>
    ok === null ? undefined : ok ? "wf-valido" : "wf-invalido";
  const ayuda = (ok: boolean | null, bien: string, mal: string) =>
    ok !== null && (
      <span className={`wf-ayuda ${ok ? "wf-ayuda--ok" : "wf-ayuda--error"}`}>
        {ok ? `✓ ${bien}` : `✕ ${mal}`}
      </span>
    );

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Object.values(estados).every(Boolean)) {
      avisar("error", "Revisa los campos marcados en rojo.");
      return;
    }
    setEnviando(true);
    await onCrear({
      nombre_usuario: nombre.trim(),
      correo_usuario: correo.trim(),
      password,
      acceso_completo: completo,
      PIN: pin,
    });
    setEnviando(false);
  }

  return (
    <Modal title={`Crear "Cuenta ${numero}"`} onClose={onClose} actions={null}>
      <form className="wf-form" onSubmit={(event) => void enviar(event)}>
        <label>
          Nombre de usuario
          <input
            className={clase(estados.nombre)}
            value={nombre}
            maxLength={50}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          {ayuda(estados.nombre, "Nombre válido", "Mínimo 2 caracteres")}
        </label>
        <label>
          Correo de la cuenta
          <input
            type="email"
            className={clase(estados.correo)}
            value={correo}
            maxLength={100}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          {ayuda(estados.correo, "Correo válido", "Correo no válido")}
        </label>
        <label>
          Contraseña
          <input
            type="password"
            autoComplete="new-password"
            className={clase(estados.password)}
            value={password}
            maxLength={72}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {ayuda(estados.password, "Largo suficiente", "Mínimo 8 caracteres")}
        </label>
        <label className="wf-row">
          <input
            type="checkbox"
            checked={completo}
            onChange={(e) => setCompleto(e.target.checked)}
          />
          Acceso completo
        </label>
        <p className="wf-muted">
          {completo
            ? "Con acceso completo la cuenta edita su perfil; el PIN que defines es de primer acceso y deberá cambiarlo al entrar."
            : "Con acceso parcial la cuenta no edita su perfil ni puede cambiar el PIN que defines; usa tu PIN para cerrar alertas."}
        </p>
        <label>
          {completo ? "PIN de primer acceso" : "PIN del perfil"}
          <input
            type="password"
            inputMode="numeric"
            className={clase(estados.pin)}
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
          />
          {ayuda(estados.pin, "PIN válido", "Deben ser 4 dígitos")}
        </label>
        <div className="wf-actions">
          <button
            type="button"
            className="wf-button wf-button--secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button type="submit" className="wf-button" disabled={enviando}>
            {enviando ? "Creando…" : "Crear cuenta"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
