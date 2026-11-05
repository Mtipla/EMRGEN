import { useState, type FormEvent } from "react";
import type { UsuarioAdminFila } from "./admin-views";
import { ConfirmDialog, DataTable, PinDialog } from "./wireframe";

export interface CambiosTrabajador {
  correo_usuario?: string;
  PIN?: string;
  rol_ID?: 2 | 3;
}
interface Props {
  trabajadores: UsuarioAdminFila[];
  cargando?: boolean;
  error?: string;
  onCrear: (
    nombre: string,
    correo: string,
    password: string,
  ) => Promise<unknown>;
  onActualizar: (id: number, cambios: CambiosTrabajador) => Promise<unknown>;
  onEliminar: (id: number) => Promise<unknown>;
}

export function AdminTrabajadores({
  trabajadores,
  cargando,
  error,
  onCrear,
  onActualizar,
  onEliminar,
}: Props) {
  const [id, setId] = useState<number | null>(null);
  const seleccionado = trabajadores.find((u) => u.usuario_ID === id);
  const [correoEdicion, setCorreoEdicion] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [modal, setModal] = useState<"pin" | "eliminar" | null>(null);

  async function ejecutar(accion: () => Promise<unknown>, texto: string) {
    if (ocupado) return;
    setOcupado(true);
    setMensaje("");
    try {
      await accion();
      setMensaje(texto);
    } catch (causa) {
      setMensaje(causa instanceof Error ? causa.message : "La acción falló.");
    } finally {
      setOcupado(false);
    }
  }
  function crear(e: FormEvent) {
    e.preventDefault();
    void ejecutar(async () => {
      await onCrear(nombre.trim(), correo.trim(), password);
      setNombre("");
      setCorreo("");
      setPassword("");
    }, "Trabajador creado. Configura su PIN para completar el acceso al panel.");
  }

  return (
    <section className="wf-card">
      <h1>Administrar trabajadores</h1>
      {cargando && <p role="status">Cargando trabajadores…</p>}
      {error && <p role="alert">{error}</p>}
      <DataTable
        columns={[
          { header: "ID trabajador", render: (t) => t.usuario_ID },
          { header: "Nombre de usuario", render: (t) => t.nombre_usuario },
          { header: "Correo trabajador", render: (t) => t.correo_usuario },
          {
            header: "Rol",
            render: (t) => t.rol_ID === 2 ? "SOPORTE" : "USUARIO",
          },
          {
            header: "Habilitado/Inhabilitado",
            render: (t) => t.rol_ID === 2 ? "Habilitado" : "Inhabilitado",
          },
        ]}
        rows={trabajadores}
        rowKey={(t) => t.usuario_ID}
        searchText={(t) =>
          `${t.usuario_ID} ${t.nombre_usuario} ${t.correo_usuario}`
        }
        selectedKey={id ?? undefined}
        onSelect={(t) => {
          if (ocupado) return;
          setId(t.usuario_ID);
          setCorreoEdicion(t.correo_usuario);
          setMensaje("");
        }}
        descarga="trabajadores"
        empty="No hay trabajadores registrados."
      />
      {seleccionado && (
        <form
          className="wf-card wf-form"
          onSubmit={(e) => {
            e.preventDefault();
            void ejecutar(
              () =>
                onActualizar(seleccionado.usuario_ID, {
                  correo_usuario: correoEdicion.trim(),
                }),
              "Correo actualizado.",
            );
          }}
        >
          <h2>
            Trabajador {seleccionado.usuario_ID}: {seleccionado.nombre_usuario}
          </h2>
          <label>
            Correo trabajador
            <input
              type="email"
              required
              maxLength={100}
              value={correoEdicion}
              onChange={(e) => setCorreoEdicion(e.target.value)}
              disabled={ocupado}
            />
          </label>
          <p>Rol: {seleccionado.rol_ID === 2 ? "SOPORTE" : "USUARIO"}</p>
          <div className="wf-actions">
            <button type="submit" className="wf-button" disabled={ocupado}>
              Guardar correo
            </button>
            <button
              type="button"
              className="wf-button wf-button--secondary"
              disabled={ocupado}
              onClick={() => setModal("pin")}
            >
              Modificar PIN
            </button>
            <button
              type="button"
              className="wf-button wf-button--secondary"
              disabled={ocupado}
              onClick={() =>
                void ejecutar(
                  () =>
                    onActualizar(seleccionado.usuario_ID, {
                      rol_ID: seleccionado.rol_ID === 2 ? 3 : 2,
                    }),
                  seleccionado.rol_ID === 2 ? "Cuenta deshabilitada." : "Cuenta habilitada.",
                )
              }
            >
              {seleccionado.rol_ID === 2 ? "Deshabilitar cuenta" : "Habilitar cuenta"}
            </button>
            <button
              type="button"
              className="wf-button wf-button--secondary"
              disabled={ocupado}
              onClick={() => setModal("eliminar")}
            >
              Eliminar trabajador
            </button>
          </div>
        </form>
      )}
      {mensaje && <p role="status">{mensaje}</p>}
      <form className="wf-card wf-form" onSubmit={crear}>
        <h2>Añadir trabajador</h2>
        <label>
          Nombre de usuario
          <input
            required
            minLength={2}
            maxLength={50}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>
        <label>
          Correo trabajador
          <input
            required
            type="email"
            maxLength={100}
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </label>
        <label>
          Contraseña inicial
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" className="wf-button" disabled={ocupado}>
          Añadir trabajador
        </button>
      </form>
      {modal === "pin" && seleccionado && (
        <PinDialog
          title="Modificar PIN del trabajador"
          onClose={() => setModal(null)}
          onSubmit={async (PIN) => {
            await onActualizar(seleccionado.usuario_ID, { PIN });
            setMensaje("PIN actualizado.");
            setModal(null);
          }}
        />
      )}
      {modal === "eliminar" && seleccionado && (
        <ConfirmDialog
          title="Eliminar trabajador"
          message={`¿Estás seguro de eliminar definitivamente a "${seleccionado.nombre_usuario}"? Se eliminará su cuenta.`}
          onCancel={() => setModal(null)}
          onConfirm={() => {
            setModal(null);
            void ejecutar(async () => {
              await onEliminar(seleccionado.usuario_ID);
              setId(null);
            }, "Trabajador eliminado.");
          }}
        />
      )}
    </section>
  );
}
