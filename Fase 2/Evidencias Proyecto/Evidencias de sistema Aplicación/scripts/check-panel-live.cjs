const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createRequire } = require('node:module');
const { parseEnv } = require('node:util');
const { client } = require('./db-dev.cjs');
const backendRequire = createRequire(resolve(__dirname, '../apps/backend/package.json'));
const jwt = backendRequire('jsonwebtoken');
const config = {
  ...parseEnv(readFileSync(resolve(__dirname, '../.env'), 'utf8')),
  ...parseEnv(readFileSync(resolve(__dirname, '../apps/backend/.env.local'), 'utf8')),
  ...process.env,
};

async function main() {
  const db = client();
  await db.connect();
  try {
    const { rows: [admin] } = await db.query('SELECT usuario_id FROM usuario WHERE rol_id=1 AND estado_id=1 ORDER BY usuario_id LIMIT 1');
    assert(admin, 'No existe administrador completo para comprobar el panel local');
    const token = jwt.sign({ sub: admin.usuario_id }, config.JWT_SECRET, {
      algorithm: 'HS256', issuer: 'emergen-api', audience: 'emergen-web', expiresIn: '1m',
    });
    const base = process.env.PANEL_API_URL || 'http://localhost:3000';
    const get = async (ruta) => {
      const respuesta = await fetch(base + ruta, { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(5000) });
      assert.equal(respuesta.status, 200, ruta + ' no está disponible');
      return respuesta.json();
    };
    const usuarios = await get('/admin/usuarios');
    assert(usuarios.every((u) => Number.isInteger(u.numeros_vinculados) && Number.isInteger(u.alertas_generadas)), 'El backend activo aún no expone los contadores de cuentas');
    const planes = await get('/admin/usuarios/planes');
    assert(planes.length > 0, 'No hay planes disponibles');
    const expediente = await get('/admin/usuarios/' + admin.usuario_id);
    assert(Array.isArray(expediente.contactos) && Array.isArray(expediente.alertas), 'El expediente activo no contiene el desglose');
    const esquema = await fetch('http://localhost:8000/openapi.json', { signal: AbortSignal.timeout(5000) }).then((r) => r.json());
    const campos = esquema.components.schemas.TicketActualizar.properties;
    assert(campos.enviar_verificacion && campos.confirmar_cierre, 'La API interna activa requiere reinicio para cargar los cambios de tickets');
    assert(!('verificacion_solicitada' in esquema.components.schemas.Ticket.properties), 'La API interna activa aún devuelve la columna de verificación retirada');
    console.log('Panel local verificado: contadores, expediente, planes y nuevo contrato de tickets disponibles.');
  } finally { await db.end(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
