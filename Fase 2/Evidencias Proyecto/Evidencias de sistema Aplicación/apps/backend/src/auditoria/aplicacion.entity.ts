import { Entity, Column, PrimaryColumn } from 'typeorm';


@Entity('aplicacion')
export class Aplicacion {
  @PrimaryColumn({ name: 'aplicacion_id' })
  aplicacion_ID: number;

  @Column({ name: 'origen_aplicacion', length: 50 })
  origen_aplicacion: string;
}


export const APLICACION = {
  WEB: 1,
  MOVIL: 2,
  ESCRITORIO: 3,
} as const;
