import { useState, type FormEvent } from "react";
import { MAX_CONTACTOS, NUMERO_E164, PRIORIDADES } from "./mocks";
import { Notice, Pendiente, PinDialog } from "./wireframe";

interface PerfilFormProps {
  nombreUsuario: string;
  correo: string;
  /**
   * "usuario": finalidad, contactos, mensaje y ficha médica.
   * "soporte" (Trabajador, mockup pág. 12): solo datos personales.
   * "administrador" (mockup págs. 32-33): además el PIN de verificación de trabajador.
   */
  variante?: "usuario" | "soporte" | "administrador";
  /** Acceso parcial: el backend rechaza PATCH /usuarios/me (403); se pide autorización del principal. */
  accesoParcial?: boolean;
  /** Único guardado conectado: PATCH /usuarios/me (nombre_usuario y correo_usuario). */
  onGuardar: (nombreUsuario: string, correo: string) => Promise<void>;
}

interface Contacto {
  nombre: string;
  numero: string;
}

/** Columnas de ANTECEDENTE_MEDICO (init.sql) salvo donante_organos, que es booleano. */
const CAMPOS_MEDICOS = [
  ["tipo_sangre", "Tipo de sangre"],
  ["alergias", "Alergias"],
  ["enfermedades_cronicas", "Enfermedades crónicas"],
  ["medicamentos_actuales", "Medicamentos actuales"],
  ["discapacidad_presente", "Discapacidad presente"],
] as const;

type Modal =
  "pin" | "pin-pendiente" | "autorizacion" | "autorizacion-pendiente" | null;

