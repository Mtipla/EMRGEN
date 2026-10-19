import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/** Una compra. `venta_ID` es el número de boleta que ve el usuario. */
@Entity('venta')
export class Venta {
  @PrimaryGeneratedColumn({ name: 'venta_id' })
  venta_ID: number;

  @Column({ name: 'id_usuario' })
  usuario_ID: number;

  @Column({ name: 'metodo_pago_id' })
  metodo_pago_ID: number;

  @Column({ name: 'estado_pago_id' })
  estado_pago_ID: number;

  /** Total en CLP según PLAN.precio_actual. */
  @Column({ name: 'total_venta' })
  total_venta: number;

  @Column({ name: 'fecha_venta', type: 'timestamp' })
  fecha_venta: Date;

  @Column({ name: 'orden_paypal_id', type: 'varchar', length: 36, nullable: true })
  orden_paypal_ID: string | null;

  @Column({ name: 'captura_paypal_id', type: 'varchar', length: 36, nullable: true })
  captura_paypal_ID: string | null;

  /** Monto enviado a PayPal (NUMERIC: TypeORM lo entrega como string, ej. "1.06"). */
  @Column({ name: 'monto_cobrado', type: 'numeric', precision: 10, scale: 2, nullable: true })
  monto_cobrado: string | null;

  @Column({ name: 'moneda_cobrada', type: 'char', length: 3, nullable: true })
  moneda_cobrada: string | null;
}
