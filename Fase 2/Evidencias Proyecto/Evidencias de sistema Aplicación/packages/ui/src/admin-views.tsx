import { useState } from "react";
import { ESTADOS_PAGO, MOCK_COMPRAS, type CompraAdmin } from "./mocks";
import {
  ConfirmDialog,
  DataTable,
  Notice,
  Pendiente,
  PinDialog,
  type Column,
} from "./wireframe";

/**
 * Vistas de administración de "web y escritorio.pdf" para SOPORTE (= "Trabajador") y
 * ADMINISTRADOR: misma tabla y modales, acciones según permisos. Solo presentan: cada app
 * las alimenta con su propio cliente HTTP. Una acción sin callback queda deshabilitada.
 */

/** Fila de GET /admin/usuarios (rol_ID: 1 admin, 2 soporte, 3 usuario; estado_ID: 1 completo, 2 parcial). */
export interface UsuarioAdminFila {
  usuario_ID: number;
  nombre_usuario: string;
  numeros_vinculados?: number;
  alertas_generadas?: number;
  correo_usuario: string;
  rol_ID: number;
  estado_ID: number;
  usuario_principal_ID?: number | null;
}


/** Mockup págs. 15 y 22: aviso + PIN de trabajador antes de eliminar (solo SOPORTE). */
const PinTrabajador = ({
  nombre,
  onOk,
  onClose,
}: {
  nombre: string;
  onOk: () => void;
  onClose: () => void;
}) => (
  <PinDialog
    title={`Eliminar a "${nombre}"`}
    info={`Para eliminar a "${nombre}" deberás solicitar el PIN de trabajador del administrador antes de proceder.`}
    confirmar={false}
    onClose={onClose}
    onSubmit={onOk}
  />
);

export { AdminCuentas } from "./admin-cuentas";
export { AdminTrabajadores } from "./admin-trabajadores";

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

interface AdminComprasProps {
  titulo: string;
  puedeEditar: boolean;
  /** SOPORTE: pide el PIN de trabajador antes de eliminar. */
  pinParaEliminar?: boolean;
}

/** "Administrar Compras" (mockup págs. 19-23 y 52-55). MOCK TEMPORAL: no hay endpoint de ventas para el personal. */
export const AdminCompras = ({
  titulo,
  puedeEditar,
  pinParaEliminar = false,
}: AdminComprasProps) => {
  const [seleccion, setSeleccion] = useState<CompraAdmin | null>(null);
  const [estado, setEstado] = useState<string>(ESTADOS_PAGO[0]);
  const [modal, setModal] = useState<"eliminar" | "pin" | "pendiente" | null>(
    null,
  );
  const [accion, setAccion] = useState<"modificar" | "eliminar">("modificar");

  const columnas: Column<CompraAdmin>[] = [
    { header: "ID cuenta", render: (c) => c.cuentaId },
    { header: "Nombre usuario", render: (c) => c.nombreUsuario },
    { header: "Cuentas apadrinadas", render: (c) => c.cuentasApadrinadas },
    { header: "ID usuario apadrinado", render: (c) => c.apadrinadoId },
    {
      header: "Valor compra",
      render: (c) => clp.format(c.valor),
      value: (c) => c.valor,
    },
    { header: "Número de boleta", render: (c) => c.boleta },
    { header: "Estado", render: (c) => c.estado },
  ];

  function pendiente(siguiente: "modificar" | "eliminar") {
    setAccion(siguiente);
    setModal("pendiente");
  }

  return (
    <section className="wf-card">
      <h1>{titulo}</h1>
      <Pendiente>
        no existe un endpoint de listado de compras para el personal; datos MOCK
        TEMPORAL
      </Pendiente>
      <DataTable
        columns={columnas}
        rows={MOCK_COMPRAS}
        rowKey={(c) => c.boleta}
        searchText={(c) =>
          `${c.cuentaId} ${c.nombreUsuario} ${c.boleta} ${c.estado}`
        }
        selectedKey={seleccion?.boleta}
        onSelect={(c) => {
          setSeleccion(c);
          setEstado(c.estado);
        }}
        descarga="compras"
      />
      {seleccion && (
        <div className="wf-card wf-form">
          <h2>Boleta {seleccion.boleta}</h2>
          <p>
            {seleccion.nombreUsuario} · {clp.format(seleccion.valor)} ·{" "}
            {seleccion.estado}
          </p>
          <label>
            Estado
            <select
              value={estado}
              disabled={!puedeEditar}
              onChange={(e) => setEstado(e.target.value)}
            >
              {ESTADOS_PAGO.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
          <div className="wf-actions">
            <button
              type="button"
              className="wf-button wf-button--secondary"
              disabled={!puedeEditar}
              onClick={() => setModal("eliminar")}
            >
              Eliminar
            </button>
            <button
              type="button"
              className="wf-button"
              disabled={!puedeEditar}
              onClick={() => pendiente("modificar")}
            >
              Modificar / Guardar cambios
            </button>
          </div>
        </div>
      )}

      {modal === "eliminar" && seleccion && (
        <ConfirmDialog
          title={`Eliminar a "${seleccion.boleta}"`}
          message={`¿Está seguro que desea eliminar a "${seleccion.boleta}"?`}
          onCancel={() => setModal(null)}
          onConfirm={() =>
            pinParaEliminar ? setModal("pin") : pendiente("eliminar")
          }
        />
      )}
      {modal === "pin" && seleccion && (
        <PinTrabajador
          nombre={seleccion.boleta}
          onClose={() => setModal(null)}
          onOk={() => pendiente("eliminar")}
        />
      )}
      {modal === "pendiente" && (
        <Notice
          title="Acción no realizada"
          tone="error"
          message={`PENDIENTE IMPLEMENTACIÓN BACKEND: no existe endpoint para ${accion} compras.`}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
};
