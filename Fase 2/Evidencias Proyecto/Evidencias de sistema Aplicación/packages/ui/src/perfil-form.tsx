import { useEffect, useState, type FormEvent } from "react";
import { avisar, mensajeError } from "./avisos";
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
  /** PATCH /usuarios/me (nombre_usuario y correo_usuario). */
  onGuardar: (nombreUsuario: string, correo: string) => Promise<void>;
  /** Variante "usuario": guarda finalidad, contactos, mensaje y ficha médica. Sin ella solo viven en el formulario. */
  api?: PerfilApi;
  /** PATCH /usuarios/me/password (HU-15). Sin ella el cambio de contraseña sigue pendiente. */
  onCambiarPassword?: (actual: string, nueva: string) => Promise<void>;
}

/** Estado de validación de un campo para pintarlo en verde o rojo mientras se escribe. */
type Validacion = { ok: boolean; texto: string } | null;

const claseCampo = (v: Validacion) =>
  v === null ? undefined : v.ok ? "wf-valido" : "wf-invalido";

const Ayuda = ({ v }: { v: Validacion }) =>
  v && (
    <p className={`wf-ayuda ${v.ok ? "wf-ayuda--ok" : "wf-ayuda--error"}`}>
      {v.ok ? "✓ " : "✕ "}
      {v.texto}
    </p>
  );

function validarNombreContacto(nombre: string): Validacion {
  const limpio = nombre.trim();
  if (!nombre) return null;
  return limpio && limpio.length <= 20
    ? { ok: true, texto: "Nombre válido" }
    : { ok: false, texto: "Entre 1 y 20 caracteres" };
}

function validarNumero(numero: string): Validacion {
  if (!numero) return null;
  return NUMERO_E164.test(numero.replace(/\s/g, ""))
    ? { ok: true, texto: "Número válido" }
    : { ok: false, texto: "Usa formato internacional, p. ej. +56912345678" };
}

export interface ContactoEmergencia {
  contacto_emergencia_ID: number;
  nombre_contacto: string;
  num_emergencia: string;
}

export interface FichaMedica {
  tipo_sangre: string;
  alergias: string;
  enfermedades_cronicas: string;
  medicamentos_actuales: string;
  discapacidad_presente: string;
  donante_organos: boolean;
}

/** Respuesta de GET /usuarios/me/perfil y de cada escritura. */
export interface PerfilEmergencia {
  prioridad_ID: number | null;
  mensaje: string | null;
  contactos: ContactoEmergencia[];
  ficha_medica: FichaMedica | null;
}

type Fetcher = <T>(path: string, init?: RequestInit) => Promise<T>;
type DatosContacto = Omit<ContactoEmergencia, "contacto_emergencia_ID">;

