// HTTP real entre Nest/Docker y FastAPI; usa cuentas temporales y nunca proveedores externos.
const {client}=require('./db-dev.cjs');
const {readFileSync,writeFileSync,mkdirSync,existsSync}=require('node:fs');
const {resolve}=require('node:path');
const {randomUUID}=require('node:crypto');
const assert=require('node:assert/strict');
const path=resolve(__dirname,'../services/internal-api/.runtime/smoke.json');
async function call(base,url,method='GET',body,token,expected=200){
 const response=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});
 const value=await response.json();assert.equal(response.status,expected,method+' '+url+' '+JSON.stringify(value));return value;
}
(async()=>{
 const db=client();await db.connect();
 try{
 if(process.argv[2]==='prepare'){
  if(existsSync(path) && !JSON.parse(readFileSync(path,'utf8')).completed) throw new Error('Ya hay fixture temporal registrado; ejecutar finish antes de preparar otro');
  const email='smoke.'+randomUUID().slice(0,8)+'@emergen.test';
  await db.query('BEGIN');
  const user=(await db.query("INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,estado_id) SELECT 'Smoke temporal',$1,contra_usuario,2 FROM usuario WHERE correo_usuario='admin@emergen.test' RETURNING usuario_id",[email])).rows[0].usuario_id;
  await db.query('INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES ($1,2,0)',[user]);
  await db.query("INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES ($1,'+56900000001','Ficticio Smoke')",[user]);
  const detail=(await db.query("INSERT INTO detalle_alerta(texto_mensaje) VALUES ('Fixture recuperación arranque') RETURNING detalle_alerta_id")).rows[0].detalle_alerta_id;
  const row=(await db.query("INSERT INTO alerta(usuario_id,detalle_alerta_id,prioridad_id,clave_idempotencia,huella_solicitud,fecha_creacion) VALUES ($1,$2,3,$3,repeat('a',64),clock_timestamp()-interval '25 hours') RETURNING *",[user,detail,randomUUID()])).rows[0];
  await db.query("INSERT INTO historial_alerta(alerta_id,detalle_alerta_id,estado_actual,fecha_cambio_estado) SELECT $1,$2,'ACTIVA',fecha_creacion FROM alerta WHERE alerta_id=$1",[row.alerta_id,detail]);
  await db.query('COMMIT');mkdirSync(resolve(path,'..'),{recursive:true});writeFileSync(path,JSON.stringify({user,email,alert:row.alerta_id}));
  console.log('Fixture temporal de recuperación preparado.');
 }else{
  const fixture=JSON.parse(readFileSync(path,'utf8'));
  const nest='http://localhost:3001',internal='http://127.0.0.1:8000';
  try{
   const token=(await call(nest,'/usuarios/login','POST',{correo_usuario:fixture.email,password:'EmergenDev123!'},undefined,201)).access_token;
   assert.equal((await call(internal,'/health')).status,'ok');
   const recovered=await call(internal,'/internal/v1/alertas/'+fixture.alert,'GET',undefined,token);
   assert.equal(recovered.estado_alerta,'FINALIZADA');
   assert.equal((await db.query("SELECT count(*)::int n FROM historial_alerta WHERE alerta_id=$1 AND estado_actual='FINALIZADA'",[fixture.alert])).rows[0].n,1);
   const sos=await call(internal,'/internal/v1/alertas','POST',{clave_idempotencia:randomUUID(),prioridad_id:3},token,201);
   await call(internal,'/internal/v1/alertas/'+sos.alerta_id+'/cerrar','POST',{pin:'0007'},token,409);
   await call(nest,'/usuarios/me/pin','POST',{PIN:'0007'},token,201);
   await call(internal,'/internal/v1/alertas/'+sos.alerta_id+'/cerrar','POST',{pin:'0008'},token,403);
   assert.equal((await call(internal,'/internal/v1/alertas/'+sos.alerta_id+'/cerrar','POST',{pin:'0007'},token)).estado_alerta,'FINALIZADA');
   const ticket=await call(internal,'/internal/v1/tickets-soporte','POST',{descripcion:'Caso HTTP temporal',categoria_id:1},token,201);
   assert.equal(ticket.estado,'ABIERTO');assert.equal(ticket.solucion,null);
   const admin=(await call(nest,'/usuarios/login','POST',{correo_usuario:'admin@emergen.test',password:'EmergenDev123!'},undefined,201)).access_token;
   await call(nest,'/admin/usuarios','GET',undefined,admin);
   const solved=await call(internal,'/internal/v1/tickets-soporte/'+ticket.ticket_id,'PATCH',{estado:'RESUELTO',solucion:'Verificado por HTTP'},admin);
   assert.equal(solved.estado,'RESUELTO');
   console.log('HTTP real OK: JWT Nest/FastAPI, recuperación de 25h al arranque, SOS sin PIN, hash Nest verificado por Python, cierre, ticket/seguimiento y roles.');
  }finally{
   const alerts=(await db.query('SELECT alerta_id,detalle_alerta_id FROM alerta WHERE usuario_id=$1',[fixture.user])).rows;
   await db.query('DELETE FROM usuario WHERE usuario_id=$1',[fixture.user]);
   for(const row of alerts){
    for(const table of ['envio_alerta','enlace_medico','historial_alerta'])await db.query('DELETE FROM '+table+' WHERE alerta_id=$1',[row.alerta_id]);
    await db.query('DELETE FROM alerta WHERE alerta_id=$1',[row.alerta_id]);
    await db.query('DELETE FROM detalle_alerta WHERE detalle_alerta_id=$1',[row.detalle_alerta_id]);
   }
   // El marcador registra que no queda fixture temporal; no contiene credenciales.
   writeFileSync(path,JSON.stringify({completed:true}));
  }
 }
 }catch(e){await db.query('ROLLBACK');throw e;}finally{await db.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
