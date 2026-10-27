import { useState, type FormEvent } from "react";
import { ESTADOS_PAGO, MOCK_COMPRAS, type CompraAdmin } from "./mocks";
import {
  ConfirmDialog,
  DataTable,
  Modal,
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
  correo_usuario: string;
  rol_ID: number;
  estado_ID: number;
  usuario_principal_ID?: number | null;
}

const ROLES: Record<number, string> = {
  1: "Administrador",
  2: "Soporte (Trabajador)",
  3: "Cuenta principal",
};
const ACCESO_COMPLETO = 1;
const ACCESO_PARCIAL = 2;

const tipoCuenta = (u: UsuarioAdminFila) =>
  u.usuario_principal_ID
    ? `Apadrinada (de ${u.usuario_principal_ID})`
    : (ROLES[u.rol_ID] ?? `Rol ${u.rol_ID}`);

const acceso = (u: UsuarioAdminFila) =>
  u.estado_ID === ACCESO_COMPLETO ? "Acceso total" : "No acceso total";

type Resultado = { ok: boolean; texto: string } | null;

/** Ejecuta una acción remota y devuelve el mensaje a mostrar. */
async function ejecutar(
  accion: () => Promise<unknown>,
  exito: string,
): Promise<Resultado> {
  try {
    await accion();
    return { ok: true, texto: exito };
  } catch (causa) {
    return {
      ok: false,
      texto: causa instanceof Error ? causa.message : "La acción falló",
    };
  }
}

const Mensaje = ({ resultado }: { resultado: Resultado }) =>
  resultado && (
    <p
      className={resultado.ok ? "wf-message" : "wf-message wf-message--error"}
      role="status"
    >
      {resultado.texto}
    </p>
  );

interface EstadoCarga {
  cargando?: boolean;
  error?: string;
}

const Carga = ({ cargando, error }: EstadoCarga) => (
  <>
    {cargando && <p className="wf-muted">Cargando…</p>}
    {error && (
      <p className="wf-message wf-message--error" role="alert">
        {error}
      </p>
    )}
  </>
);

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

interface AdminCuentasProps extends EstadoCarga {
  titulo: string;
  usuarios: UsuarioAdminFila[];
  soloLectura?: boolean;
  /** Aviso informativo del perfil. */
  aviso?: string;
  /** SOPORTE: pide el PIN de trabajador antes de eliminar. */
  pinParaEliminar?: boolean;
  onGuardar?: (id: number, nombre: string, correo: string) => Promise<unknown>;
  onCambiarAcceso?: (id: number, estadoId: number) => Promise<unknown>;
  onEliminarApadrinado?: (id: number) => Promise<unknown>;
}

type ModalCuentas =
  | "anadir"
  | "anadir-pendiente"
  | "modificada"
  | "confirmar"
  | "pin"
  | "pin-pendiente"
  | "eliminada"
  | null;

/** Sin endpoint que valide el PIN, la eliminación con PIN se detiene aquí en vez de omitirlo. */
const PinSinBackend = ({ onClose }: { onClose: () => void }) => (
  <Notice
    title="Eliminación no realizada"
    tone="error"
    message="PENDIENTE IMPLEMENTACIÓN BACKEND: no existe un endpoint para validar el PIN de trabajador, por lo que no se eliminó nada."
    onClose={onClose}
  />
);

