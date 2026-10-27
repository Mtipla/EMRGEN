import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useEffect, useState, type FormEvent } from "react";
import { avisar, mensajeError } from "./avisos";
import { MAX_CONTACTOS, NUMERO_E164, PRIORIDADES } from "./mocks";
import { ConfirmDialog, Notice, Pendiente, PinDialog } from "./wireframe";
import { PerfilPersonal, type DatosPerfilPersonal } from "./perfil-personal";

interface PerfilFormProps {
  onGuardarPersonal?: (datos: DatosPerfilPersonal) => Promise<void>;
  nombreUsuario: string;
  /** null en cuentas apadrinadas: usan el correo y la contraseña de la principal. */
  correo: string | null;
  /**
   * "usuario": finalidad, contactos, mensaje y ficha médica.
   * "soporte" (Trabajador): nombre de usuario.
   * "administrador": nombre de usuario y PIN propio.
   */
  variante?: "usuario" | "soporte" | "administrador";
  /** Acceso parcial: el backend rechaza PATCH /usuarios/me (403); se pide autorización del principal. */
  accesoParcial?: boolean;
  /** PATCH /usuarios/me (nombre_usuario y correo_usuario); con acceso parcial, más el PIN del principal (HU-10). */
  onGuardar: (nombreUsuario: string, correo: string, pinPrincipal?: string) => Promise<void>;
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

/**
 * CA-03.1: lleva el número a E.164 igual que el backend (ContactoDto): acepta "+56 9 1234 5678",
 * "(9) 1234-5678" o "912345678", con Chile por defecto. Si no se reconoce, solo quita espacios.
 */
export function normalizarTelefono(valor: string): string {
  const numero = parsePhoneNumberFromString(valor, "CL");
  return numero?.isPossible() ? numero.number : valor.replace(/\s/g, "");
}

/** CA-05.1: máximo del mensaje personalizado (backend @MaxLength y CHECK en la BD). */
const MAX_MENSAJE = 160;

const NUMERO_DUPLICADO ="Ese número ya está en tu lista de contactos de emergencia";
/** Texto de CA-04.1; el backend responde lo mismo (PerfilService.eliminarContacto). */
const UNICO_CONTACTO =
  "Debe mantener al menos un contacto activo en su red de auxilio. Se recomienda editar el contacto activo";

function validarNumero(
  numero: string,
  contactos: ContactoEmergencia[],
  editando: number | null,
): Validacion {
  if (!numero) return null;
  const e164 = normalizarTelefono(numero);
  if (!NUMERO_E164.test(e164))
    return { ok: false, texto: "Usa formato internacional, p. ej. +56912345678" };
  if (contactos.some((c) => c.num_emergencia === e164 && c.contacto_emergencia_ID !== editando))
    return { ok: false, texto: NUMERO_DUPLICADO };
  return { ok: true, texto: `Número válido: ${e164}` };
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
  "autorizacion" | "autorizacion-pendiente" | null;

/** Pantalla "Modificar Usuario" de los wireframes, con los campos del modelo de datos. */
export const PerfilForm = (props: PerfilFormProps) =>
  props.variante === "soporte" || props.variante === "administrador"
    ? <PerfilPersonal {...props} variante={props.variante} />
    : <PerfilUsuario {...props} />;

const PerfilUsuario = ({
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
  const [email, setEmail] = useState(correo ?? "");
  // 0 = sin finalidad (PRIORIDAD_ID nulo).
  const [prioridad, setPrioridad] = useState<number>(conDatos ? 0 : PRIORIDADES[0].id);
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);
  const [nuevo, setNuevo] = useState({ nombre: "", numero: "" });
  const [editando, setEditando] = useState<number | null>(null);
  const [errorContacto, setErrorContacto] = useState("");
  const [borrando, setBorrando] = useState<ContactoEmergencia | null>(null);
  const validacionNumero = validarNumero(nuevo.numero, contactos, editando);
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
      num_emergencia: normalizarTelefono(nuevo.numero),
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
    if (validacionNumero?.texto === NUMERO_DUPLICADO) return rechazar(NUMERO_DUPLICADO);
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

  /** CA-04.1: el único contacto no se borra (aviso inmediato); los demás piden confirmación. */
  function pedirBorrado(contacto: ContactoEmergencia) {
    if (contactos.length <= 1) {
      setErrorContacto(UNICO_CONTACTO);
      avisar("error", UNICO_CONTACTO);
      return;
    }
    setBorrando(contacto);
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
        {correo !== null && (
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
        )}

        {/* Nombre y teléfono no se muestran: la tabla usuario no tiene esas columnas. */}
        {(!onCambiarPassword || (variante === "usuario" && !conDatos)) && (
          <Pendiente>
            {[
              !onCambiarPassword && "cambio de contraseña",
              variante === "usuario" && !conDatos &&
                "finalidad, contactos, mensaje y ficha médica",
            ]
              .filter(Boolean)
              .join(", ")}{" "}
            aún no se guardan
          </Pendiente>
        )}

        {/* Administradores y trabajadores no usan PIN ni datos de emergencia. */}
        {variante !== "usuario" ? null : carga.cargando ? (
          <p className="wf-muted">Cargando…</p>
        ) : carga.error ? (
          <p className="wf-message wf-message--error">
            Error al cargar la información: {carga.error}
          </p>
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
                          onClick={() => pedirBorrado(c)}
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
                  className={claseCampo(validacionNumero)}
                  value={nuevo.numero}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, numero: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="wf-button wf-button--secondary"
                  // CA-03.1: un número inválido o repetido bloquea el guardado.
                  disabled={
                    (editando === null && contactos.length >= MAX_CONTACTOS) ||
                    validacionNumero?.ok === false
                  }
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
              <Ayuda v={validacionNumero} />
              {errorContacto && (
                <p className="wf-message wf-message--error">{errorContacto}</p>
              )}
            </fieldset>

            <label>
              {/* Un solo hijo: el label es flex en columna. CA-05.1: el contador cambia a rojo en el límite. */}
              <span>
                Mensaje personalizado (
                <span
                  className={mensaje.length >= MAX_MENSAJE ? "wf-ayuda--error" : undefined}
                  aria-live="polite"
                >
                  {mensaje.length}/{MAX_MENSAJE}
                </span>
                )
              </span>
              <textarea
                rows={3}
                disabled={accesoParcial}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                maxLength={MAX_MENSAJE}
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

      {onCambiarPassword && correo !== null && (
        <CambioPassword bloqueado={accesoParcial} onCambiar={onCambiarPassword} />
      )}

      {borrando && (
        <ConfirmDialog
          title={`Eliminar a "${borrando.nombre_contacto}"`}
          message={`¿Está seguro que desea eliminar a "${borrando.nombre_contacto}" (${borrando.num_emergencia}) de sus contactos de emergencia? Dejará de recibir sus alertas.`}
          onCancel={() => setBorrando(null)}
          onConfirm={() => {
            const id = borrando.contacto_emergencia_ID;
            setBorrando(null);
            void borrarContacto(id);
          }}
        />
      )}

      {/* Fuera del <form>: PinDialog tiene su propio formulario y no se pueden anidar. */}
      {modal === "autorizacion" && (
        <PinDialog
          title="Autorización de la cuenta principal"
          info="Para modificar esta cuenta se necesita el PIN de la cuenta principal."
          confirmar={false}
          onClose={() => setModal(null)}
          onSubmit={async (pin) => {
            // HU-10: el backend verifica el PIN del principal; el error (incorrecto o bloqueo) queda en el diálogo.
            await onGuardar(usuario.trim(), email.trim(), pin);
            const texto = "Nombre de usuario y correo actualizados con la autorización de la cuenta principal.";
            setEstado({ ok: true, texto });
            avisar("exito", texto);
            setModal(null);
          }}
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
