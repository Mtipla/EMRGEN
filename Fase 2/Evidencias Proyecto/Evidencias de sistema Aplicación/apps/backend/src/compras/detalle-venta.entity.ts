import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('detalle_venta')
export class DetalleVenta {
  @PrimaryGeneratedColumn({ name: 'detalle_venta_id' })
  detalle_venta_ID: number;

  @Column({ name: 'venta_id' })
  venta_ID: number;

  /** FK a PLAN.plan_ID (el nombre de la columna viene del modelo de datos). */
  @Column({ name: 'suscripcion_id' })
  plan_ID: number;

  /** Cantidad de cuentas apadrinadas compradas en esta línea. */
  @Column({ name: 'max_apadrinados' })
  cantidad: number;

  @Column({ name: 'precio_uni' })
  precio_uni: number;
}