/** "Administrar Cuentas" (mockup págs. 13-18 Trabajador y 56-60 Administrador). */
export const AdminCuentas = ({
  titulo,
  usuarios,
  soloLectura = false,
  aviso,
  pinParaEliminar = false,
  cargando,
  error,
  onGuardar,
  onCambiarAcceso,
  onEliminarApadrinado,
}: AdminCuentasProps) => {
  // Se guarda el ID: la fila sale siempre de `usuarios`, que el padre recarga tras cada acción.
  const [seleccionId, setSeleccionId] = useState<number | null>(null);
  const seleccion = usuarios.find((u) => u.usuario_ID === seleccionId) ?? null;
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [resultado, setResultado] = useState<Resultado>(null);
  const [modal, setModal] = useState<ModalCuentas>(null);
  // El nombre se fija al abrir el aviso: tras eliminar, la fila ya no está en `usuarios`.
  const [afectado, setAfectado] = useState("");

  const columnas: Column<UsuarioAdminFila>[] = [
    { header: "ID cuenta", render: (u) => u.usuario_ID },
    { header: "Nombre usuario", render: (u) => u.nombre_usuario },
    { header: "Correo", render: (u) => u.correo_usuario },
    {
      header: "Cuentas apadrinadas",
      render: (u) =>
        u.usuario_principal_ID
          ? "—"
          : usuarios.filter((x) => x.usuario_principal_ID === u.usuario_ID)
              .length,
    },
    { header: "Tipo de cuenta", render: tipoCuenta },
    { header: "Acceso", render: acceso },
    ...(!soloLectura
      ? [
          { header: "Números vinculados", render: () => "—" },
          { header: "Incidente", render: () => "—" },
        ]
      : []),
  ];

  function seleccionar(u: UsuarioAdminFila) {
    setSeleccionId(u.usuario_ID);
    setNombre(u.nombre_usuario);
    setCorreo(u.correo_usuario);
    setResultado(null);
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!seleccion || !onGuardar) return;
    const r = await ejecutar(
      () => onGuardar(seleccion.usuario_ID, nombre.trim(), correo.trim()),
      "Cambios guardados.",
    );
    setResultado(r?.ok ? null : r);
    if (r?.ok) {
      setAfectado(nombre.trim());
      setModal("modificada");
    }
  }

  async function eliminar() {
    if (!seleccion || !onEliminarApadrinado) return;
    const r = await ejecutar(
      () => onEliminarApadrinado(seleccion.usuario_ID),
      "Cuenta eliminada.",
    );
    setResultado(r?.ok ? null : r);
    setModal(r?.ok ? "eliminada" : null);
  }

  const esApadrinada = Boolean(seleccion?.usuario_principal_ID);

  return (
    <section className="wf-card">
      <h1>{titulo}</h1>
      {soloLectura && (
        <p className="wf-muted">Consulta de cuentas en solo lectura.</p>
      )}
      {aviso && <p className="wf-pending">{aviso}</p>}
      {!soloLectura && (
        <Pendiente>
          "Números vinculados" e "Incidente" aún no se exponen en el listado
        </Pendiente>
      )}
      <Carga cargando={cargando} error={error} />
      <DataTable
        columns={columnas}
        rows={usuarios}
        descarga={soloLectura ? undefined : "cuentas"}
        rowKey={(u) => u.usuario_ID}
        searchText={(u) =>
          `${u.usuario_ID} ${u.nombre_usuario} ${u.correo_usuario}`
        }
        selectedKey={seleccion?.usuario_ID}
        onSelect={seleccionar}
      />
      {!soloLectura && (
        <div className="wf-actions">
          <button
            type="button"
            className="wf-button wf-button--secondary"
            onClick={() => setModal("anadir")}
          >
            Añadir
          </button>
        </div>
      )}

      {seleccion && soloLectura && (
        <div className="wf-card">
          <h2>Cuenta {seleccion.usuario_ID}</h2>
          <dl>
            <dt>Nombre usuario</dt>
            <dd>{seleccion.nombre_usuario}</dd>
            <dt>Correo</dt>
            <dd>{seleccion.correo_usuario}</dd>
            <dt>Tipo de cuenta</dt>
            <dd>{tipoCuenta(seleccion)}</dd>
            <dt>Acceso</dt>
            <dd>{acceso(seleccion)}</dd>
          </dl>
        </div>
      )}
      {seleccion && !soloLectura && (
        <form
          className="wf-card wf-form"
          onSubmit={(event) => void guardar(event)}
        >
          <h2>Cuenta {seleccion.usuario_ID}</h2>
          <label>
            Nombre usuario
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              minLength={2}
              maxLength={50}
              required
            />
          </label>
          <label>
            Correo
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              maxLength={100}
              required
            />
          </label>
          <Mensaje resultado={resultado} />
          <div className="wf-actions">
            <button
              type="button"
              className="wf-button wf-button--secondary"
              disabled={!onCambiarAcceso}
              onClick={() =>
                onCambiarAcceso &&
                void ejecutar(
                  () =>
                    onCambiarAcceso(
                      seleccion.usuario_ID,
                      seleccion.estado_ID === ACCESO_COMPLETO
                        ? ACCESO_PARCIAL
                        : ACCESO_COMPLETO,
                    ),
                  "Acceso actualizado.",
                ).then(setResultado)
              }
            >
              {seleccion.estado_ID === ACCESO_COMPLETO
                ? "Pasar a Acceso Parcial "
                : "Dar acceso total"}
            </button>
            {esApadrinada && (
              <button
                type="button"
                className="wf-button wf-button--secondary"
                disabled={!onEliminarApadrinado}
                onClick={() => {
                  setAfectado(seleccion.nombre_usuario);
                  setModal("confirmar");
                }}
              >
                Eliminar
              </button>
            )}
            <button type="submit" className="wf-button" disabled={!onGuardar}>
              Modificar / Guardar cambios
            </button>
          </div>
        </form>
      )}

      {modal === "anadir" && (
        <AnadirCuenta
          onClose={() => setModal(null)}
          onSiguiente={() => setModal("anadir-pendiente")}
        />
      )}
      {modal === "anadir-pendiente" && (
        <Notice
          title="Cuenta no creada"
          tone="error"
          message="PENDIENTE IMPLEMENTACIÓN BACKEND: no existe un endpoint para que el personal cree cuentas de usuario (el alta actual exige registro con verificación de correo)."
          onClose={() => setModal(null)}
        />
      )}
      {modal === "modificada" && (
        <Notice
          title={`Modificar a "${afectado}"`}
          tone="success"
          message={`Acaba de modificar a "${afectado}".`}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "confirmar" && (
        <ConfirmDialog
          title={`Eliminar a "${afectado}"`}
          message={`¿Está seguro que desea eliminar a "${afectado}"?`}
          onCancel={() => setModal(null)}
          onConfirm={() =>
            pinParaEliminar ? setModal("pin") : void eliminar()
          }
        />
      )}
      {modal === "pin" && (
        <PinTrabajador
          nombre={afectado}
          onClose={() => setModal(null)}
          onOk={() => setModal("pin-pendiente")}
        />
      )}
      {modal === "pin-pendiente" && (
        <PinSinBackend onClose={() => setModal(null)} />
      )}
      {modal === "eliminada" && (
        <Notice
          title="Cuenta eliminada"
          tone="success"
          message={`"${afectado}" fue eliminada.`}
          onClose={() => {
            setModal(null);
            setSeleccionId(null);
          }}
        />
      )}
    </section>
  );
};

