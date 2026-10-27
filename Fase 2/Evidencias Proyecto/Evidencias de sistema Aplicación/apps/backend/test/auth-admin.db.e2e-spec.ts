import './load-root-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { FirebaseAuthService } from '../src/integrations/firebase-auth/firebase-auth.service';
import { UsuariosService } from '../src/usuarios/usuarios.service';

const db = process.env.DB_E2E === '1' ? describe : describe.skip;
db('Contrato final: login, PIN, administración y auditoría PostgreSQL', () => {
  jest.setTimeout(60_000);
  let app: INestApplication, source: DataSource, users: UsuariosService;
  const suffix = randomUUID().slice(0,8), password = 'ClaveSegura123';
  const email = 'auth.'+suffix+'@emergen.test';
  let id: number, child: number, token: string, admin: string, support: string;
  const created: number[] = [];
  const http = () => request(app.getHttpServer());
  const auth = (t=token) => ({ Authorization: 'Bearer '+t });
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FirebaseAuthService).useValue({ verifyIdToken: async (value: string) => ({
        uid: value, email: value.replace('unverified:', ''), emailVerified: !value.startsWith('unverified:'),
      }) }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist:true,forbidNonWhitelisted:true,transform:true }));
    await app.init(); source=app.get(DataSource); users=app.get(UsuariosService);
    for (const name of ['admin','soporte']) {
      const r = await http().post('/usuarios/login').send({ correo_usuario:name+'@emergen.test',password:'EmergenDev123!' }).expect(201);
      if (name==='admin') admin=r.body.access_token; else support=r.body.access_token;
    }
  });
  afterAll(async () => {
    if (source?.isInitialized) {
      if(child) await source.query('DELETE FROM usuario WHERE usuario_id=$1',[child]);
      for (const target of created) await source.query('DELETE FROM usuario WHERE usuario_id=$1',[target]);
    }
    await app?.close();
  });
  it('registro exige identidad verificada; hash real y configuración inicial parcial', async () => {
    await http().post('/usuarios/registro').send({nombre_usuario:'Prueba',correo_usuario:email,password}).expect(401);
    await http().post('/usuarios/registro').set(auth('unverified:'+email)).send({nombre_usuario:'Prueba',correo_usuario:email,password}).expect(403);
    const r=await http().post('/usuarios/registro').set(auth(email)).send({nombre_usuario:'Prueba',correo_usuario:email,password}).expect(201);
    id=r.body.usuario_ID;created.push(id);expect(r.body.requiere_pin).toBe(true);
    const [row]=await source.query('SELECT * FROM usuario WHERE usuario_id=$1',[id]);
    expect(await bcrypt.compare(password,row.contra_usuario)).toBe(true);
    expect(row.estado_id).toBe(2);expect(row.usuario_principal_id).toBeNull();
  });
  it('correo global único, credenciales y JWT', async () => {
    await http().post('/usuarios/registro').set(auth(email)).send({nombre_usuario:'Duplicado',correo_usuario:email.toUpperCase(),password}).expect(409);
    // CA-01.1: el duplicado se informa aunque el correo de Firebase aún no esté confirmado.
    const dup=await http().post('/usuarios/registro').set(auth('unverified:'+email)).send({nombre_usuario:'Duplicado',correo_usuario:email,password}).expect(409);
    expect(dup.body.message).toBe('El correo ingresado es inválido o ya se encuentra registrado');
    await http().post('/usuarios/login').send({correo_usuario:email,password:'incorrecta'}).expect(401);
    token=(await http().post('/usuarios/login').send({correo_usuario:email,password}).expect(201)).body.access_token;
    expect(token.split('.')).toHaveLength(3);
    const r=await http().get('/usuarios/me').set(auth()).expect(200);
    expect(JSON.stringify(r.body)).not.toMatch(/contra_usuario|pin_hash/);
    await http().patch('/usuarios/me').set(auth()).send({nombre_usuario:'No permitido parcial'}).expect(403);
  });
  it('0007 conserva ceros, hash bcrypt, no admite número ni configurar dos veces', async () => {
    await http().post('/usuarios/me/pin').set(auth()).send({PIN:7}).expect(400);
    await http().post('/usuarios/me/pin').set(auth()).send({PIN:'0007'}).expect(201);
    await http().post('/usuarios/me/pin').set(auth()).send({PIN:'0007'}).expect(409);
    const [r]=await source.query('SELECT p.pin_hash,u.estado_id FROM usuario u JOIN pin p USING(pin_id) WHERE usuario_id=$1',[id]);
    expect(r.estado_id).toBe(1);expect(await bcrypt.compare('0007',r.pin_hash)).toBe(true);
    expect(await bcrypt.compare('0008',r.pin_hash)).toBe(false);
  });
  it('roles, body no confiable y eliminación de estado 3',async()=>{
    await http().get('/admin/usuarios').expect(401);
    await http().get('/admin/usuarios').set(auth()).expect(403);
    await http().get('/admin/usuarios').set(auth(support)).expect(200);
    await http().get('/admin/usuarios').set(auth(admin)).expect(200);
    await http().put('/admin/usuarios/'+id+'/estado').set(auth(admin)).send({estado_ID:3}).expect(400);
    await http().put('/admin/usuarios/'+id+'/estado').set(auth(admin)).send({estado_ID:2,admin_ID:id}).expect(400);
  });
  it('plan vigente, capacidad derivada y apadrinado con login independiente',async()=>{
    const plan=await http().put('/admin/usuarios/'+id+'/plan').set(auth(admin)).send({plan_ID:2,cupos_apadrinados_adq:2}).expect(200);
    expect(plan.body).toMatchObject({plan_ID:2,cupos_ocupados:0,cupos_disponibles:2});
    await expect(users.crearUsuarioApadrinado(id,{nombre_usuario:'Hijo',correo_usuario:'child.'+suffix+'@emergen.test',password,estado_ID:1})).rejects.toThrow('PIN');
    const row=await users.crearUsuarioApadrinado(id,{nombre_usuario:'Hijo',correo_usuario:'child.'+suffix+'@emergen.test',password,estado_ID:1,pin:'1234'});
    child=row.usuario_ID;
    const r=await http().post('/usuarios/login').send({correo_usuario:row.correo_usuario,password}).expect(201);
    expect(r.body.usuario.usuario_ID).toBe(child);expect(r.body.usuario.requiere_pin).toBe(false);
    await http().put('/admin/usuarios/'+child+'/plan').set(auth(admin)).send({plan_ID:2,cupos_apadrinados_adq:1}).expect(400);
    const expediente=await http().get('/admin/usuarios/'+id).set(auth(admin)).expect(200);
    expect(expediente.body.plan).toMatchObject({cupos_ocupados:1,cupos_disponibles:1});
    await http().put('/admin/usuarios/'+id+'/plan').set(auth(admin)).send({plan_ID:2,cupos_apadrinados_adq:0}).expect(400);
    await http().delete('/usuarios/'+id).set(auth(admin)).expect(409);
  });
  it('correo del apadrinado editable y único; borrar conserva capacidad y auditoría',async()=>{
    await http().patch('/admin/usuarios/'+child).set(auth(admin)).send({correo_usuario:email}).expect(409);
    await http().patch('/admin/usuarios/'+child).set(auth(admin)).send({correo_usuario:'renamed.'+suffix+'@emergen.test'}).expect(200);
    const removed=child;
    await http().delete('/admin/usuarios/apadrinado/'+child).set(auth(admin)).expect(200);child=0;
    const [plan]=await source.query('SELECT cupos_apadrinados_adq FROM plan_usuario WHERE usuario_id=$1',[id]);
    expect(plan.cupos_apadrinados_adq).toBe(2);
    const log=await source.query("SELECT * FROM bitacora_sistema WHERE accion_realizada=$1 AND resultado='EXITOSA'",['Eliminación de usuario apadrinado '+removed]);
    expect(log).toHaveLength(1);expect(log[0].usuario_afectado_id).toBeNull();
    expect(log[0].rol_actor_id).toBe(1);expect(log[0].fecha_accion).toBeInstanceOf(Date);
  });
  it('soporte inicia parcial y configura su PIN antes de tener facultades; errores no filtran SQL',async()=>{
    const r=await http().post('/admin/usuarios/soporte').set(auth(admin)).send({nombre_usuario:'Soporte Prueba',correo_usuario:'staff.'+suffix+'@emergen.test',password}).expect(201);
    created.push(r.body.usuario_ID);expect(r.body.estado_ID).toBe(2);
    await http().put('/admin/usuarios/'+r.body.usuario_ID+'/estado').set(auth(admin)).send({estado_ID:1}).expect(400);
    const fail=await http().put('/admin/usuarios/'+id+'/plan').set(auth(admin)).send({plan_ID:999999,cupos_apadrinados_adq:2}).expect(409);
    expect(JSON.stringify(fail.body)).not.toMatch(/INSERT INTO|constraint|QueryFailed/);
  });
  it('borrar usuario registra una sola auditoría y conserva actor/rol',async()=>{
    await http().delete('/usuarios/'+id).set(auth(admin)).expect(200);
    const logs=await source.query("SELECT * FROM bitacora_sistema WHERE accion_realizada=$1 AND resultado='EXITOSA'",['Eliminación del usuario '+id]);
    expect(logs).toHaveLength(1);expect(logs[0].usuario_afectado_id).toBeNull();
    await http().get('/usuarios/me').set(auth()).expect(401);
  });
});
