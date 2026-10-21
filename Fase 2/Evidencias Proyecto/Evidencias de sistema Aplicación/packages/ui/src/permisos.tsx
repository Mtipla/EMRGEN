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

export type Accion =
  | "perfil.editar"
  | "perfil.pinTrabajador"
  | "cuentas.apadrinadas"
  | "compras.comprar"
  | "soporte.solicitar"
  | "soporte.gestionarTickets"
  | "alertas.verTodas"
  | "admin.cuentas.ver"
  | "admin.cuentas.editar"
  | "admin.cuentas.eliminar"
  | "admin.compras.ver"
  | "admin.compras.editar"
  | "admin.compras.eliminar"
  | "admin.trabajadores";

const TODOS: Perfil[] = ["USUARIO", "APADRINADO", "SOPORTE", "ADMINISTRADOR"];
const PERSONAL: Perfil[] = ["SOPORTE", "ADMINISTRADOR"];

/** Quién puede cada acción en la UI y de dónde sale. */
export const PERMISOS: Record<Accion, { perfiles: Perfil[]; fuente: string }> =
  {
    // PATCH /usuarios/me: 403 con acceso parcial (LoginService.actualizarPropio).
    "perfil.editar": {
      perfiles: TODOS,
      fuente: "PATCH /usuarios/me (solo acceso completo)",
    },
    "perfil.pinTrabajador": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "mockup web págs. 32-33 (sin endpoint)",
    },
    // ComprasService.titular: solo principal con acceso completo y plan.
    "cuentas.apadrinadas": {
      perfiles: ["USUARIO"],
      fuente: "GET /compras/apadrinados",
    },
    "compras.comprar": {
      perfiles: ["USUARIO"],
      fuente: "POST /compras/apadrinados/ordenes",
    },
    "soporte.solicitar": {
      perfiles: TODOS,
      fuente: "POST /internal/v1/tickets-soporte",
    },
    "soporte.gestionarTickets": {
      perfiles: PERSONAL,
      fuente: "PATCH /internal/v1/tickets-soporte (solo_staff)",
    },
    "alertas.verTodas": {
      perfiles: PERSONAL,
      fuente: "GET /internal/v1/alertas (es_staff)",
    },
    // Mockup "Trabajador": buscar, añadir, modificar, descargar; eliminar con PIN de trabajador.
    // El backend aún limita /admin/* a ADMINISTRADOR: SOPORTE recibe 403 (BACKEND_SOPORTE).
    "admin.cuentas.ver": {
      perfiles: PERSONAL,
      fuente: "mockup págs. 13-18; GET /admin/usuarios",
    },
    "admin.cuentas.editar": {
      perfiles: PERSONAL,
      fuente: "mockup págs. 13, 17; PATCH /admin/usuarios/:id",
    },
    "admin.cuentas.eliminar": {
      perfiles: PERSONAL,
      fuente: "mockup págs. 14-15; DELETE /admin/usuarios/apadrinado/:id",
    },
    "admin.compras.ver": {
      perfiles: PERSONAL,
      fuente: "mockup págs. 19-23 (sin endpoint: MOCK)",
    },
    "admin.compras.editar": {
      perfiles: PERSONAL,
      fuente: "mockup pág. 20 (sin endpoint)",
    },
    "admin.compras.eliminar": {
      perfiles: PERSONAL,
      fuente: "mockup págs. 21-22 (sin endpoint)",
    },
    "admin.trabajadores": {
      perfiles: ["ADMINISTRADOR"],
      fuente: "mockup págs. 47-51; POST /admin/usuarios/soporte",
    },
  };

export function puede(perfil: Perfil | null, accion: Accion): boolean {
  return perfil !== null && PERMISOS[accion].perfiles.includes(perfil);
}

/** Mockup págs. 15 y 22: SOPORTE pide el "PIN de trabajador del administrador" antes de eliminar. */
export const requierePinTrabajador = (perfil: Perfil | null) =>
  perfil === "SOPORTE";

export const ETIQUETA_PERFIL: Record<Perfil, string> = {
  USUARIO: "Usuario principal",
  APADRINADO: "Usuario apadrinado",
  SOPORTE: "Soporte (Trabajador)",
  ADMINISTRADOR: "Administrador",
};

/** Aviso para SOPORTE en rutas que la UI permite pero el backend todavía no. */
export const BACKEND_SOPORTE =
  "PENDIENTE PERMISO BACKEND PARA SOPORTE: /admin/* aún solo admite ADMINISTRADOR, por lo que estas acciones responderán 403";