/** CRUD de /usuarios/me/perfil y /usuarios/me/contactos con el fetch autenticado de cada app. */
export function perfilApi(fetcher: Fetcher) {
  const enviar = (method: string, path: string, body?: unknown) =>
    fetcher<PerfilEmergencia>(path, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  return {
    cargar: () => fetcher<PerfilEmergencia>("/usuarios/me/perfil"),
    guardar: (cambios: Partial<Omit<PerfilEmergencia, "contactos">>) =>
      enviar("PUT", "/usuarios/me/perfil", cambios),
    guardarContacto: (datos: DatosContacto, id?: number) =>
      id === undefined
        ? enviar("POST", "/usuarios/me/contactos", datos)
        : enviar("PUT", `/usuarios/me/contactos/${id}`, datos),
    eliminarContacto: (id: number) =>
      enviar("DELETE", `/usuarios/me/contactos/${id}`),
  };
}

export type PerfilApi = ReturnType<typeof perfilApi>;

const mensajeDe = (causa: unknown) =>
  causa instanceof Error ? causa.message : "Error al comunicarse con el servidor.";

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
  api,
  onCambiarPassword,
}: PerfilFormProps) => {
  const conDatos = Boolean(api) && variante === "usuario";
  const [usuario, setUsuario] = useState(nombreUsuario);
  const [email, setEmail] = useState(correo);
  // Sin endpoint: estos campos viven solo en el estado del formulario.
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  // 0 = sin finalidad (PRIORIDAD_ID nulo).
  const [prioridad, setPrioridad] = useState<number>(conDatos ? 0 : PRIORIDADES[0].id);
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);
  const [nuevo, setNuevo] = useState({ nombre: "", numero: "" });
  const [editando, setEditando] = useState<number | null>(null);
  const [errorContacto, setErrorContacto] = useState("");
  const [carga, setCarga] = useState({ cargando: conDatos, error: "" });
  const [mensaje, setMensaje] = useState("");
  const [medico, setMedico] = useState<Record<string, string>>({});
  const [donante, setDonante] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [estado, setEstado] = useState<{ ok: boolean; texto: string } | null>(
    null,
  );
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!api || !conDatos) return;
    let activo = true;
    api.cargar().then(
      (perfil) => {
        if (!activo) return;
        setPrioridad(perfil.prioridad_ID ?? 0);
        setMensaje(perfil.mensaje ?? "");
        setContactos(perfil.contactos);
        const { donante_organos = false, ...textos } = perfil.ficha_medica ?? {};
        setMedico(textos);
        setDonante(donante_organos);
        setCarga({ cargando: false, error: "" });
      },
      (causa: unknown) => {
        if (!activo) return;
        setCarga({ cargando: false, error: mensajeDe(causa) });
        avisar("error", `No se pudo cargar tu perfil: ${mensajeDe(causa)}`);
      },
    );
    return () => {
      activo = false;
    };
  }, [api, conDatos]);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (accesoParcial) return setModal("autorizacion");
    setEstado(null);
    setGuardando(true);
    try {
      await onGuardar(usuario.trim(), email.trim());
      if (api && conDatos) {
        const textos = Object.fromEntries(
          CAMPOS_MEDICOS.map(([clave]) => [clave, (medico[clave] ?? "").trim()]),
        ) as Omit<FichaMedica, "donante_organos">;
        const fichaVacia = !donante && Object.values(textos).every((v) => !v);
        await api.guardar({
          prioridad_ID: prioridad || null,
          mensaje: mensaje.trim() || null,
          ficha_medica: fichaVacia ? null : { ...textos, donante_organos: donante },
        });
      }
      const texto = conDatos
        ? "Datos guardados."
        : "Nombre de usuario y correo actualizados.";
      setEstado({ ok: true, texto });
      avisar("exito", texto);
    } catch (causa) {
      const texto = mensajeError(causa, "No se pudo guardar");
      setEstado({ ok: false, texto });
      avisar("error", texto);
    } finally {
      setGuardando(false);
    }
  }

  /** Crea o, si `editando`, actualiza el contacto; con `api` se guarda al instante. */
  async function guardarContacto() {
    const datos = {
      nombre_contacto: nuevo.nombre.trim(),
      num_emergencia: nuevo.numero.replace(/\s/g, ""),
    };
    const rechazar = (texto: string) => {
      setErrorContacto(texto);
      avisar("error", texto);
    };
    if (editando === null && contactos.length >= MAX_CONTACTOS)
      return rechazar(`Ya tienes los ${MAX_CONTACTOS} contactos permitidos (RF7). Borra o edita uno.`);
    if (!datos.nombre_contacto || datos.nombre_contacto.length > 20)
      return rechazar("El nombre debe tener entre 1 y 20 caracteres.");
    if (!NUMERO_E164.test(datos.num_emergencia))
      return rechazar("Número en formato internacional, p. ej. +56912345678.");
    setErrorContacto("");
    if (api && conDatos) {
      try {
        setContactos((await api.guardarContacto(datos, editando ?? undefined)).contactos);
      } catch (causa) {
        return rechazar(mensajeDe(causa));
      }
      avisar(
        "exito",
        editando === null
          ? `Contacto "${datos.nombre_contacto}" agregado. Recibirá tus alertas.`
          : `Contacto "${datos.nombre_contacto}" actualizado.`,
      );
    } else if (editando !== null) {
      setContactos((actuales) =>
        actuales.map((c) =>
          c.contacto_emergencia_ID === editando ? { ...c, ...datos } : c,
        ),
      );
    } else {
      setContactos((actuales) => [
        ...actuales,
        { contacto_emergencia_ID: -Date.now(), ...datos },
      ]);
    }
    setNuevo({ nombre: "", numero: "" });
    setEditando(null);
  }

  async function borrarContacto(id: number) {
    setErrorContacto("");
    if (api && conDatos) {
      try {
        setContactos((await api.eliminarContacto(id)).contactos);
        avisar("exito", "Contacto eliminado.");
      } catch (causa) {
        setErrorContacto(mensajeDe(causa));
        avisar("error", mensajeDe(causa));
      }
    } else {
      setContactos((actuales) =>
        actuales.filter((c) => c.contacto_emergencia_ID !== id),
      );
    }
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
          nombre, teléfono{onCambiarPassword ? "" : ", cambio de contraseña"}
          {variante === "administrador"
            ? " y PIN de trabajador"
            : variante === "usuario" && !conDatos
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

        {variante === "soporte" ? null : carga.cargando ? (
          <p className="wf-muted">Cargando…</p>
        ) : carga.error ? (
          <p className="wf-message wf-message--error">
            Error al cargar la información: {carga.error}
          </p>
        ) : variante === "administrador" ? (
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
                disabled={accesoParcial}
                onChange={(e) => setPrioridad(Number(e.target.value))}
              >
                {conDatos && <option value={0}>Sin definir</option>}
                {PRIORIDADES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="wf-form" disabled={accesoParcial}>
              <legend>
                Contactos de emergencia ({contactos.length}/{MAX_CONTACTOS})
              </legend>
              <p className="wf-muted">
                Ante una alerta se avisa a todos tus contactos: puedes
                registrar hasta {MAX_CONTACTOS} números y necesitas al menos 1
                (RF6, RF7).
              </p>
              <div
                className={`wf-progreso${contactos.length === 0 ? " wf-progreso--vacio" : ""}`}
                role="progressbar"
                aria-label="Contactos registrados"
                aria-valuemin={0}
                aria-valuemax={MAX_CONTACTOS}
                aria-valuenow={contactos.length}
              >
                <span
                  style={{
                    width: `${Math.max(contactos.length, 0.15) * (100 / MAX_CONTACTOS)}%`,
                  }}
                />
              </div>
              {contactos.length === 0 && (
                <p className="wf-ayuda wf-ayuda--error">
                  ✕ Aún no tienes contactos: nadie recibiría tu alerta.
                </p>
              )}
              <ol className="wf-contactos">
                {Array.from({ length: MAX_CONTACTOS }, (_, i) => {
                  const c = contactos[i];
                  return c ? (
                    <li className="wf-contacto" key={c.contacto_emergencia_ID}>
                      <span className="wf-contacto-numero">{i + 1}</span>
                      <span>
                        <strong>{c.nombre_contacto}</strong>
                        <br />
                        <span className="wf-muted">{c.num_emergencia}</span>
                      </span>
                      <span className="wf-row">
                        <button
                          type="button"
                          className="wf-button wf-button--secondary"
                          onClick={() => {
                            setEditando(c.contacto_emergencia_ID);
                            setNuevo({ nombre: c.nombre_contacto, numero: c.num_emergencia });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="wf-button wf-button--secondary"
                          onClick={() => void borrarContacto(c.contacto_emergencia_ID)}
                        >
                          Borrar
                        </button>
                      </span>
                    </li>
                  ) : (
                    <li className="wf-contacto wf-contacto--vacio" key={`vacio-${i}`}>
                      <span className="wf-contacto-numero">{i + 1}</span>
                      <span>Casillero libre</span>
                      <span />
                    </li>
                  );
                })}
              </ol>
              <p className="wf-muted">
                {editando === null
                  ? contactos.length < MAX_CONTACTOS
                    ? `Agregar contacto ${contactos.length + 1} de ${MAX_CONTACTOS}`
                    : "Ya registraste los 5 contactos permitidos"
                  : "Editando contacto"}
              </p>
              <div className="wf-row">
                <input
                  aria-label="Nombre del contacto"
                  placeholder="Nombre"
                  maxLength={20}
                  className={claseCampo(validarNombreContacto(nuevo.nombre))}
                  value={nuevo.nombre}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, nombre: e.target.value })
                  }
                />
                <input
                  type="tel"
                  aria-label="Número del contacto"
                  placeholder="+569…"
                  className={claseCampo(validarNumero(nuevo.numero))}
                  value={nuevo.numero}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, numero: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="wf-button wf-button--secondary"
                  disabled={editando === null && contactos.length >= MAX_CONTACTOS}
                  onClick={() => void guardarContacto()}
                >
                  {editando === null ? "Agregar contacto +" : "Guardar contacto"}
                </button>
                {editando !== null && (
                  <button
                    type="button"
                    className="wf-button wf-button--secondary"
                    onClick={() => {
                      setEditando(null);
                      setNuevo({ nombre: "", numero: "" });
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
              <Ayuda v={validarNombreContacto(nuevo.nombre)} />
              <Ayuda v={validarNumero(nuevo.numero)} />
              {errorContacto && (
                <p className="wf-message wf-message--error">{errorContacto}</p>
              )}
            </fieldset>

            <label>
              Mensaje personalizado ({mensaje.length}/200)
              <textarea
                rows={3}
                disabled={accesoParcial}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                maxLength={200}
              />
            </label>

            <fieldset className="wf-form" disabled={accesoParcial}>
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

      {onCambiarPassword && (
        <CambioPassword bloqueado={accesoParcial} onCambiar={onCambiarPassword} />
      )}

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

/** HU-15 / RF3: cambio de contraseña verificando la actual; marca en vivo si la nueva es válida. */
const CambioPassword = ({
  bloqueado,
  onCambiar,
}: {
  bloqueado: boolean;
  onCambiar: (actual: string, nueva: string) => Promise<void>;
}) => {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [guardando, setGuardando] = useState(false);

  const largo: Validacion = nueva
    ? nueva.length >= 8
      ? { ok: true, texto: "Largo suficiente" }
      : { ok: false, texto: `Faltan ${8 - nueva.length} caracteres (mínimo 8)` }
    : null;
  const coincide: Validacion = repetida
    ? repetida === nueva
      ? { ok: true, texto: "Las contraseñas coinciden" }
      : { ok: false, texto: "Las contraseñas no coinciden" }
    : null;

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!largo?.ok || !coincide?.ok) {
      avisar("error", "Revisa los campos marcados en rojo.");
      return;
    }
    setGuardando(true);
    try {
      await onCambiar(actual, nueva);
      setActual("");
      setNueva("");
      setRepetida("");
      avisar("exito", "Contraseña actualizada. Úsala en tu próximo inicio de sesión.");
    } catch (causa) {
      avisar("error", mensajeError(causa, "No se pudo cambiar la contraseña"));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="wf-card wf-form" onSubmit={(event) => void enviar(event)}>
      <h2>Cambiar contraseña</h2>
      {bloqueado && (
        <p className="wf-message wf-message--error">
          Tu acceso es parcial: el cambio de contraseña requiere a tu cuenta principal.
        </p>
      )}
      <fieldset className="wf-form" disabled={bloqueado}>
        <label>
          Contraseña actual
          <input
            type="password"
            autoComplete="current-password"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            required
          />
        </label>
        <label>
          Nueva contraseña
          <input
            type="password"
            autoComplete="new-password"
            className={claseCampo(largo)}
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            maxLength={72}
            required
          />
          <Ayuda v={largo} />
        </label>
        <label>
          Repite la nueva contraseña
          <input
            type="password"
            autoComplete="new-password"
            className={claseCampo(coincide)}
            value={repetida}
            onChange={(e) => setRepetida(e.target.value)}
            maxLength={72}
            required
          />
          <Ayuda v={coincide} />
        </label>
        <div className="wf-actions">
          <button type="submit" className="wf-button" disabled={guardando}>
            {guardando ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </div>
      </fieldset>
    </form>
  );
};
