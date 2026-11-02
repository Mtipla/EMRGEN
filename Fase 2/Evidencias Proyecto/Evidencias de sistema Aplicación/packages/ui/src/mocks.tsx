/**
 * MOCK TEMPORAL de los wireframes: datos de ejemplo para pantallas que aún no tienen
 * endpoint en el backend. Nunca se mezclan con respuestas reales; cada vista que los usa
 * lo indica con <Pendiente />. Reemplazar por la llamada HTTP cuando exista el endpoint.
 * (Extensión .tsx porque el mapa `exports` de @repo/ui solo expone ./src/*.tsx.)
 */

export interface CuentaApadrinada {
  numero: number;
  pinPrimerIngreso: string | null;
  usadaPor: string | null;
  accesoCompleto: boolean;
}

export interface CompraAdmin {
  cuentaId: string;
  nombreUsuario: string;
  cuentasApadrinadas: number;
  apadrinadoId: string;
  valor: number;
  boleta: string;
  estado: (typeof ESTADOS_PAGO)[number];
}

export interface CuentaVinculada {
  nombre: string;
  informacion: string;
}

export const MOCK_CUENTAS_APADRINADAS: CuentaApadrinada[] = [
  {
    numero: 1,
    pinPrimerIngreso: "8759",
    usadaPor: "Usuario Apadrinado 123",
    accesoCompleto: true,
  },
  { numero: 2, pinPrimerIngreso: null, usadaPor: null, accesoCompleto: false },
  {
    numero: 3,
    pinPrimerIngreso: "8879",
    usadaPor: "Usuario No Acceso Completo",
    accesoCompleto: false,
  },
];

export const MOCK_COMPRAS: CompraAdmin[] = [
  {
    cuentaId: "1P",
    nombreUsuario: "andres455",
    cuentasApadrinadas: 5,
    apadrinadoId: "1P",
    valor: 5000,
    boleta: "789314",
    estado: "PAGADO",
  },
  {
    cuentaId: "1P",
    nombreUsuario: "andres455",
    cuentasApadrinadas: 5,
    apadrinadoId: "1",
    valor: 1000,
    boleta: "574123",
    estado: "PAGADO",
  },
  {
    cuentaId: "1P",
    nombreUsuario: "andres455",
    cuentasApadrinadas: 5,
    apadrinadoId: "2",
    valor: 1000,
    boleta: "582147",
    estado: "PAGADO",
  },
  {
    cuentaId: "2P",
    nombreUsuario: "maria_r",
    cuentasApadrinadas: 1,
    apadrinadoId: "2P",
    valor: 5000,
    boleta: "798113",
    estado: "RECHAZADO",
  },
];

export const MOCK_CUENTAS_VINCULADAS: CuentaVinculada[] = [
  { nombre: "Nombre de usuario 1", informacion: "Información de usuario 1" },
  { nombre: "Nombre de usuario 2", informacion: "Información de usuario 2" },
  { nombre: "Nombre de usuario 3", informacion: "Información de usuario 3" },
];


export const PRIORIDADES = [
  { id: 1, nombre: "MEDICO" },
  { id: 2, nombre: "URBANO" },
  { id: 3, nombre: "EMERGENCIA" },
  { id: 4, nombre: "ADULTO MAYOR" },
] as const;


export const ESTADOS_PAGO = [
  "PENDIENTE",
  "PAGADO",
  "RECHAZADO",
  "CANCELADO",
  "REVISION",
] as const;


export const MAX_CONTACTOS = 5;
export const NUMERO_E164 = /^[+][1-9][0-9]{1,14}$/;


export const NUMEROS_EMERGENCIA = [
  { numero: "131", servicio: "Ambulancia (SAMU)" },
  { numero: "132", servicio: "Bomberos" },
  { numero: "133", servicio: "Carabineros" },
] as const;
