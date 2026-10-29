/**
 * Matriz de permisos de la UI (web, escritorio y móvil). Solo decide navegación y botones:
 * la autoridad es el backend (RolesGuard en NestJS, `solo_staff` en internal-api).
 * Fuentes: init.sql (ROL 1 ADMINISTRADOR, 2 SOPORTE, 3 USUARIO; ESTADO_USUARIO 1 completo,
 * 2 parcial), ERS RF3/RF25 y decisión del equipo (2026-10-21): todo lo que documentos y mockups
 * atribuyen a "Trabajador" corresponde al rol SOPORTE ("web y escritorio.pdf", págs. 10-23).
 * (Extensión .tsx porque el mapa `exports` de @repo/ui solo expone ./src/*.tsx.)
 */

export const ROL = { ADMINISTRADOR: 1, SOPORTE: 2, USUARIO: 3 } as const;
export const ACCESO = { COMPLETO: 1, PARCIAL: 2 } as const;

export type Perfil = "USUARIO" | "APADRINADO" | "SOPORTE" | "ADMINISTRADOR";

export interface UsuarioConRol {
  rol_ID?: number;
  estado_ID?: number;
  usuario_principal_ID?: number | null;
  /** Premium: plan propio o del principal (login y GET /usuarios/me). */
  plan_efectivo?: boolean;
}

/** null si la sesión aún no trae el rol (respuesta antigua del backend). */
export function perfilDe(u: UsuarioConRol): Perfil | null {
  if (u.rol_ID === ROL.ADMINISTRADOR) return "ADMINISTRADOR";
  if (u.rol_ID === ROL.SOPORTE) return "SOPORTE";
  if (u.rol_ID === ROL.USUARIO)
    return u.usuario_principal_ID ? "APADRINADO" : "USUARIO";
  return null;
}

export const accesoCompleto = (u: UsuarioConRol) =>
  u.estado_ID === ACCESO.COMPLETO;

/** Solo si la sesión lo informa: sesiones antiguas sin el dato no se bloquean (decide el backend). */
export const sinPremium = (u: UsuarioConRol) => u.plan_efectivo === false;
const accesoParcial = (u: UsuarioConRol) =>
  u.estado_ID !== undefined && !accesoCompleto(u);

export type Accion =
  | "perfil.editar"
  | "perfil.pinTrabajador"
  | "cuentas.apadrinadas"
  | "cuentas.informe"
  | "compras.comprar"
  | "compras.cupos"
  | "soporte.solicitar"
  | "soporte.gestionarTickets"
  | "soporte.mensajesContacto"
  | "alertas.verTodas"
  | "alertas.emitir"
  | "admin.cuentas.ver"
  | "admin.cuentas.editar"
  | "admin.cuentas.eliminar"
  | "admin.compras.ver"
  | "admin.compras.editar"
  | "admin.compras.eliminar"
  | "admin.planes"
  | "admin.trabajadores";

const TODOS: Perfil[] = ["USUARIO", "APADRINADO", "SOPORTE", "ADMINISTRADOR"];
const PERSONAL: Perfil[] = ["SOPORTE", "ADMINISTRADOR"];

/**
 * Quién puede cada acción en la UI y de dónde sale.
 * `premium`: el backend exige plan efectivo; `soloCompleto`: el backend rechaza el acceso parcial.
 */
export const PERMISOS: Record<
  Accion,
  { perfiles: Perfil[]; fuente: string; premium?: true; soloCompleto?: true }
