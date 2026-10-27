import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pin')
export class Pin {
  @PrimaryGeneratedColumn({ name: 'pin_id' })
  PIN_ID: number;

  @Column({ name: 'pin_hash', length: 255 })
  pin_hash: string;

  /** PIN de primer ingreso que la principal define para un apadrinado; se cambia al iniciar sesión. */
  @Column({ name: 'pin_temporal', default: false })
  pin_temporal: boolean;
}
