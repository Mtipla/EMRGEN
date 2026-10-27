import { Fragment, useId, useState, type FormEvent } from "react";
import { avisar, mensajeError } from "./avisos";
import { PRIORIDADES } from "./mocks";
import { DataTable, type Column } from "./wireframe";

/**
 * Soporte y alertas (internal-api /internal/v1). No aparecen en los PDF: salen del ERS
 * (RF18, HU-14, HU-18) y de readme.apis.internas.md. Solo presentan; cada app hace las llamadas.
 */

export interface Catalogo {
  id: number;
  nombre: string;
}

/** Respuesta de GET /internal/v1/tickets-soporte. */
export interface Ticket {
  ticket_id: number;
  usuario_id: number;
  nombre_usuario?: string | null;
  correo_usuario?: string | null;
  descripcion: string;
  estado: string;
  solucion: string | null;
  categoria_id: number;
  categoria: string;
}

/** Respuesta de GET /internal/v1/alertas. */
export interface Alerta {
  alerta_id: number;
  usuario_id: number | null;
  ubicacion: string | null;
  mensaje: string;
  prioridad_id: number;
  estado_alerta: string;
  fecha_creacion: string;
  fecha_cierre: string | null;
}

interface Carga {
  cargando?: boolean;
  error?: string;
}

const EstadoCarga = ({ cargando, error }: Carga) => (
  <>
    {cargando && <p className="wf-muted">Cargando…</p>}
    {error && (
      <p className="wf-message wf-message--error" role="alert">
        {error}
      </p>
    )}
  </>
);

const columnasTicket: Column<Ticket>[] = [
  { header: "Ticket", render: (t) => t.ticket_id },
  {
    header: "Usuario",
    render: (t) =>
      t.nombre_usuario
        ? `${t.nombre_usuario} (ID ${t.usuario_id})`
        : t.usuario_id,
  },
  { header: "Correo", render: (t) => t.correo_usuario ?? "—" },
  { header: "Categoría", render: (t) => t.categoria },
  { header: "Estado", render: (t) => t.estado },
];