> = {
    // PATCH /usuarios/me: 403 con acceso parcial (LoginService.actualizarPropio).
    "perfil.editar": {
      perfiles: TODOS,
      fuente: "PATCH /usuarios/me (solo acceso completo)",
      soloCompleto: true,
    },
    "perfil.pinTrabajador": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "PATCH /usuarios/me (PIN propio, solo ADMINISTRADOR)",
    },
    // ComprasService.titular: solo principal con acceso completo y plan.
    "cuentas.apadrinadas": {
      perfiles: ["USUARIO"],
      fuente: "GET /compras/apadrinados (409 sin plan base)",
      premium: true,
    },
    "cuentas.informe": {
      perfiles: ["USUARIO", "APADRINADO"],
      fuente: "GET /usuarios/me/informe (cuenta propia y apadrinados del principal)",
    },
    "compras.comprar": {
      perfiles: ["USUARIO"],
      fuente: "Enlace a /premium para conocer y comprar Premium",
    },
    "compras.cupos": {
      perfiles: ["USUARIO"],
      fuente: "POST /compras/apadrinados/ordenes",
      premium: true,
    },
    "soporte.solicitar": {
      perfiles: ["USUARIO", "APADRINADO", "ADMINISTRADOR"],
      fuente: "POST /internal/v1/tickets-soporte",
    },
    "soporte.gestionarTickets": {
      perfiles: PERSONAL,
      fuente: "PATCH /internal/v1/tickets-soporte (solo_staff)",
      soloCompleto: true,
    },
    "soporte.mensajesContacto": {
      perfiles: PERSONAL,
      fuente: "GET/PATCH /internal/v1/mensajes-contacto (solo_staff)",
      soloCompleto: true,
    },
    "alertas.verTodas": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "GET /internal/v1/alertas (es_staff)",
    },
    // El parcial puede emitir, pero solo con el mensaje configurado (403 si envía otro).
    "alertas.emitir": {
      perfiles: TODOS,
      fuente: "POST /internal/v1/alertas (409 sin plan del principal)",
      premium: true,
    },
    // SOPORTE solo consulta cuentas y compras; las escrituras son exclusivas del administrador.
    "admin.cuentas.ver": {
      perfiles: PERSONAL,
      fuente: "mockup págs. 13-18; GET /admin/usuarios",
      soloCompleto: true,
    },
    "admin.cuentas.editar": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "mockup págs. 13, 17; PATCH /admin/usuarios/:id",
    },
    "admin.cuentas.eliminar": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "mockup págs. 14-15; DELETE /admin/usuarios/apadrinado/:id",
    },
    "admin.compras.ver": {
      perfiles: PERSONAL,
      fuente: "GET /admin/ventas",
      soloCompleto: true,
    },
    "admin.compras.editar": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "mockup pág. 20 (sin endpoint)",
    },
    "admin.compras.eliminar": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "mockup págs. 21-22 (sin endpoint)",
    },
    "admin.trabajadores": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "mockup págs. 47-51; POST /admin/usuarios/soporte",
    },
    "admin.planes": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "PUT /admin/usuarios/:id/plan",
      soloCompleto: true,
    },
  };

export function puede(perfil: Perfil | null, accion: Accion): boolean {
  return perfil !== null && PERMISOS[accion].perfiles.includes(perfil);
}

export type Bloqueo = "permiso" | "parcial" | "premium";

/** Motivo por el que la UI bloquea la acción a este usuario, o null si está disponible. */
export function bloqueo(u: UsuarioConRol, accion: Accion): Bloqueo | null {
  const regla = PERMISOS[accion];
  if (!puede(perfilDe(u), accion)) return "permiso";
  if (regla.soloCompleto && accesoParcial(u)) return "parcial";
  if (regla.premium && sinPremium(u)) return "premium";
  return null;
}

/**
 * Entrada de menú o botón visible: se oculta sin permiso o sin Premium. Con acceso parcial se
 * muestra igual, porque la página abre en solo lectura y explica el bloqueo.
 */
export function visible(u: UsuarioConRol, accion: Accion): boolean {
  const motivo = bloqueo(u, accion);
  return motivo === null || motivo === "parcial";
}

export const MENSAJE_BLOQUEO: Record<Bloqueo, string> = {
  permiso: "No tienes permisos para realizar esta acción.",
  parcial:
    "Tu acceso es parcial: esta acción requiere autorización de tu cuenta principal.",
  premium: "Esta funcionalidad requiere Premium.",
};

/** Funciones básicas que comparten usuario principal y apadrinados (resumen de cuenta). */
export const FUNCIONES_BASICAS: { accion: Accion; etiqueta: string }[] = [
  { accion: "perfil.editar", etiqueta: "Modificar perfil" },
  { accion: "soporte.solicitar", etiqueta: "Solicitar soporte" },
  { accion: "alertas.emitir", etiqueta: "Alerta SOS" },
  { accion: "cuentas.apadrinadas", etiqueta: "Administrar cuentas apadrinadas" },
  { accion: "compras.cupos", etiqueta: "Comprar cupos (Premium)" },
];

export const ETIQUETA_PERFIL: Record<Perfil, string> = {
  USUARIO: "Usuario principal",
  APADRINADO: "Usuario apadrinado",
  SOPORTE: "Soporte (Trabajador)",
  ADMINISTRADOR: "Administrador",
};
