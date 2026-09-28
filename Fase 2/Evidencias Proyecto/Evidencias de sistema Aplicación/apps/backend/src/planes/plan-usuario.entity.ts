import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('plan_usuario')
export class PlanUsuario {
  @PrimaryColumn({ name: 'plan_usuario_id' })
  plan_usuario_ID: number;

  @Column({ name: 'tiene_acceso_completo' })
  tiene_acceso_completo: boolean;

  @Column({ name: 'cupos_apadrinados_adq' })
  cupos_apadrinados_adq: number;

  @Column({ name: 'cupos_apadrinados_utili' })
  cupos_apadrinados_utili: number;

  @Column({ name: 'usuario_id' })
  usuario_ID: number;
}