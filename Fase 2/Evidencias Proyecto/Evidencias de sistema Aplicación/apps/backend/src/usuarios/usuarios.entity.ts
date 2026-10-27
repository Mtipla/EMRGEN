import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'usuario_id' })
  usuario_ID: number;

  @Column({ name: 'nombre_usuario', length: 50 })
  nombre_usuario: string;

  // Nulos en apadrinados: entran con las credenciales de su principal.
  @Column({ name: 'correo_usuario', type: 'varchar', length: 100, nullable: true })
  correo_usuario: string | null;

  // Hash bcrypt. select: false => las consultas no lo cargan (ni lo devuelven por HTTP)
  // salvo que lo pidan explícitamente, como hace el login.
  @Column({ name: 'contra_usuario', type: 'varchar', length: 255, nullable: true, select: false })
  contra_usuario: string | null;

  @Column({ name: 'rol_id' })
  rol_ID: number;

  @Column({ name: 'pin_id', type: 'int', nullable: true })
  PIN_ID: number | null;

  @Column({ name: 'msj_personalizado_id', type: 'int', nullable: true })
  msj_personalizado_ID: number | null;

  @Column({ name: 'prioridad_id', type: 'int', nullable: true })
  prioridad_ID: number | null;

  @Column({ name: 'usuario_principal_id', type: 'int', nullable: true })
  usuario_principal_ID: number | null;

  @Column({ name: 'estado_id' })
  estado_ID: number;
}
