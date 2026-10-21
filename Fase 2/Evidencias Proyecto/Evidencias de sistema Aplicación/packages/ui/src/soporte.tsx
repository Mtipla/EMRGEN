import { useState, type FormEvent } from "react";
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
  { header: "Usuario", render: (t) => t.usuario_id },
  { header: "Categoría", render: (t) => t.categoria },
  { header: "Descripción", render: (t) => t.descripcion },
  { header: "Estado", render: (t) => t.estado },
  { header: "Solución", render: (t) => t.solucion ?? "—" },
];

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
  const [resultado, setResultado] = useState<{
    ok: boolean;
    texto: string;
  } | null>(null);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // El <select> muestra la primera categoría aunque el estado siga en 0.
    const categoriaId = categoria || categorias[0]?.id;
    if (!categoriaId) return;
    try {
      await onCrear(descripcion.trim(), categoriaId);
      setDescripcion("");
      setResultado({
        ok: true,
        texto: "Solicitud enviada. Su estado inicial es ABIERTO.",
      });
    } catch (causa) {
      setResultado({
        ok: false,
        texto: causa instanceof Error ? causa.message : "No se pudo enviar",
      });
    }
  }

  return (
    <>
      <form
        className="wf-card wf-form"
        onSubmit={(event) => void enviar(event)}
      >
        <h1>Solicitar soporte</h1>
        <label>
          Categoría
          <select
            value={categoria}
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
            disabled={categorias.length === 0}
          >
            Enviar solicitud
          </button>
        </div>
      </form>
      <section className="wf-card">
        <h2>Mis solicitudes</h2>
        <EstadoCarga cargando={cargando} error={error} />
        <DataTable
          columns={columnasTicket}
          rows={tickets}
          rowKey={(t) => t.ticket_id}
          empty="Aún no tienes solicitudes."
        />
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
  const [resultado, setResultado] = useState<{
    ok: boolean;
    texto: string;
  } | null>(null);

  function seleccionar(t: Ticket) {
    setSeleccionId(t.ticket_id);
    setEstado(t.estado);
    setSolucion(t.solucion ?? "");
    setResultado(null);
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!seleccion) return;
    const cambios = {
      ...(estado !== seleccion.estado && { estado }),
      ...(solucion.trim() &&
        solucion.trim() !== seleccion.solucion && {
          solucion: solucion.trim(),
        }),
    };
    if (Object.keys(cambios).length === 0)
      return setResultado({ ok: false, texto: "No hay cambios." });
    try {
      await onActualizar(seleccion.ticket_id, cambios);
      setResultado({ ok: true, texto: "Ticket actualizado." });
    } catch (causa) {
      setResultado({
        ok: false,
        texto: causa instanceof Error ? causa.message : "No se pudo actualizar",
      });
    }
  }

  return (
    <section className="wf-card">
      <h1>Tickets de soporte</h1>
      <EstadoCarga cargando={cargando} error={error} />
      <DataTable
        columns={columnasTicket}
        rows={tickets}
        rowKey={(t) => t.ticket_id}
        searchText={(t) =>
          `${t.ticket_id} ${t.usuario_id} ${t.categoria} ${t.estado} ${t.descripcion}`
        }
        selectedKey={seleccion?.ticket_id}
        onSelect={seleccionar}
        descarga="tickets-soporte"
        empty="No hay tickets."
      />
      {seleccion && (
        <form
          className="wf-card wf-form"
          onSubmit={(event) => void guardar(event)}
        >
          <h2>Ticket {seleccion.ticket_id}</h2>
          <p>{seleccion.descripcion}</p>
          <label>
            Estado
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
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
            <button type="submit" className="wf-button">
              Guardar cambios
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