/** Formulario "Añadir" del mockup pág. 17 (correo, contraseña, nombre, teléfono, nombre de usuario). */
const AnadirCuenta = ({
  onClose,
  onSiguiente,
}: {
  onClose: () => void;
  onSiguiente: () => void;
}) => (
  <Modal title="Añadir cuenta" onClose={onClose} actions={null}>
    <form
      className="wf-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSiguiente();
      }}
    >
      <label>
        Correo electrónico
        <input type="email" maxLength={100} required />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label>
        Nombre
        <input />
      </label>
      <label>
        Número telefónico
        <input type="tel" placeholder="+569…" />
      </label>
      <label>
        Nombre usuario
        <input minLength={2} maxLength={50} required />
      </label>
      <div className="wf-actions">
        <button
          type="button"
          className="wf-button wf-button--secondary"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button type="submit" className="wf-button">
          Siguiente
        </button>
      </div>
    </form>
  </Modal>
);

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

interface AdminTrabajadoresProps extends EstadoCarga {
  /** Filas de GET /admin/usuarios con rol_ID = 2 (SOPORTE). */
  trabajadores: UsuarioAdminFila[];
  onCrear?: (
    nombre: string,
    correo: string,
    password: string,
  ) => Promise<unknown>;
  onCambiarAcceso?: (id: number, estadoId: number) => Promise<unknown>;
  onEliminar?: (id: number) => Promise<unknown>;
}

