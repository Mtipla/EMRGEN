import { useEffect, useState } from "react";
import { GestionTickets, type CambiosTicket, type Catalogo, type Ticket } from "./soporte";
import { useDerivacionTickets } from "./derivacion-tickets";

interface AdminTicketsProps {
  esAdministrador?: boolean;
  listar: (
    consulta: { estado: string; limit: number; offset: number },
    signal: AbortSignal,
  ) => Promise<Ticket[]>;
  listarEstados: (signal: AbortSignal) => Promise<Catalogo[]>;
  actualizar: (
    id: number,
    cambios: CambiosTicket,
  ) => Promise<unknown>;
}

const LIMITE = 20;

/** Bandeja compartida: consulta todas las solicitudes del personal y recibe nuevas cada 15 s. */
export function AdminTickets({
  esAdministrador = false,
  listar,
  listarEstados,
  actualizar,
}: AdminTicketsProps) {
  const derivacion = useDerivacionTickets();
  const retorno = esAdministrador ? derivacion?.recorrido?.retorno : undefined;
  const [consulta, setConsulta] = useState(retorno?.consulta ?? { estado: "", offset: 0 });
  const [version, setVersion] = useState(0);
  const [estados, setEstados] = useState<Catalogo[]>([]);
  const [errorEstados, setErrorEstados] = useState("");
  const [bandeja, setBandeja] = useState({
    tickets: [] as Ticket[],
    cargando: true,
    error: "",
    hayMas: false,
  });

  useEffect(() => {
    const peticion = new AbortController();
    listarEstados(peticion.signal).then(
      (datos) => {
        if (!peticion.signal.aborted) {
          setEstados(datos);
          setErrorEstados("");
        }
      },
      (causa: Error) => {
        if (!peticion.signal.aborted) setErrorEstados(causa.message);
      },
    );
    return () => peticion.abort();
  }, [listarEstados, version]);

  useEffect(() => {
    const peticion = new AbortController();
    let temporizador: ReturnType<typeof setTimeout>;
    async function cargar() {
      try {
        const datos = await listar(
          { ...consulta, limit: LIMITE + 1 },
          peticion.signal,
        );
        if (peticion.signal.aborted) return;
        setBandeja({
          tickets: datos.slice(0, LIMITE),
          cargando: false,
          error: "",
          hayMas: datos.length > LIMITE,
        });
      } catch (causa) {
        if (peticion.signal.aborted) return;
        setBandeja({
          tickets: [],
          cargando: false,
          error:
            causa instanceof Error
              ? causa.message
              : "No se pudieron consultar los tickets.",
          hayMas: false,
        });
      } finally {
        if (!peticion.signal.aborted)
          temporizador = setTimeout(() => void cargar(), 15000);
      }
    }
    void cargar();
    return () => {
      peticion.abort();
      clearTimeout(temporizador);
    };
  }, [listar, consulta, version]);

  function cambiarConsulta(estado: string, offset: number) {
    setBandeja({ tickets: [], cargando: true, error: "", hayMas: false });
    setConsulta({ estado, offset });
  }

  return (
    <>
      <section className="wf-card wf-form" aria-label="Filtros de tickets">
        <p className="wf-muted">
          Solicitudes enviadas por los usuarios desde Solicitar soporte. La
          bandeja se actualiza cada 15 segundos.
        </p>
        <label>
          Filtrar por estado
          <select
            value={consulta.estado}
            onChange={(e) => cambiarConsulta(e.target.value, 0)}
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado.id}>{estado.nombre}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="wf-button wf-button--secondary"
          disabled={bandeja.cargando}
          onClick={() => setVersion((v) => v + 1)}
        >
          Actualizar tickets
        </button>
      </section>
      <GestionTickets
        esAdministrador={esAdministrador}
        edicionInicial={retorno?.edicion}
        onDerivar={esAdministrador && derivacion ? (edicion, modulo) =>
          derivacion.derivar({ edicion, consulta }, modulo) : undefined}
        tickets={bandeja.tickets}
        estados={estados}
        cargando={bandeja.cargando}
        error={bandeja.error || errorEstados}
        onActualizar={async (id, cambios) => {
          await actualizar(id, cambios);
          setBandeja((actual) => ({ ...actual, tickets: actual.tickets.map((t) => t.ticket_id === id ? {
            ...t,
            ...(cambios.enviar_verificacion ? { estado: "EN PROCESO" }
              : cambios.estado && { estado: cambios.estado }),
            ...(cambios.solucion && { solucion: cambios.solucion }),
          } : t) }));
          setVersion((v) => v + 1);
        }}
      />
      <div className="wf-actions" aria-label="Paginación de tickets">
        <button
          type="button"
          className="wf-button wf-button--secondary"
          disabled={bandeja.cargando || consulta.offset === 0}
          onClick={() =>
            cambiarConsulta(
              consulta.estado,
              Math.max(0, consulta.offset - LIMITE),
            )
          }
        >
          Anterior
        </button>
        <span className="wf-muted">
          Página {Math.floor(consulta.offset / LIMITE) + 1}
        </span>
        <button
          type="button"
          className="wf-button wf-button--secondary"
          disabled={bandeja.cargando || !bandeja.hayMas}
          onClick={() =>
            cambiarConsulta(consulta.estado, consulta.offset + LIMITE)
          }
        >
          Siguiente
        </button>
      </div>
    </>
  );
}
