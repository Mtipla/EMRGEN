import { useEffect, useState, type FormEvent } from "react";
import type { UsuarioAdminFila } from "./admin-views";
import { DataTable } from "./wireframe";

export interface PlanUsuarioAdmin {
  plan_ID: number;
  cupos_apadrinados_adq: number;
  cupos_ocupados: number;
  cupos_disponibles: number;
}
export interface ApiPlanes {
  listar: () => Promise<UsuarioAdminFila[]>;
  planes: () => Promise<{ plan_ID: number; nombre_plan: string }[]>;
  consultar: (
    id: number,
    signal: AbortSignal,
  ) => Promise<{ plan: PlanUsuarioAdmin | null }>;
  guardar: (
    id: number,
    datos: { plan_ID: number; cupos_apadrinados_adq: number },
  ) => Promise<PlanUsuarioAdmin>;
}
export function AdminPlanes({ api }: { api: ApiPlanes }) {
  const [usuarios, setUsuarios] = useState<UsuarioAdminFila[]>([]);
  const [planes, setPlanes] = useState<
    { plan_ID: number; nombre_plan: string }[]
  >([]);
  const [id, setId] = useState<number | null>(null);
  const [plan, setPlan] = useState("");
  const [cupos, setCupos] = useState(0);
  const [ocupados, setOcupados] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [cargandoPlan, setCargandoPlan] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorLista, setErrorLista] = useState("");
  const [errorPlan, setErrorPlan] = useState("");
  const error = errorLista || errorPlan;
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let activo = true;
    Promise.all([api.listar(), api.planes()]).then(
      ([cuentas, catalogo]) => {
        if (!activo) return;
        setUsuarios(cuentas.filter((u) => !u.usuario_principal_ID));
        setPlanes(catalogo);
        setCargando(false);
        setErrorLista("");
      },
      (causa: Error) => {
        if (activo) {
          setErrorLista(causa.message);
          setCargando(false);
        }
      },
    );
    return () => {
      activo = false;
    };
  }, [api, version]);
  useEffect(() => {
    if (id === null) return;
    const peticion = new AbortController();
    api.consultar(id, peticion.signal).then(
      ({ plan: actual }) => {
        if (peticion.signal.aborted) return;
        setPlan(String(actual?.plan_ID ?? ""));
        setCupos(actual?.cupos_apadrinados_adq ?? 0);
        setOcupados(actual?.cupos_ocupados ?? 0);
        setCargandoPlan(false);
        setErrorPlan("");
      },
      (causa: Error) => {
        if (peticion.signal.aborted) return;
        setErrorPlan(causa.message);
        setCargandoPlan(false);
      },
    );
    return () => peticion.abort();
  }, [api, id, version]);
  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!id || !plan || guardando || cargandoPlan || error) return;
    setGuardando(true);
    setMensaje("");
    try {
      const actual = await api.guardar(id, {
        plan_ID: Number(plan),
        cupos_apadrinados_adq: cupos,
      });
      setOcupados(actual.cupos_ocupados);
      setCupos(actual.cupos_apadrinados_adq);
      setMensaje("Plan y cupos guardados.");
    } catch (causa) {
      setMensaje(
        causa instanceof Error ? causa.message : "No se pudo guardar.",
      );
    } finally {
      setGuardando(false);
    }
  }
  return (
    <section className="wf-card" id="pruebas-usuarios">
      <h2>Gestión de planes y cupos de usuario</h2>
      <p className="wf-muted">
        Selecciona una cuenta principal para asignar su plan y sus cupos de
        apadrinados.
      </p>
      <button
        type="button"
        className="wf-button wf-button--secondary"
        disabled={guardando || cargandoPlan}
        onClick={() => {
          setCargando(true);
          setErrorLista("");
          setErrorPlan("");
          if (id) setCargandoPlan(true);
          setVersion((v) => v + 1);
        }}
      >
        Actualizar listado
      </button>
      {cargando && <p role="status">Cargando cuentas…</p>}
      {error && <p role="alert">{error}</p>}
      <DataTable
        columns={[
          { header: "ID cuenta", render: (u) => u.usuario_ID },
          { header: "Nombre usuario", render: (u) => u.nombre_usuario },
          { header: "Correo", render: (u) => u.correo_usuario },
        ]}
        rows={usuarios}
        rowKey={(u) => u.usuario_ID}
        searchText={(u) =>
          `${u.usuario_ID} ${u.nombre_usuario} ${u.correo_usuario}`
        }
        selectedKey={id ?? undefined}
        onSelect={(u) => {
          if (guardando) return;
          if (id === u.usuario_ID) return;
          setId(u.usuario_ID);
          setCargandoPlan(true);
          setPlan("");
          setErrorPlan("");
          setMensaje("");
        }}
      />
      {id !== null && (
        <form className="wf-card wf-form" onSubmit={guardar}>
          <h3>Plan y cupos de la cuenta {id}</h3>
          {cargandoPlan && <p role="status">Cargando plan…</p>}
          <fieldset
            className="wf-form"
            disabled={cargandoPlan || guardando || Boolean(error)}
          >
            <label>
              Plan vigente
              <select
                value={plan}
                required
                onChange={(e) => setPlan(e.target.value)}
              >
                <option value="">Selecciona un plan</option>
                {planes.map((p) => (
                  <option key={p.plan_ID} value={p.plan_ID}>
                    {p.nombre_plan}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cupos de apadrinados (0-5)
              <input
                type="number"
                min={ocupados}
                max={5}
                required
                value={cupos}
                onChange={(e) => setCupos(Number(e.target.value))}
              />
            </label>
            <p>
              Cupos ocupados: {ocupados}. Cupos disponibles:{" "}
              {Math.max(0, cupos - ocupados)}.
            </p>
            <button type="submit" className="wf-button" disabled={!plan}>
              Guardar plan y cupos
            </button>
          </fieldset>
          {mensaje && <p role="status">{mensaje}</p>}
        </form>
      )}
    </section>
  );
}
