// Fixtures de desarrollo explícitos. No se ejecutan durante el arranque de Docker.
const { client, bcrypt } = require('./db-dev.cjs');
(async () => {
  const db = client();
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query("INSERT INTO plan(plan_id,nombre_plan,precio_actual,limite_compra_max) VALUES (2,'PLAN BASE DEMOSTRACION',5000,1) ON CONFLICT(plan_id) DO UPDATE SET precio_actual=EXCLUDED.precio_actual");
    const password = await bcrypt.hash('EmergenDev123!', 12);
    const pin = await bcrypt.hash('0007', 12);
    const childPin = await bcrypt.hash('1234', 12);
    const fixtures = [
      ['admin','Administrador Demo',1,1,null,pin],
      ['soporte','Soporte Demo',2,1,null,pin],
      ['principal','Principal Demo',3,1,null,pin],
      ['sinplan','Sin Plan Demo',3,1,null,pin],
      ['completo','Apadrinado Completo',3,1,'principal',childPin],
      ['parcial','Apadrinado Parcial',3,2,'principal',null],
      ['pruebacompraplan','Prueba compra plan',3,1,null,pin],
    ];
    const ids = {};
    for (const [name,label,role,state,parent,hash] of fixtures) {
      const email = name+'@emergen.test';
      let row = (await db.query('SELECT usuario_id FROM usuario WHERE correo_usuario=$1',[email])).rows[0];
      if (!row) {
        const pinId = hash ? (await db.query('INSERT INTO pin(pin_hash) VALUES ($1) RETURNING pin_id',[hash])).rows[0].pin_id : null;
        row = (await db.query('INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,rol_id,estado_id,usuario_principal_id,pin_id,prioridad_id) VALUES ($1,$2,$3,$4,$5,$6,$7,3) RETURNING usuario_id',[label,email,password,role,state,parent ? ids[parent] : null,pinId])).rows[0];
      }
      ids[name] = row.usuario_id;
      if (name === 'principal') await db.query('INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES ($1,2,3) ON CONFLICT(usuario_id) DO NOTHING',[row.usuario_id]);
      if (!['admin','soporte'].includes(name) && !(await db.query('SELECT 1 FROM contacto_emergencia WHERE usuario_id=$1',[row.usuario_id])).rowCount) {
        await db.query("INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES ($1,'+56900000001','Contacto ficticio')",[row.usuario_id]);
      }
    }
    await db.query("SELECT setval(pg_get_serial_sequence('plan','plan_id'),(SELECT max(plan_id) FROM plan),true)");
    await db.query('COMMIT');
    console.log('Fixtures disponibles:', Object.keys(ids).map(x=>x+'@emergen.test').join(', '));
    console.log('No se enviaron mensajes ni se contactó a proveedores de pago.');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Fixtures fallaron:',error.code ?? error.name, error.message);
    process.exitCode = 1;
  } finally { await db.end(); }
})();
