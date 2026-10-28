import { useEffect, useState } from "react";
import { avisar, mensajeError } from "./avisos";
import type { Catalogo } from "./soporte";
import { DataTable } from "./wireframe";

/** Respuesta de GET /internal/v1/mensajes-contacto (formulario de la web pública). */
export interface MensajeContacto {
  mensaje_contacto_id: number;
  nombre: string;
  correo: string;
  mensaje: string;
  fecha: string;
  tipo: string;
  estado: string;
  respuestas: { respuesta_id: number; texto: string; fecha: string; autor: string | null }[];
}

export interface CambiosMensaje {
  estado?: string;
  respuesta?: string;
}

interface AdminContactoProps {
  listar: (consulta: { estado: string; limit: number }, signal: AbortSignal) => Promise<MensajeContacto[]>;
  listarEstados: (signal: AbortSignal) => Promise<Catalogo[]>;
  actualizar: (id: number, cambios: CambiosMensaje) => Promise<MensajeContacto>;
}

// shortcut: muestra los 100 más recientes del filtro; paginar si la bandeja crece.
const LIMITE = 100;

const fecha = (iso: string) => new Date(iso).toLocaleString("es-CL");

/** Redacción de Gmail con destinatario y asunto; el cuerpo va al portapapeles para pegarlo. */
const redactarEnGmail = (m: MensajeContacto) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(m.correo)}&su=${encodeURIComponent(
    "Respuesta a tu mensaje en EMERGEN",
  )}`;

const cuerpoCorreo = (m: MensajeContacto, texto: string) =>
  `Hola ${m.nombre}:\n\n${texto}\n\n---\nTu mensaje: ${m.mensaje}`;

/**
 * EMERGEN no envía correos: copia la respuesta y abre Gmail en el navegador predeterminado
 * (en escritorio, Electron deriva window.open https al navegador del sistema).
 */
function enviarPorGmail(m: MensajeContacto, texto: string) {
  // La copia se inicia antes de abrir la pestaña: después el documento pierde el foco y el navegador la rechaza.
  const copia = navigator.clipboard?.writeText(cuerpoCorreo(m, texto)) ?? Promise.reject(new Error("sin portapapeles"));
  window.open(redactarEnGmail(m), "_blank", "noopener");
  copia.then(
    () => avisar("exito", "Respuesta copiada. Pégala en el correo de Gmail (Ctrl+V) y envíala."),
    () => avisar("error", "No se pudo copiar la respuesta. Cópiala manualmente desde el historial."),
  );
}

/** Bandeja de mensajes de visitantes (MENSAJE_CONTACTO) para ADMINISTRADOR y SOPORTE. */
export function AdminContacto({ listar, listarEstados, actualizar }: AdminContactoProps) {
  const [filtro, setFiltro] = useState("");
  const [version, setVersion] = useState(0);
  const [estados, setEstados] = useState<Catalogo[]>([]);
  const [bandeja, setBandeja] = useState({ mensajes: [] as MensajeContacto[], cargando: true, error: "" });
  const [seleccion, setSeleccion] = useState<MensajeContacto | null>(null);
  const [estado, setEstado] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const peticion = new AbortController();
    listarEstados(peticion.signal).then(
      (datos) => !peticion.signal.aborted && setEstados(datos),
      () => {},
    );
    return () => peticion.abort();
  }, [listarEstados]);

  useEffect(() => {
    const peticion = new AbortController();
    listar({ estado: filtro, limit: LIMITE }, peticion.signal).then(
      (mensajes) => !peticion.signal.aborted && setBandeja({ mensajes, cargando: false, error: "" }),
      (causa: Error) => !peticion.signal.aborted && setBandeja({ mensajes: [], cargando: false, error: causa.message }),
    );
    return () => peticion.abort();
  }, [listar, filtro, version]);

  function seleccionar(m: MensajeContacto) {
    if (guardando) return;
    if (seleccion?.mensaje_contacto_id === m.mensaje_contacto_id) return setSeleccion(null);
    setSeleccion(m);
    setEstado(m.estado);
    setRespuesta("");
  }

  async function guardar() {
    if (!seleccion) return;
    const cambios: CambiosMensaje = {};
    if (respuesta.trim()) cambios.respuesta = respuesta.trim();
    // Sin respuesta, solo cambia el estado; con respuesta, el backend la deja REVISADO salvo que se elija otro.
    if (estado !== seleccion.estado) cambios.estado = estado;
    if (!cambios.respuesta && !cambios.estado) return avisar("info", "No hay cambios que guardar.");
    setGuardando(true);
    try {
      const actualizado = await actualizar(seleccion.mensaje_contacto_id, cambios);
      setSeleccion(actualizado);
      setEstado(actualizado.estado);
      setRespuesta("");
      setVersion((v) => v + 1);
      avisar("exito", cambios.respuesta ? "Respuesta registrada. Envíala con «Copiar respuesta y abrir Gmail»." : "Estado actualizado.");
    } catch (causa) {
      avisar("error", mensajeError(causa));
    } finally {
      setGuardando(false);
    }
  }

  const ultima = seleccion?.respuestas.at(-1);

  return (
    <section className="wf-card">
      <h1>Mensajes de contacto</h1>
      <p className="wf-muted">
        Preguntas, sugerencias y reclamos enviados desde la web pública por personas sin sesión.
      </p>
      <label>
        Estado{" "}
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos</option>
          {estados.map((e) => (
            <option key={e.id}>{e.nombre}</option>
          ))}
        </select>
      </label>
      {bandeja.cargando && <p className="wf-muted">Cargando…</p>}
      {bandeja.error && (
        <p className="wf-message wf-message--error" role="alert">
          {bandeja.error}
        </p>
      )}
      <DataTable
        columns={[
          { header: "N.º", render: (m) => m.mensaje_contacto_id },
          { header: "Fecha", render: (m) => fecha(m.fecha) },
          { header: "Nombre", render: (m) => m.nombre },
          { header: "Correo", render: (m) => m.correo },
          { header: "Tipo", render: (m) => m.tipo },
          { header: "Estado", render: (m) => m.estado },
          { header: "Mensaje", render: (m) => m.mensaje },
        ]}
        rows={bandeja.mensajes}
        rowKey={(m) => m.mensaje_contacto_id}
        searchText={(m) => `${m.mensaje_contacto_id} ${m.nombre} ${m.correo} ${m.tipo} ${m.estado} ${m.mensaje}`}
        selectedKey={seleccion?.mensaje_contacto_id}
        onSelect={seleccionar}
        descarga="mensajes-contacto"
        empty="No hay mensajes."
      />
      {seleccion && (
        <form
          className="wf-card wf-form wf-support-editor"
          onSubmit={(event) => {
            event.preventDefault();
            void guardar();
          }}
        >
          <h2>Mensaje {seleccion.mensaje_contacto_id}</h2>
          <p>
            {seleccion.nombre} · <a href={`mailto:${seleccion.correo}`}>{seleccion.correo}</a> · {seleccion.tipo} ·{" "}
            {fecha(seleccion.fecha)}
          </p>
          <div>
            <h3>Mensaje</h3>
            <p className="wf-support-description">{seleccion.mensaje}</p>
          </div>
          <div>
            <h3>Respuestas</h3>
            {seleccion.respuestas.length === 0 ? (
              <p className="wf-muted">Aún no hay respuestas.</p>
            ) : (
              <ul>
                {seleccion.respuestas.map((r) => (
                  <li key={r.respuesta_id}>
                    <strong>{r.autor ?? "Cuenta eliminada"}</strong> · {fecha(r.fecha)}
                    <p>{r.texto}</p>
                  </li>
                ))}
              </ul>
            )}
            {ultima && (
              <button
                type="button"
                className="wf-button wf-button--secondary"
                onClick={() => enviarPorGmail(seleccion, ultima.texto)}
              >
                Copiar respuesta y abrir Gmail
              </button>
            )}
          </div>
          <label>
            Estado
            <select value={estado} disabled={guardando || estados.length === 0} onChange={(e) => setEstado(e.target.value)}>
              {estados.map((e) => (
                <option key={e.id}>{e.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Nueva respuesta
            <textarea rows={3} maxLength={500} value={respuesta} disabled={guardando} onChange={(e) => setRespuesta(e.target.value)} />
          </label>
          <p className="wf-muted">
            EMERGEN no envía correos automáticamente: guarda la respuesta y luego usa «Copiar respuesta y abrir Gmail»
            para pegarla en el correo al remitente.
          </p>
          <div className="wf-actions">
            <button type="button" className="wf-button wf-button--secondary" disabled={guardando} onClick={() => setSeleccion(null)}>
              Cerrar
            </button>
            <button type="submit" className="wf-button" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