/** Resumen de las solicitudes propias, con la respuesta desplegable bajo cada fila. */
function MisSolicitudes({ tickets }: { tickets: Ticket[] }) {
  const [abierto, setAbierto] = useState<number | null>(null);
  const prefijo = useId();
  const alternar = (id: number) =>
    setAbierto((actual) => (actual === id ? null : id));

  if (tickets.length === 0) {
    return <p className="wf-muted">Aún no tienes solicitudes.</p>;
  }

  return (
    <>
      <p className="wf-muted">Selecciona una solicitud para ver su solución.</p>
      <table
        className="wf-table wf-support-requests"
        aria-label="Mis solicitudes"
      >
        <colgroup>
          <col className="wf-support-requests-id" />
          <col className="wf-support-requests-category" />
          <col />
          <col className="wf-support-requests-status" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Ticket</th>
            <th scope="col">Categoría</th>
            <th scope="col">Descripción</th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const expandido = abierto === ticket.ticket_id;
            const idDetalle = `${prefijo}-solucion-${ticket.ticket_id}`;
            const idBoton = `${prefijo}-ticket-${ticket.ticket_id}`;
            return (
              <Fragment key={ticket.ticket_id}>
                <tr
                  className="wf-support-request"
                  data-expanded={expandido}
                  onClick={() => alternar(ticket.ticket_id)}
                >
                  <td>
                    <button
                      type="button"
                      id={idBoton}
                      className="wf-link wf-support-toggle"
                      aria-expanded={expandido}
                      aria-controls={idDetalle}
                      aria-label={`${expandido ? "Ocultar" : "Ver"} solución del ticket ${ticket.ticket_id}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        alternar(ticket.ticket_id);
                      }}
                    >
                      <span aria-hidden="true">{expandido ? "▾" : "▸"}</span>#
                      {ticket.ticket_id}
                    </button>
                  </td>
                  <td>{ticket.categoria}</td>
                  <td>
                    <span className="wf-support-summary">
                      {ticket.descripcion}
                    </span>
                  </td>
                  <td>{ticket.estado}</td>
                </tr>
                {expandido && (
                  <tr className="wf-support-detail-row">
                    <td colSpan={4}>
                      <div
                        id={idDetalle}
                        role="region"
                        aria-labelledby={idBoton}
                        className="wf-support-detail"
                      >
                        <h3>Descripción completa</h3>
                        <p>{ticket.descripcion}</p>
                        <h3>Solución</h3>
                        <p className={ticket.solucion ? undefined : "wf-muted"}>
                          {ticket.solucion ||
                            "Aún no hay una solución registrada para esta solicitud."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

interface SolicitudSoporteProps extends Carga {
  categorias: Catalogo[];
  tickets: Ticket[];
  onCrear: (descripcion: string, categoriaId: number) => Promise<unknown>;
}

/** HU-18 / RF18: el usuario abre un ticket y ve los suyos. */
export const SolicitudSoporte = ({
  categorias,
  tickets,
  cargando,
  error,
  onCrear,
}: SolicitudSoporteProps) => {
  const [categoria, setCategoria] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{
    ok: boolean;
    texto: string;
  } | null>(null);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // El <select> muestra la primera categoría aunque el estado siga en 0.
    const categoriaId = categoria || categorias[0]?.id;
    if (!categoriaId || !descripcion.trim() || enviando) return;
    setEnviando(true);
    try {
      await onCrear(descripcion.trim(), categoriaId);
      setDescripcion("");
      const texto = "Solicitud enviada. Su estado inicial es ABIERTO.";
      setResultado({ ok: true, texto });
      avisar("exito", texto);
    } catch (causa) {
      const texto = mensajeError(causa, "No se pudo enviar");
      setResultado({ ok: false, texto });
      avisar("error", texto);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <form
        className="wf-card wf-form"
        onSubmit={(event) => void enviar(event)}
      >
        <h1>Solicitar soporte</h1>
        <EstadoCarga cargando={cargando} error={error} />
        <label>
          Categoría
          <select
            value={categoria || categorias[0]?.id || ""}
            disabled={enviando || categorias.length === 0}
            onChange={(e) => setCategoria(Number(e.target.value))}
            required
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Descripción ({descripcion.length}/500)
          <textarea
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={500}
            required
          />
        </label>
        {resultado && (
          <p
            className={
              resultado.ok ? "wf-message" : "wf-message wf-message--error"
            }
            role="status"
          >
            {resultado.texto}
          </p>
        )}
        <div className="wf-actions">
          <button
            type="submit"
            className="wf-button"
            disabled={
              enviando || categorias.length === 0 || !descripcion.trim()
            }
          >
            {enviando ? "Enviando…" : "Enviar solicitud"}
          </button>
        </div>
      </form>
      <section className="wf-card">
        <h2>Mis solicitudes</h2>
        <EstadoCarga cargando={cargando} error={error} />
        <MisSolicitudes tickets={tickets} />
      </section>
    </>
  );
};

interface GestionTicketsProps extends Carga {
  tickets: Ticket[];
  estados: Catalogo[];
  /** PATCH /internal/v1/tickets-soporte/{id}; solo SOPORTE y ADMINISTRADOR (solo_staff). */
  onActualizar: (
    ticketId: number,
    cambios: { estado?: string; solucion?: string },
  ) => Promise<unknown>;
}

/** Gestión de tickets del personal (función documentada del rol SOPORTE). */
export const GestionTickets = ({
  tickets,
  estados,
  cargando,
  error,
  onActualizar,
}: GestionTicketsProps) => {
  const [seleccionId, setSeleccionId] = useState<number | null>(null);
  const seleccion = tickets.find((t) => t.ticket_id === seleccionId) ?? null;
  const [estado, setEstado] = useState("");
  const [solucion, setSolucion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState<{
    ok: boolean;
    texto: string;
  } | null>(null);

  function seleccionar(t: Ticket) {
    if (guardando) return;
    if (seleccionId === t.ticket_id) return cerrar();
    setSeleccionId(t.ticket_id);
    setEstado(t.estado);
    setSolucion(t.solucion ?? "");
    setResultado(null);
  }

  function cerrar() {
    setSeleccionId(null);
    setEstado("");
    setSolucion("");
    setResultado(null);
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!seleccion || guardando) return;
    const cambios = {
      ...(estado !== seleccion.estado && { estado }),
      ...(solucion.trim() &&
        solucion.trim() !== seleccion.solucion && {
          solucion: solucion.trim(),
        }),
    };
    if (Object.keys(cambios).length === 0)
      return setResultado({ ok: false, texto: "No hay cambios." });
    setGuardando(true);
    try {
      await onActualizar(seleccion.ticket_id, cambios);
      setResultado({ ok: true, texto: "Ticket actualizado." });
    } catch (causa) {
      setResultado({
        ok: false,
        texto: causa instanceof Error ? causa.message : "No se pudo actualizar",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="wf-card wf-support-admin">
      <h1>Administrar Tickets de soporte</h1>
      <p className="wf-muted">
        Selecciona un ticket para ver su descripción y responder.
      </p>
      <EstadoCarga cargando={cargando} error={error} />
      <DataTable
        columns={columnasTicket}
        rows={tickets}
        rowKey={(t) => t.ticket_id}
        searchText={(t) =>
          `${t.ticket_id} ${t.usuario_id} ${t.nombre_usuario ?? ""} ${t.correo_usuario ?? ""} ${t.categoria} ${t.estado} ${t.descripcion}`
        }
        selectedKey={seleccion?.ticket_id}
        onSelect={seleccionar}
        descarga="tickets-soporte"
        empty="No hay tickets."
      />
      {seleccion && (
        <form
          className="wf-card wf-form wf-support-editor"
          onSubmit={(event) => void guardar(event)}
        >
          <h2>Ticket {seleccion.ticket_id}</h2>
          <p>
            {seleccion.nombre_usuario ?? `Usuario ${seleccion.usuario_id}`} ·{" "}
            {seleccion.categoria}
          </p>
          <div>
            <h3>Descripción</h3>
            <p className="wf-support-description">{seleccion.descripcion}</p>
          </div>
          <label>
            Estado
            <select
              value={estado}
              disabled={guardando || estados.length === 0}
              onChange={(e) => setEstado(e.target.value)}
            >
              {estados.map((e) => (
                <option key={e.id}>{e.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Solución
            <textarea
              rows={3}
              value={solucion}
              onChange={(e) => setSolucion(e.target.value)}
              maxLength={500}
              disabled={guardando}
            />
          </label>
          {resultado && (
            <p
              className={
                resultado.ok ? "wf-message" : "wf-message wf-message--error"
              }
              role="status"
            >
              {resultado.texto}
            </p>
          )}
          <div className="wf-actions">
            <button
              type="button"
              className="wf-button wf-button--secondary"
              disabled={guardando}
              onClick={cerrar}
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="wf-button"
              disabled={guardando || estados.length === 0}
            >
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

const prioridad = (id: number) =>
  PRIORIDADES.find((p) => p.id === id)?.nombre ?? id;
const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("es-CL") : "—";

/** Historial de alertas para el personal (GET /internal/v1/alertas, solo lectura). */
export const AlertasTabla = ({
  alertas,
  cargando,
  error,
}: Carga & { alertas: Alerta[] }) => (
  <section className="wf-card">
    <h1>Alertas</h1>
    <EstadoCarga cargando={cargando} error={error} />
    <DataTable
      columns={[
        { header: "Alerta", render: (a) => a.alerta_id },
        { header: "Usuario", render: (a) => a.usuario_id ?? "—" },
        { header: "Prioridad", render: (a) => prioridad(a.prioridad_id) },
        { header: "Estado", render: (a) => a.estado_alerta },
        { header: "Ubicación", render: (a) => a.ubicacion ?? "—" },
        { header: "Creada", render: (a) => fecha(a.fecha_creacion) },
        { header: "Cerrada", render: (a) => fecha(a.fecha_cierre) },
      ]}
      rows={alertas}
      rowKey={(a) => a.alerta_id}
      searchText={(a) =>
        `${a.alerta_id} ${a.usuario_id ?? ""} ${a.estado_alerta} ${a.ubicacion ?? ""}`
      }
      descarga="alertas"
      empty="No hay alertas."
    />
  </section>
);