/** "Administrar Trabajadores" (solo administrador). Nunca muestra contraseñas. */
export const AdminTrabajadores = ({
  trabajadores,
  cargando,
  error,
  onCrear,
  onCambiarAcceso,
  onEliminar,
}: AdminTrabajadoresProps) => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [resultado, setResultado] = useState<Resultado>(null);
  const [aEliminar, setAEliminar] = useState<UsuarioAdminFila | null>(null);

  const columnas: Column<UsuarioAdminFila>[] = [
    { header: "ID trabajador", render: (t) => t.usuario_ID },
    { header: "Nombre trabajador", render: (t) => t.nombre_usuario },
    { header: "Correo trabajador", render: (t) => t.correo_usuario },
    {
      header: "Estado",
      render: (t) => (
        <button
          type="button"
          className="wf-link"
          disabled={!onCambiarAcceso}
          onClick={(event) => {
            event.stopPropagation();
            void ejecutar(
              () =>
                onCambiarAcceso!(
                  t.usuario_ID,
                  t.estado_ID === ACCESO_COMPLETO
                    ? ACCESO_PARCIAL
                    : ACCESO_COMPLETO,
                ),
              "Estado actualizado.",
            ).then(setResultado);
          }}
        >
          {t.estado_ID === ACCESO_COMPLETO ? "Habilitado" : "Deshabilitado"}
        </button>
      ),
      value: (t) =>
        t.estado_ID === ACCESO_COMPLETO ? "Habilitado" : "Deshabilitado",
    },
    {
      header: "Eliminar",
      render: (t) => (
        <button
          type="button"
          className="wf-button wf-button--secondary"
          disabled={!onEliminar}
          onClick={(event) => {
            event.stopPropagation();
            setAEliminar(t);
          }}
        >
          Eliminar
        </button>
      ),
      value: () => "",
    },
  ];

  async function crear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onCrear) return;
    const r = await ejecutar(
      () => onCrear(nombre.trim(), correo.trim(), password),
      "Trabajador creado.",
    );
    setResultado(r);
    if (r?.ok) {
      setNombre("");
      setCorreo("");
      setPassword("");
    }
  }

  return (
    <section className="wf-card">
      <h1>Administrar trabajadores</h1>
      <Carga cargando={cargando} error={error} />
      <Mensaje resultado={resultado} />
      <DataTable
        columns={columnas}
        rows={trabajadores}
        descarga="trabajadores"
        rowKey={(t) => t.usuario_ID}
        searchText={(t) =>
          `${t.usuario_ID} ${t.nombre_usuario} ${t.correo_usuario}`
        }
        empty="No hay trabajadores registrados."
      />
      {aEliminar && onEliminar && (
        <ConfirmDialog
          title={`Eliminar a "${aEliminar.nombre_usuario}"`}
          message={`¿Está seguro que desea eliminar a "${aEliminar.nombre_usuario}"?`}
          onCancel={() => setAEliminar(null)}
          onConfirm={() => {
            const { usuario_ID } = aEliminar;
            setAEliminar(null);
            void ejecutar(() => onEliminar(usuario_ID), "Trabajador eliminado.").then(setResultado);
          }}
        />
      )}

      <form className="wf-card wf-form" onSubmit={(event) => void crear(event)}>
        <h2>Añadir trabajador</h2>
        <label>
          Nombre trabajador
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            minLength={2}
            maxLength={50}
            required
          />
        </label>
        <label>
          Correo trabajador
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            maxLength={100}
            required
          />
        </label>
        <label>
          Contraseña inicial
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <div className="wf-actions">
          <button type="submit" className="wf-button" disabled={!onCrear}>
            Añadir trabajador
          </button>
        </div>
      </form>
    </section>
  );
};
