import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('bitacora_sistema') // Nombre exacto de la tabla en PostgreSQL
export class BitacoraSistema {
  @PrimaryColumn({ name: 'bitacora_sistema_id' })
  bitacora_sistema_ID: number;

  @Column({ name: 'accion_realizada', length: 150 })
  accion_realizada: string;

  @Column({ name: 'fecha_accion', type: 'timestamp' })
  fecha_accion: Date;

  @Column({ name: 'usuario_id' })
  usuario_ID: number;

  @Column({ name: 'aplicacion_id' })
  aplicacion_ID: number;
}