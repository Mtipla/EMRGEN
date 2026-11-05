import { useEffect, useState, type FormEvent } from "react";
import type { UsuarioAdminFila } from "./admin-views";
import { ConfirmDialog, DataTable, type Column } from "./wireframe";

export interface ExpedienteCuenta {
  usuario: UsuarioAdminFila;
  apadrinados: Pick<
    UsuarioAdminFila,
    "usuario_ID" | "nombre_usuario" | "correo_usuario" | "estado_ID"
  >[];
  contactos: {
    contacto_emergencia_ID: number;
    nombre_contacto: string;
    num_emergencia: string;
  }[];
  alertas: {
    alerta_id: number;
    estado_alerta: string;
    prioridad: string;
    mensaje: string;
    ubicacion: string | null;
    fecha_creacion: string;
    fecha_cierre: string | null;
  }[];
}

interface Props {
  titulo: string;
  usuarios: UsuarioAdminFila[];
  soloLectura?: boolean;
  cargando?: boolean;
  error?: string;
  onConsultar: (id: number, signal: AbortSignal) => Promise<ExpedienteCuenta>;
  onGuardar?: (id: number, nombre: string, correo: string) => Promise<unknown>;
  onCambiarAcceso?: (id: number, estadoId: number) => Promise<unknown>;
  onEliminarApadrinado?: (id: number) => Promise<unknown>;
}

const tipo = (u: UsuarioAdminFila) =>
  u.usuario_principal_ID
    ? `Apadrinada (de ${u.usuario_principal_ID})`
    : u.rol_ID === 1
      ? "Administrador"
      : u.rol_ID === 2
        ? "Soporte"
        : "Cuenta principal";
const acceso = (u: UsuarioAdminFila) =>
  u.estado_ID === 1 ? "Acceso total" : "Acceso parcial";
const fecha = (f: string | null) =>
  f ? new Date(f).toLocaleString("es-CL") : "—";

