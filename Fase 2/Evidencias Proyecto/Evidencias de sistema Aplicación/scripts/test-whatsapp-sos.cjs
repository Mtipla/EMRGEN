// SQL y formateo reales con proveedor simulado; todas las escrituras se revierten.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { client } = require('./db-dev.cjs');
const { WhatsappSosDispatcher } = require('../apps/backend/dist/integrations/whatsapp/whatsapp-sos-dispatcher.service');
const { WhatsappAlertService } = require('../apps/backend/dist/integrations/whatsapp/whatsapp-alert.service');
const { CAMPOS_FICHA,cifrarFicha } = require('../apps/backend/dist/perfil/cifrado-medico');
const { readFileSync } = require('node:fs');
const { parseEnv } = require('node:util');
const { resolve } = require('node:path');
const config={...parseEnv(readFileSync(resolve(__dirname,'../.env'),'utf8')),
  ...parseEnv(readFileSync(resolve(__dirname,'../apps/backend/.env.local'),'utf8')),...process.env};
process.env.MEDICAL_DATA_KEYS=config.MEDICAL_DATA_KEYS;

async function main() {
  const db = client();
  await db.connect();
  try {
    await db.query('BEGIN');
    const query = async (sql, args) => (await db.query(sql, args)).rows;
    const email = `wa.${randomUUID()}@emergen.test`;
    const [user] = await query(`INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,estado_id)
      VALUES ('Prueba SOS WhatsApp',$1,'sin-login',2) RETURNING usuario_id`, [email]);
    await query('INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES ($1,2,0)', [user.usuario_id]);
    await query(`INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES
      ($1,'+56900000001','Ficticio uno'),($1,'+56900000002','Ficticio dos')`, [user.usuario_id]);
    const record={tipo_sangre:'AB-',alergias:'Alergia ficticia',enfermedades_cronicas:'Condición ficticia',
      medicamentos_actuales:'Medicamento ficticio',discapacidad_presente:'',donante_organos:true};
    const [medical]=await query(`INSERT INTO antecedente_medico(usuario_id,${CAMPOS_FICHA.join(',')})
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING antecedente_medico_id`,[user.usuario_id,...cifrarFicha(user.usuario_id,record)]);
    const [detail] = await query(`INSERT INTO detalle_alerta(texto_mensaje,antecedente_medico_id) VALUES ('Mi mensaje de emergencia',$1) RETURNING detalle_alerta_id`,[medical.antecedente_medico_id]);
    const [location] = await query(`INSERT INTO ubicacion_alerta(ubicacion) VALUES ('SIMULADA: -33.4378,-70.6504') RETURNING ubicacion_alerta_id`);
    const [alert] = await query(`INSERT INTO alerta(usuario_id,detalle_alerta_id,ubicacion_alerta_id,prioridad_id,clave_idempotencia,huella_solicitud)
      VALUES ($1,$2,$3,2,$4,repeat('b',64)) RETURNING alerta_id`,
      [user.usuario_id, detail.detalle_alerta_id, location.ubicacion_alerta_id, randomUUID()]);
    await query(`INSERT INTO envio_alerta(alerta_id,contacto_emergencia_id)
      SELECT $1,contacto_emergencia_id FROM contacto_emergencia WHERE usuario_id=$2`, [alert.alerta_id,user.usuario_id]);
    const scoped = { query: (sql, args) => query(sql
      .replace('WHERE e.estado_envio_id=1', `WHERE e.alerta_id=${alert.alerta_id} AND e.estado_envio_id=1`)
      .replace('WHERE a.alerta_id=e.alerta_id', `WHERE e.alerta_id=${alert.alerta_id} AND a.alerta_id=e.alerta_id`), args) };
    const sent = [];
    let ready = false;
    const connection = {
      isReady: () => ready,
      assertReady: () => assert(ready),
      findAccount: async digits => `${digits}@s.whatsapp.net`,
      send: async (jid, content) => { sent.push({jid,content}); return `SIMULADO-${sent.length}`; },
    };
    const dispatcher = new WhatsappSosDispatcher(
      { query: scoped.query, transaction: callback => callback(scoped) },
      connection, new WhatsappAlertService(connection));
    await dispatcher.dispatchPending();
    assert.equal(sent.length, 0);
    ready = true;
    await dispatcher.dispatchPending();
    await dispatcher.dispatchPending();
    assert.equal(sent.length, 4, 'un texto y un pin por contacto, sin duplicados');
    for (const { content } of sent.filter(item => item.content.text)) {
      assert(content.text.includes('TIPO DE EMERGENCIA: URBANO'));
      assert(content.text.includes('Mi mensaje de emergencia'));
      assert(content.text.includes('SIMULADA:'));
      assert(content.text.includes('ANTECEDENTES MÉDICOS:'));
      assert(content.text.includes('Tipo de sangre: AB-'));
      assert(content.text.includes('Alergias: Alergia ficticia'));
      assert(content.text.includes('Medicamentos actuales: Medicamento ficticio'));
      assert(content.text.includes('Donante de órganos: Sí'));
    }
    await query(`UPDATE alerta SET estado_alerta='FINALIZADA',fecha_cierre=clock_timestamp() WHERE alerta_id=$1`, [alert.alerta_id]);
    await query(`UPDATE alerta SET estado_alerta='FINALIZADA' WHERE alerta_id=$1`, [alert.alerta_id]);
    ready = false;
    await dispatcher.dispatchPending();
    assert.equal(sent.length, 4, 'el cierre espera la reconexión');
    ready = true;
    await dispatcher.dispatchPending();
    await dispatcher.dispatchPending();
    assert.equal(sent.length, 6, 'un único aviso de cierre por contacto, sin pin');
    const expected = `MENSAJE MEDIANTE APLICACIÓN EMERGEN\n\nLa alerta reciente del usuario Prueba SOS WhatsApp de correo ${email}, ha sido FINALIZADA`;
    for (const { content } of sent.slice(4)) {
      assert.equal(content.text, expected);
      assert.equal(content.location, undefined);
    }
    const states = await query(`SELECT tipo_notificacion,count(*)::int AS total,
      bool_and(estado_envio_id=2 AND fecha_envio IS NOT NULL) AS enviados
      FROM envio_alerta WHERE alerta_id=$1 GROUP BY tipo_notificacion ORDER BY tipo_notificacion`, [alert.alerta_id]);
    assert.deepEqual(states, [
      { tipo_notificacion: 'ACTIVACION', total: 2, enviados: true },
      { tipo_notificacion: 'FINALIZACION', total: 2, enviados: true },
    ]);
    await dispatcher.onModuleDestroy();
    console.log('OK: tipo, mensaje, ubicación y ficha descifrada; dos contactos; cierre sin datos médicos; reconexión; estados y fechas. Proveedor simulado y transacción revertida.');
  } finally {
    await db.query('ROLLBACK');
    await db.end();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
