import { DataTable, type Column } from "./wireframe";

export interface VentaAdmin {
  venta_id: number;
  usuario_id: number | null;
  nombre_usuario: string | null;
  correo_usuario: string | null;
  fecha_venta: string;
  estado_pago_id: number;
  estado: string;
  metodo_pago: string;
  total_venta: number;
  monto_cobrado: string | null;
  moneda_cobrada: string | null;
  detalles: {
    detalle_venta_id: number;
    plan_id: number;
    nombre_plan: string;
    tipo_compra: "PLAN" | "CUPOS";
    cantidad: number;
    cupos_otorgados: number;
    precio_uni: number;
  }[];
}

export interface PaginaVentas {
  ventas: VentaAdmin[];
  total: number;
  total_pagado_clp: number;
}

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});
const fecha = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Santiago",
});
const columnas: Column<VentaAdmin>[] = [
  { header: "Número de boleta", render: (v) => `#${v.venta_id}` },
  {
    header: "Fecha (Chile)",
    render: (v) => fecha.format(new Date(v.fecha_venta)),
  },
  { header: "Usuario", render: (v) => v.nombre_usuario ?? "Cuenta eliminada" },
  { header: "Correo", render: (v) => v.correo_usuario ?? "—" },
  {
    header: "Detalle de compra",
    render: (v) =>
      v.detalles
        .map(
          (d) =>
            `${d.tipo_compra === "CUPOS" ? "Cupos adicionales" : "Plan Premium"}: ${d.cantidad} × ${clp.format(d.precio_uni)}`,
        )
        .join("; ") || "Sin detalle registrado",
  },
  { header: "Total (CLP)", render: (v) => clp.format(v.total_venta) },
  { header: "Método de pago", render: (v) => v.metodo_pago },
  { header: "Estado", render: (v) => v.estado },
];

export function VentasTabla({
  ventas,
  empty,
}: {
  ventas: VentaAdmin[];
  empty: string;
}) {
  return (
    <DataTable
      columns={columnas}
      rows={ventas}
      rowKey={(v) => v.venta_id}
      empty={empty}
    />
  );
}
