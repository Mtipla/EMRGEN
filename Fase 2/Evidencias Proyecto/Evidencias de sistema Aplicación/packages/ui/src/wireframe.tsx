import { useState, type FormEvent, type ReactNode } from "react";
import { NUMEROS_EMERGENCIA } from "./mocks";
import "./wireframe.css";

/** Primitivas de UI de los wireframes, compartidas por web, escritorio y móvil. */

type Tone = "info" | "success" | "error";

interface ModalProps {
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  tone?: Tone;
  onClose: () => void;
}

export const Modal = ({
  title,
  children,
  actions,
  tone = "info",
  onClose,
}: ModalProps) => (
  <div
    className="wf-overlay"
    onKeyDown={(event) => event.key === "Escape" && onClose()}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={`wf-modal wf-modal--${tone}`}
    >
      <h2>{title}</h2>
      {children}
      <div className="wf-actions">{actions}</div>
    </div>
  </div>
);

interface NoticeProps {
  title: string;
  message: ReactNode;
  tone?: Tone;
  onClose: () => void;
}

/** Mensaje informativo, de éxito o de error con un único botón "Ok, entiendo". */
export const Notice = ({ title, message, tone, onClose }: NoticeProps) => (
  <Modal
    title={title}
    tone={tone}
    onClose={onClose}
    actions={
      <button type="button" className="wf-button" autoFocus onClick={onClose}>
        Ok, entiendo
      </button>
    }
  >
    <p>{message}</p>
  </Modal>
);

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Sí",
  cancelLabel = "No",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal
    title={title}
    tone="error"
    onClose={onCancel}
    actions={
      <>
        <button
          type="button"
          className="wf-button wf-button--secondary"
          autoFocus
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button type="button" className="wf-button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </>
    }
  >
    <p>{message}</p>
  </Modal>
);

/** Devuelve el error de un PIN de 4 dígitos y su confirmación, o "" si es válido. */
export function validarPin(pin: string, confirmacion: string): string {
  if (!/^\d{4}$/.test(pin)) return "El PIN debe tener exactamente 4 dígitos.";
  if (pin !== confirmacion) return "Los PIN no coinciden.";
  return "";
}

const soloDigitos = (valor: string) => valor.replace(/\D/g, "").slice(0, 4);

interface PinDialogProps {
  title: string;
  /** Si se indica, primero se muestra este aviso y luego el formulario. */
  info?: ReactNode;
  /** false: verificación de un PIN existente (un solo campo, sin confirmación). */
  confirmar?: boolean;
  onSubmit: (pin: string) => Promise<void> | void;
  onClose: () => void;
}