export function AdminCuentas({
  titulo,
  usuarios,
  soloLectura,
  cargando,
  error,
  onConsultar,
  onGuardar,
  onCambiarAcceso,
  onEliminarApadrinado,
}: Props) {
  const [id, setId] = useState<number | null>(null);
  const seleccion = usuarios.find((u) => u.usuario_ID === id);
  const [detalle, setDetalle] = useState<ExpedienteCuenta | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [version, setVersion] = useState(0);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [eliminar, setEliminar] = useState(false);

  useEffect(() => {
    if (id === null) return;
    const peticion = new AbortController();
    onConsultar(id, peticion.signal).then(
      (valor) => {
        if (peticion.signal.aborted) return;
        setDetalle(valor);
        setCargandoDetalle(false);
      },
      (causa: Error) => {
        if (peticion.signal.aborted) return;
        setErrorDetalle(causa.message);
        setCargandoDetalle(false);
      },
    );
    return () => peticion.abort();
  }, [id, version, onConsultar]);

  function seleccionar(u: UsuarioAdminFila) {
    if (ocupado) return;
    setId(u.usuario_ID);
    setNombre(u.nombre_usuario);
    setCorreo(u.correo_usuario);
    setDetalle(null);
    setErrorDetalle("");
    setCargandoDetalle(true);
    setMensaje("");
    setVersion((v) => v + 1);
  }
  async function ejecutar(accion: () => Promise<unknown>, exito: string) {
    if (ocupado) return;
    setOcupado(true);
    setMensaje("");
    try {
      await accion();
      setMensaje(exito);
      setDetalle(null);
      setCargandoDetalle(true);
      setErrorDetalle("");
      setVersion((v) => v + 1);
    } catch (causa) {
      setMensaje(
        causa instanceof Error
          ? causa.message
          : "No se pudo completar la acción.",
      );
    } finally {
      setOcupado(false);
    }
  }
  function guardar(e: FormEvent) {
    e.preventDefault();
    if (seleccion && onGuardar)
      void ejecutar(
        () => onGuardar(seleccion.usuario_ID, nombre.trim(), correo.trim()),
        "Cambios guardados.",
      );
  }
  const columnas: Column<UsuarioAdminFila>[] = [
    { header: "ID cuenta", render: (u) => u.usuario_ID },
    { header: "Nombre usuario", render: (u) => u.nombre_usuario },
    { header: "Correo", render: (u) => u.correo_usuario },
    { header: "Tipo de cuenta", render: tipo },
    { header: "Acceso", render: acceso },
    {
      header: "Cuentas apadrinadas",
      render: (u) =>
        usuarios.filter((x) => x.usuario_principal_ID === u.usuario_ID).length,
    },
    { header: "Números vinculados", render: (u) => u.numeros_vinculados ?? 0 },
    { header: "Alertas Generadas", render: (u) => u.alertas_generadas ?? 0 },
  ];
  return (
    <section className="wf-card">
      <h1>{titulo}</h1>
      {soloLectura && (
        <p className="wf-muted">Consulta de cuentas en solo lectura.</p>
      )}
      {cargando && <p role="status">Cargando cuentas…</p>}
      {error && <p role="alert">{error}</p>}
      <DataTable
        columns={columnas}
        rows={usuarios}
        rowKey={(u) => u.usuario_ID}
        searchText={(u) =>
          `${u.usuario_ID} ${u.nombre_usuario} ${u.correo_usuario}`
        }
        selectedKey={id ?? undefined}
        onSelect={seleccionar}
        descarga={soloLectura ? undefined : "cuentas"}
      />
      {seleccion && (
        <div className="wf-card">
          <h2>Cuenta {seleccion.usuario_ID}</h2>
          <dl>
            <dt>Nombre usuario</dt>
            <dd>{seleccion.nombre_usuario}</dd>
            <dt>Correo</dt>
            <dd>{seleccion.correo_usuario}</dd>
            <dt>Tipo de cuenta</dt>
            <dd>{tipo(seleccion)}</dd>
            <dt>Acceso</dt>
            <dd>{acceso(seleccion)}</dd>
          </dl>
          {cargandoDetalle && (
            <p role="status">Cargando desglose de la cuenta…</p>
          )}
          {errorDetalle && <p role="alert">{errorDetalle}</p>}
          {detalle && (
            <>
              {detalle.apadrinados.length > 0 && (
                <section>
                  <h3>
                    Desglose de cuentas apadrinadas (
                    {detalle.apadrinados.length})
                  </h3>
                  <DataTable
                    columns={[
                      { header: "ID cuenta", render: (u) => u.usuario_ID },
                      {
                        header: "Nombre usuario",
                        render: (u) => u.nombre_usuario,
                      },
                      { header: "Correo", render: (u) => u.correo_usuario },
                      {
                        header: "Acceso",
                        render: (u) =>
                          u.estado_ID === 1 ? "Acceso total" : "Acceso parcial",
                      },
                    ]}
                    rows={detalle.apadrinados}
                    rowKey={(u) => u.usuario_ID}
                  />
                </section>
              )}
              <h3>
                Desglose de números vinculados ({detalle.contactos.length})
              </h3>
              <DataTable
                columns={[
                  { header: "Contacto", render: (c) => c.nombre_contacto },
                  { header: "Número", render: (c) => c.num_emergencia },
                ]}
                rows={detalle.contactos}
                rowKey={(c) => c.contacto_emergencia_ID}
                empty="Sin contactos de emergencia."
              />
              <h3>Desglose de Alertas Generadas ({detalle.alertas.length})</h3>
              <DataTable
                columns={[
                  { header: "Alerta", render: (a) => a.alerta_id },
                  { header: "Estado", render: (a) => a.estado_alerta },
                  { header: "Prioridad", render: (a) => a.prioridad },
                  { header: "Mensaje", render: (a) => a.mensaje },
                  { header: "Ubicación", render: (a) => a.ubicacion ?? "—" },
                  { header: "Creada", render: (a) => fecha(a.fecha_creacion) },
                  { header: "Cerrada", render: (a) => fecha(a.fecha_cierre) },
                ]}
                rows={detalle.alertas}
                rowKey={(a) => a.alerta_id}
                empty="Sin alertas generadas."
              />
            </>
          )}
          {!soloLectura && seleccion.rol_ID !== 1 && (
            <form className="wf-form" onSubmit={guardar}>
              <label>
                Nombre usuario
                <input
                  required
                  minLength={2}
                  maxLength={50}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </label>
              <label>
                Correo
                <input
                  required
                  type="email"
                  maxLength={100}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </label>
              <div className="wf-actions">
                <button
                  type="button"
                  className="wf-button wf-button--secondary"
                  disabled={ocupado || !onCambiarAcceso}
                  onClick={() =>
                    onCambiarAcceso &&
                    void ejecutar(
                      () =>
                        onCambiarAcceso(
                          seleccion.usuario_ID,
                          seleccion.estado_ID === 1 ? 2 : 1,
                        ),
                      "Acceso actualizado.",
                    )
                  }
                >
                  {seleccion.estado_ID === 1
                    ? "Pasar a Acceso Parcial"
                    : "Dar acceso total"}
                </button>
                {seleccion.usuario_principal_ID && (
                  <button
                    type="button"
                    className="wf-button wf-button--secondary"
                    disabled={ocupado || !onEliminarApadrinado}
                    onClick={() => setEliminar(true)}
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  className="wf-button"
                  disabled={ocupado || !onGuardar}
                >
                  Modificar / Guardar cambios
                </button>
              </div>
            </form>
          )}
          {mensaje && <p role="status">{mensaje}</p>}
        </div>
      )}
      {eliminar && seleccion && (
        <ConfirmDialog
          title="Eliminar cuenta apadrinada"
          message={`¿Estás seguro de eliminar a "${seleccion.nombre_usuario}"?`}
          onCancel={() => setEliminar(false)}
          onConfirm={() => {
            setEliminar(false);
            if (onEliminarApadrinado)
              void ejecutar(async () => {
                await onEliminarApadrinado(seleccion.usuario_ID);
                setId(null);
              }, "Cuenta eliminada.");
          }}
        />
      )}
    </section>
  );
}
