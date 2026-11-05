import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plan_usuario')
export class PlanUsuario {
  // IDENTITY en init.sql: el ID lo genera PostgreSQL al asignar el plan.
  @PrimaryGeneratedColumn({ name: 'plan_usuario_id' })
  plan_usuario_ID: number;

  @Column({ name: 'plan_id' })
  plan_ID: number;

  @Column({ name: 'cupos_apadrinados_adq' })
  cupos_apadrinados_adq: number;

  @Column({ name: 'usuario_id' })
  usuario_ID: number;
}
