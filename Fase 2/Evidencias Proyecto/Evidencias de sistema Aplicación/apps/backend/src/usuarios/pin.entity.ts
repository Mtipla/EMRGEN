import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pin')
export class Pin {
  @PrimaryGeneratedColumn({ name: 'pin_id' })
  PIN_ID: number;

  @Column({ name: 'pin', length: 4 })
  PIN: string;
}
