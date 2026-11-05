import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


@Entity('venta')
export class Venta {
  @PrimaryGeneratedColumn({ name: 'venta_id' })
  venta_ID: number;

  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuario_ID: number | null;

  @Column({ name: 'metodo_pago_id' })
  metodo_pago_ID: number;

  @Column({ name: 'estado_pago_id' })
  estado_pago_ID: number;

  @Column({ name: 'total_venta' })
  total_venta: number;

  @Column({ name: 'fecha_venta', type: 'timestamptz' })
  fecha_venta: Date;

  @Column({ name: 'orden_paypal_id', type: 'varchar', length: 36, nullable: true })
  orden_paypal_ID: string | null;

  @Column({ name: 'captura_paypal_id', type: 'varchar', length: 36, nullable: true })
  captura_paypal_ID: string | null;


  @Column({ name: 'monto_cobrado', type: 'numeric', precision: 10, scale: 2, nullable: true })
  monto_cobrado: string | null;

  @Column({ name: 'moneda_cobrada', type: 'char', length: 3, nullable: true })
  moneda_cobrada: string | null;
}
