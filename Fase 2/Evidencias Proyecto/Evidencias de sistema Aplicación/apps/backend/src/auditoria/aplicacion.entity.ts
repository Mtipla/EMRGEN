import { Entity, Column, PrimaryColumn } from 'typeorm';

/** Catálogo APLICACION (sembrado en init.sql): origen de cada acción de la bitácora. */
@Entity('aplicacion')
export class Aplicacion {
  @PrimaryColumn({ name: 'aplicacion_id' })
  aplicacion_ID: number;

  @Column({ name: 'origen_aplicacion', length: 50 })
  origen_aplicacion: string;
}

/** IDs fijos de APLICACION (sembrados en init.sql). */
export const APLICACION = {
  WEB: 1,
  MOVIL: 2,
  ESCRITORIO: 3,
} as const;
