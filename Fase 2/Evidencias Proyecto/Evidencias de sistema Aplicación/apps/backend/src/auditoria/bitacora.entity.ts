import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export const TIPO_ACCION = {
  CONSULTA: 'CONSULTA',
  CREACION: 'CREACION',
  MODIFICACION: 'MODIFICACION',
  ELIMINACION: 'ELIMINACION',
  EXPORTACION: 'EXPORTACION',
} as const;

export type TipoAccion = (typeof TIPO_ACCION)[keyof typeof TIPO_ACCION];


export const ENTIDAD_AUDITADA = {
  USUARIO: 'USUARIO',
  PLAN_USUARIO: 'PLAN_USUARIO',
  BITACORA_SISTEMA: 'BITACORA_SISTEMA',
} as const;

export type EntidadAuditada = (typeof ENTIDAD_AUDITADA)[keyof typeof ENTIDAD_AUDITADA];


export const RESULTADO_ACCION = {
  EXITOSA: 'EXITOSA',
  FALLIDA: 'FALLIDA',
} as const;
export type ResultadoAccion = (typeof RESULTADO_ACCION)[keyof typeof RESULTADO_ACCION];

export type ValorAuditado = string | number | boolean | null;


export type CambiosAuditoria = Record<string, { antes: ValorAuditado; despues: ValorAuditado }>;

@Entity('bitacora_sistema') 
export class BitacoraSistema {
  @PrimaryGeneratedColumn({ name: 'bitacora_sistema_id' })
  bitacora_sistema_ID: number;

  @Column({ name: 'accion_realizada', type: 'text' })
  accion_realizada: string;

  @Column({ name: 'fecha_accion', type: 'timestamptz' })
  fecha_accion: Date;


  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuario_ID: number | null;

  @Column({ name: 'aplicacion_id' })
  aplicacion_ID: number;


  @Column({ name: 'rol_actor_id', type: 'int', nullable: true })
  rol_actor_ID: number | null;


  @Column({ name: 'usuario_afectado_id', type: 'int', nullable: true })
  usuario_afectado_ID: number | null;

  @Column({ name: 'tipo_accion', type: 'varchar', length: 20, nullable: true })
  tipo_accion: TipoAccion | null;

  @Column({ name: 'entidad_afectada', type: 'varchar', length: 30, nullable: true })
  entidad_afectada: EntidadAuditada | null;

  @Column({ name: 'resultado', type: 'varchar', length: 10 })
  resultado: ResultadoAccion;

  @Column({ name: 'cambios', type: 'jsonb', nullable: true })
  cambios: CambiosAuditoria | null;
}