/** Flujo "Crear PIN" (PIN + confirmación) o "Ingresar PIN" (confirmar=false), con aviso opcional. */
export const PinDialog = ({
  title,
  info,
  confirmar = true,
  onSubmit,
  onClose,
}: PinDialogProps) => {
  const [paso, setPaso] = useState<"info" | "form">(info ? "info" : "form");
  const [pin, setPin] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  if (paso === "info") {
    return (
      <Modal
        title={title}
        onClose={onClose}
        actions={
          <button
            type="button"
            className="wf-button"
            autoFocus
            onClick={() => setPaso("form")}
          >
            Ok, entiendo
          </button>
        }
      >
        <p>{info}</p>
      </Modal>
    );
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalido = validarPin(pin, confirmar ? confirmacion : pin);
    setError(invalido);
    if (invalido) return;
    setGuardando(true);
    try {
      await onSubmit(pin);
    } catch (causa) {
      setError(
        causa instanceof Error ? causa.message : "No se pudo guardar el PIN",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} actions={null}>
      <form className="wf-form" onSubmit={(event) => void enviar(event)}>
        <label>
          PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={pin}
            onChange={(event) => setPin(soloDigitos(event.target.value))}
            required
          />
        </label>
        {confirmar && (
          <label>
            Confirmar PIN
            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              value={confirmacion}
              onChange={(event) =>
                setConfirmacion(soloDigitos(event.target.value))
              }
              required
            />
          </label>
        )}
        {error && (
          <p className="wf-message wf-message--error" role="alert">
            {error}
          </p>
        )}
        <div className="wf-actions">
          <button
            type="button"
            className="wf-button wf-button--secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button type="submit" className="wf-button" disabled={guardando}>
            {guardando ? "Guardando…" : "Siguiente"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/** Marca visible de lo que aún no tiene endpoint en el backend. */
export const Pendiente = ({ children }: { children?: ReactNode }) => (
  <p className="wf-pending">
    PENDIENTE DE INTEGRACIÓN BACKEND{children ? <>: {children}</> : null}
  </p>
);

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  /** Valor para la descarga CSV cuando `render` no devuelve texto. */
  value?: (row: T) => string | number;
}

/** CSV (separador ;) de las filas visibles; solo usa datos ya cargados en pantalla. */
export function aCsv<T>(columns: Column<T>[], rows: T[]): string {
  const celda = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const valor = (c: Column<T>, row: T) => {
    if (c.value) return c.value(row);
    const r = c.render(row);
    return typeof r === "string" || typeof r === "number" ? r : "";
  };
  const filas = rows.map((row) =>
    columns.map((c) => celda(valor(c, row))).join(";"),
  );
  return [columns.map((c) => celda(c.header)).join(";"), ...filas].join("\r\n");
}

function descargarCsv(nombre: string, contenido: string) {
  // BOM para que Excel abra el CSV como UTF-8.
  const url = URL.createObjectURL(
    new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8" }),
  );
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: `${nombre}.csv`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  /** Texto contra el que filtra el buscador; sin él no hay buscador. */
  searchText?: (row: T) => string;
  selectedKey?: string | number;
  onSelect?: (row: T) => void;
  empty?: string;
  /** Nombre del archivo: muestra el botón "Descargar" (CSV de las filas visibles). */
  descarga?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  searchText,
  selectedKey,
  onSelect,
  empty = "Sin resultados.",
  descarga,
}: DataTableProps<T>) {
  const [busqueda, setBusqueda] = useState("");
  const [descargado, setDescargado] = useState(false);
  const termino = busqueda.trim().toLowerCase();
  const visibles =
    searchText && termino
      ? rows.filter((row) => searchText(row).toLowerCase().includes(termino))
      : rows;

  return (
    <div>
      <div className="wf-row">
        {searchText && (
          <input
            type="search"
            className="wf-search"
            placeholder="Buscar…"
            aria-label="Buscar"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        )}
        {descarga && (
          <button
            type="button"
            className="wf-button wf-button--secondary"
            disabled={visibles.length === 0}
            onClick={() => {
              descargarCsv(descarga, aCsv(columns, visibles));
              setDescargado(true);
            }}
          >
            Descargar
          </button>
        )}
      </div>
      <div className="wf-table-scroll">
        <table className="wf-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.map((row) => (
              <tr
                key={rowKey(row)}
                aria-selected={selectedKey === rowKey(row)}
                tabIndex={onSelect ? 0 : undefined}
                onClick={() => onSelect?.(row)}
                onKeyDown={(event) => event.key === "Enter" && onSelect?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.header}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibles.length === 0 && <p className="wf-muted">{empty}</p>}
      {descargado && (
        <Notice
          title="Descargar"
          message="El documento está siendo descargado en formato CSV en su portal de descarga."
          onClose={() => setDescargado(false)}
        />
      )}
    </div>
  );
}

/** HU-17 / RF14: acceso directo a los números oficiales de emergencia. */
export const NumerosEmergencia = () => (
  <section className="wf-card">
    <h2>Números de emergencia</h2>
    <div className="wf-row">
      {NUMEROS_EMERGENCIA.map((n) => (
        <a
          key={n.numero}
          className="wf-button wf-button--secondary"
          href={`tel:${n.numero}`}
        >
          {n.numero} · {n.servicio}
        </a>
      ))}
    </div>
  </section>
);
