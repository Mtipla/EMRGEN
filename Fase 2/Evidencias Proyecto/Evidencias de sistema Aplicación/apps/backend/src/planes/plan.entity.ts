import { Entity, Column, PrimaryColumn } from 'typeorm';

/** Producto a la venta. Solo lectura desde el backend: el precio se administra en la BD. */
@Entity('plan')
export class Plan {
  @PrimaryColumn({ name: 'plan_id' })
  plan_ID: number;

  @Column({ name: 'nombre_plan', length: 50 })
  nombre_plan: string;

  /** Precio unitario en CLP. */
  @Column({ name: 'precio_actual' })
  precio_actual: number;

  /** Máximo de unidades por compra. */
  @Column({ name: 'limite_compra_max' })
  limite_compra_max: number;
}
