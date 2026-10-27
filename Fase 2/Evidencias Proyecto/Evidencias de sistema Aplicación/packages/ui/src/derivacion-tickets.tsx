import { createContext, useContext, useState, type ReactNode } from "react";
import type { Ticket } from "./soporte";

export interface ModuloTicket {
  nombre: string;
  ruta: string;
}

export interface EdicionTicket {
  ticket: Ticket;
  estado: string;
  solucion: string;
}

interface RetornoTicket {
  edicion: EdicionTicket;
  consulta: { estado: string; offset: number };
}

interface RecorridoTicket {
  retorno: RetornoTicket;
  modulo: ModuloTicket;
  ruta: string;
}

const RUTA_TICKETS = "/administracion/tickets";
const PLANES = { nombre: "Gestión de planes y cupos de usuario", ruta: "/administracion/planes" };
const ALERTAS = { nombre: "Alertas SOS", ruta: "/administracion/alertas" };
const CUENTAS = { nombre: "Administrar cuentas", ruta: "/administracion/cuentas" };
const MODULOS: Record<string, ModuloTicket> = {
  "PAGOS Y PLANES": PLANES,
  ALERTAS,
  "CUENTA Y ACCESO": CUENTAS,
  APLICACION: ALERTAS,
};

export function moduloSugerido(categoria: string): ModuloTicket | null {
  const nombre = categoria.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().replace(/\s+/g, " ").toUpperCase();
  return Object.hasOwn(MODULOS, nombre) ? MODULOS[nombre]! : null;
}

const Contexto = createContext<{
  recorrido: RecorridoTicket | null;
  derivar: (retorno: RetornoTicket, modulo: ModuloTicket) => void;
  volver: () => void;
} | null>(null);

export const useDerivacionTickets = () => useContext(Contexto);

/** Solo memoria: navegar fuera del recorrido invalida el contexto, también al usar el historial. */
export function DerivacionTicketsProvider({
  rutaActual,
  esAdministrador,
  onNavegar,
  children,
}: {
  rutaActual: string;
  esAdministrador: boolean;
  onNavegar: (ruta: string) => void;
  children: ReactNode;
}) {
  const [recorrido, setRecorrido] = useState<RecorridoTicket | null>(null);
  const vigente = esAdministrador && recorrido?.ruta === rutaActual ? recorrido : null;
  // Se descarta antes de mostrar la nueva ruta; el historial no puede recuperar una selección antigua.
  if (recorrido && !vigente) setRecorrido(null);

  return (
    <Contexto.Provider value={esAdministrador ? {
      recorrido: vigente,
      derivar: (retorno, modulo) => {
        setRecorrido({ retorno, modulo, ruta: modulo.ruta });
        onNavegar(modulo.ruta);
      },
      volver: () => {
        if (!vigente) return;
        setRecorrido({ ...vigente, ruta: RUTA_TICKETS });
        onNavegar(RUTA_TICKETS);
      },
    } : null}>
      {children}
    </Contexto.Provider>
  );
}

export function ResumenTicketDerivado() {
  const contexto = useDerivacionTickets();
  const recorrido = contexto?.recorrido;
  if (!recorrido || recorrido.ruta !== recorrido.modulo.ruta) return null;
  const { ticket, solucion } = recorrido.retorno.edicion;

  return (
    <aside className="wf-card wf-ticket-context" aria-label={`Resumen del ticket ${ticket.ticket_id}`}>
      <h2>Resumen del ticket #{ticket.ticket_id}</h2>
      <p>
        <strong>Usuario:</strong> {ticket.nombre_usuario ?? `Usuario ${ticket.usuario_id}`}
        {ticket.correo_usuario && ` · ${ticket.correo_usuario}`} · ID {ticket.usuario_id}
      </p>
      <p><strong>Categoría:</strong> {ticket.categoria} · <strong>Estado:</strong> {ticket.estado}</p>
      <p className="wf-support-description">{ticket.descripcion}</p>
      {solucion && <p className="wf-support-description"><strong>Solución en edición:</strong> {solucion}</p>}
      <div className="wf-actions">
        <button type="button" className="wf-button wf-button--secondary" onClick={contexto.volver}>
          Volver a editar solución
        </button>
      </div>
    </aside>
  );
}
