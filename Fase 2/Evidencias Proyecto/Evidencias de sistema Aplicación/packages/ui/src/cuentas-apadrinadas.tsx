import { useState } from "react";
import { MOCK_CUENTAS_APADRINADAS, type CuentaApadrinada } from "./mocks";
import { ConfirmDialog, Notice, Pendiente, PinDialog } from "./wireframe";

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
