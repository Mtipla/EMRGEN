import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryColumn({ name: 'usuario_id' })
  usuario_ID: number;

  @Column({ name: 'nombre_usuario', length: 50 })
  nombre_usuario: string;

  @Column({ name: 'correo_usuario', length: 100 })
  correo_usuario: string;

  @Column({ name: 'rol_id' })
  rol_ID: number;

  @Column({ name: 'estado_id' })
  estado_ID: number;
  
  @Column({ name: 'usuario_principal_id', nullable: true })
  usuario_principal_ID: number;
}