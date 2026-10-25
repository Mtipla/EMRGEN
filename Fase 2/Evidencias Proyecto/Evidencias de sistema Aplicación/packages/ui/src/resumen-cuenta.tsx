import {
  ETIQUETA_PERFIL,
  FUNCIONES_BASICAS,
  MENSAJE_BLOQUEO,
  accesoCompleto,
  bloqueo,
  perfilDe,
  type UsuarioConRol,
} from "./permisos";

const siNo = (valor: boolean | undefined) =>
  valor === undefined ? "Sin información" : valor ? "Sí" : "No";

/** Tipo de cuenta y funciones básicas disponibles/bloqueadas según la matriz de permisos (web y móvil). */
export const ResumenCuenta = ({ user }: { user: UsuarioConRol }) => {
  const perfil = perfilDe(user);

  return (
    <section className="wf-card">
      <h2>Caracteristicas de tu cuenta</h2>
      <p>
        Tipo: {perfil ? ETIQUETA_PERFIL[perfil] : "Sin información"}
        {" · "}Acceso:{" "}
        {user.estado_ID === undefined
          ? "Sin información"
          : accesoCompleto(user)
            ? "completo"
            : "parcial"}
        {" · "}Premium: {siNo(user.plan_efectivo)}
      </p>
      <ul>
        {FUNCIONES_BASICAS.map(({ accion, etiqueta }) => {
          const motivo = bloqueo(user, accion);
          return (
            <li key={accion}>
              {etiqueta}:{" "}
              {motivo ? (
                <span className="wf-muted">{MENSAJE_BLOQUEO[motivo]}</span>
              ) : (
                "Disponible"
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