/** Pantalla "Modificar Usuario" de los wireframes, con los campos del modelo de datos. */
export const PerfilForm = ({
  nombreUsuario,
  correo,
  variante = "usuario",
  accesoParcial = false,
  onGuardar,
}: PerfilFormProps) => {
  const [usuario, setUsuario] = useState(nombreUsuario);
  const [email, setEmail] = useState(correo);
  // Sin endpoint: estos campos viven solo en el estado del formulario.
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [prioridad, setPrioridad] = useState<number>(PRIORIDADES[0].id);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [nuevo, setNuevo] = useState<Contacto>({ nombre: "", numero: "" });
  const [errorContacto, setErrorContacto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [medico, setMedico] = useState<Record<string, string>>({});
  const [donante, setDonante] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [estado, setEstado] = useState<{ ok: boolean; texto: string } | null>(
    null,
  );
  const [guardando, setGuardando] = useState(false);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (accesoParcial) return setModal("autorizacion");
    setEstado(null);
    setGuardando(true);
    try {
      await onGuardar(usuario.trim(), email.trim());
      setEstado({
        ok: true,
        texto: "Nombre de usuario y correo actualizados.",
      });
    } catch (causa) {
      setEstado({
        ok: false,
        texto: causa instanceof Error ? causa.message : "No se pudo guardar",
      });
    } finally {
      setGuardando(false);
    }
  }

  function agregarContacto() {
    const contacto = {
      nombre: nuevo.nombre.trim(),
      numero: nuevo.numero.replace(/\s/g, ""),
    };
    if (contactos.length >= MAX_CONTACTOS)
      return setErrorContacto(`Máximo ${MAX_CONTACTOS} contactos (RF7).`);
    if (!contacto.nombre || contacto.nombre.length > 20)
      return setErrorContacto("El nombre debe tener entre 1 y 20 caracteres.");
    if (!NUMERO_E164.test(contacto.numero))
      return setErrorContacto(
        "Número en formato internacional, p. ej. +56912345678.",
      );
    setErrorContacto("");
    setContactos((actuales) => [...actuales, contacto]);
    setNuevo({ nombre: "", numero: "" });
  }

  return (
    <>
      <form
        className="wf-card wf-form"
        onSubmit={(event) => void guardar(event)}
      >
        <h1>Modificar usuario</h1>
        {accesoParcial && (
          <p className="wf-message wf-message--error">
            Tu cuenta tiene acceso parcial: los cambios requieren autorización
            de la cuenta principal.
          </p>
        )}

        <label>
          Nombre de usuario
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            minLength={2}
            maxLength={50}
            required
          />
        </label>
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={100}
            required
          />
        </label>

        <Pendiente>
          nombre, teléfono, cambio de contraseña
          {variante === "administrador"
            ? " y PIN de trabajador"
            : variante === "usuario"
              ? ", finalidad, contactos, mensaje y ficha médica"
              : ""}{" "}
          aún no se guardan
        </Pendiente>
        <label>
          Nombre
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Federico Arturo"
          />
        </label>
        <label>
          Número telefónico
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+569…"
          />
        </label>

        {variante === "soporte" ? null : variante === "administrador" ? (
          <div className="wf-row">
            <span>PIN de verificación de trabajador: ****</span>
            <button
              type="button"
              className="wf-button wf-button--secondary"
              onClick={() => setModal("pin")}
            >
              Modificar PIN
            </button>
          </div>
        ) : (
          <>
            <label>
              Finalidad
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(Number(e.target.value))}
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="wf-form">
              <legend>
                Contactos guardados ({contactos.length}/{MAX_CONTACTOS})
              </legend>
              {contactos.length === 0 && (
                <p className="wf-muted">
                  Debes registrar al menos 1 contacto (RF6).
                </p>
              )}
              {contactos.map((c, indice) => (
                <div className="wf-row" key={`${c.numero}-${indice}`}>
                  <span>
                    {c.nombre} · {c.numero}
                  </span>
                  <button
                    type="button"
                    className="wf-button wf-button--secondary"
                    onClick={() =>
                      setContactos((actuales) =>
                        actuales.filter((_, i) => i !== indice),
                      )
                    }
                  >
                    Borrar
                  </button>
                </div>
              ))}
              <div className="wf-row">
                <input
                  aria-label="Nombre del contacto"
                  placeholder="Nombre"
                  maxLength={20}
                  value={nuevo.nombre}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, nombre: e.target.value })
                  }
                />
                <input
                  type="tel"
                  aria-label="Número del contacto"
                  placeholder="+569…"
                  value={nuevo.numero}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, numero: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="wf-button wf-button--secondary"
                  disabled={contactos.length >= MAX_CONTACTOS}
                  onClick={agregarContacto}
                >
                  Posibles contactos +1
                </button>
              </div>
              {errorContacto && (
                <p className="wf-message wf-message--error">{errorContacto}</p>
              )}
            </fieldset>

            <label>
              Mensaje personalizado ({mensaje.length}/200)
              <textarea
                rows={3}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                maxLength={200}
              />
            </label>

            <fieldset className="wf-form">
              <legend>Antecedentes médicos (ficha médica)</legend>
              {CAMPOS_MEDICOS.map(([clave, etiqueta]) => (
                <label key={clave}>
                  {etiqueta}
                  <input
                    value={medico[clave] ?? ""}
                    onChange={(e) =>
                      setMedico({ ...medico, [clave]: e.target.value })
                    }
                  />
                </label>
              ))}
              <label className="wf-row">
                <input
                  type="checkbox"
                  checked={donante}
                  onChange={(e) => setDonante(e.target.checked)}
                />
                Donante de órganos
              </label>
            </fieldset>
          </>
        )}

        {estado && (
          <p
            className={
              estado.ok ? "wf-message" : "wf-message wf-message--error"
            }
            role="status"
          >
            {estado.texto}
          </p>
        )}
        <div className="wf-actions">
          <button type="submit" className="wf-button" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Fuera del <form>: PinDialog tiene su propio formulario y no se pueden anidar. */}
      {modal === "pin" && (
        <PinDialog
          title="Modificar PIN de trabajador"
          onClose={() => setModal(null)}
          onSubmit={() => setModal("pin-pendiente")}
        />
      )}
      {modal === "pin-pendiente" && (
        <Notice
          title="PIN no guardado"
          message="El backend aún no tiene un endpoint para modificar el PIN de trabajador."
          onClose={() => setModal(null)}
        />
      )}
      {modal === "autorizacion" && (
        <PinDialog
          title="Autorización de la cuenta principal"
          info="Para modificar esta cuenta se necesita el PIN de la cuenta principal."
          confirmar={false}
          onClose={() => setModal(null)}
          onSubmit={() => setModal("autorizacion-pendiente")}
        />
      )}
      {modal === "autorizacion-pendiente" && (
        <Notice
          title="No se pudo validar"
          tone="error"
          message="El backend aún no valida el PIN de la cuenta principal para cambios de perfil, así que no se envió nada. Si necesitas el cambio, contacta a soporte."
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
};
