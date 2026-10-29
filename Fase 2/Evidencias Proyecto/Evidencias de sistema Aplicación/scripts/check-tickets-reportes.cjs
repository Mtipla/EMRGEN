// Prueba HTTP con PostgreSQL y jsReport reales. Elimina sus cuentas y tickets temporales.
const assert = require('node:assert/strict');
const { readFileSync, existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { randomUUID } = require('node:crypto');
const { parseEnv } = require('node:util');
const jwt = require('jsonwebtoken');
const { client } = require('./db-dev.cjs');

const root = resolve(__dirname, '..');
const localEnv = resolve(root, 'apps/backend/.env.local');
const config = {
  ...parseEnv(readFileSync(resolve(root, '.env'), 'utf8')),
  ...(existsSync(localEnv) ? parseEnv(readFileSync(localEnv, 'utf8')) : {}),
  ...process.env,
};
const backend = process.env.PANEL_API_URL || 'http://localhost:3001';
const internal = process.env.INTERNAL_API_URL || 'http://localhost:8000';
const output = resolve(root, 'node_modules/.cache/tickets-reportes-verificacion');

async function main() {
  const db = client();
  const usuarios = [];
  await db.connect();
  try {
    const crear = async (rol, nombre) => {
      const { rows: [usuario] } = await db.query(`
        INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,rol_id)
        VALUES ($1,$2,'sin-login-de-prueba',$3) RETURNING usuario_id,correo_usuario
      `, [nombre, `informe.${randomUUID()}@emergen.test`, rol]);
      usuarios.push(usuario.usuario_id);
      return { ...usuario, token: jwt.sign({ sub: usuario.usuario_id, email: usuario.correo_usuario }, config.JWT_SECRET,
        { algorithm: 'HS256', issuer: 'emergen-api', audience: 'emergen-web', expiresIn: '5m' }) };
    };
    const admin = await crear(1, 'Admin informe temporal');
    const trabajador = await crear(2, 'Soporte & María');
    const emisor = await crear(3, 'Emisor <José>');
    const call = async (base, ruta, usuario, method = 'GET', body, status = 200) => {
      const response = await fetch(base + ruta, {
        method, headers: { 'Content-Type': 'application/json', ...(usuario && { Authorization: `Bearer ${usuario.token}` }) },
        ...(body && { body: JSON.stringify(body) }), signal: AbortSignal.timeout(90000),
      });
      assert.equal(response.status, status, `${method} ${ruta}: HTTP ${response.status}`);
      return response;
    };
    const ruta = '/internal/v1/tickets-soporte';
    const ticket = await (await call(internal, ruta, emisor, 'POST', { descripcion: 'Descripción <especial> & con acentos\nSegunda línea', categoria_id: 1 }, 201)).json();
    const solucion = '=SUM(1,2)\nSolución <verificada> & sin perder texto';
    await call(internal, `${ruta}/${ticket.ticket_id}`, trabajador, 'PATCH', { solucion });
    await call(internal, `${ruta}/${ticket.ticket_id}`, admin, 'PATCH', { estado: 'CERRADO', confirmar_cierre: true });
    const { rows: [autor] } = await db.query('SELECT trabajador_id,trabajador_nombre FROM soporte WHERE ticket_soporte_id=$1', [ticket.ticket_id]);
    assert.equal(autor.trabajador_id, trabajador.usuario_id, 'Cerrar sin respuesta no debe cambiar al autor');
    assert.equal(autor.trabajador_nombre, 'Soporte & María');
    // Supera la página de 20 y agrega estados que deben quedar fuera del informe.
    const { rows: fixtures } = await db.query(`
      INSERT INTO ticket_soporte(desc_ticket,usuario_id,categoria_soporte_id,estado_ticket_id)
      SELECT 'Fixture informe ' || n,$1,1,e.estado_ticket_id
      FROM generate_series(1,23) n
      JOIN estado_ticket e ON e.estado_ticket = CASE WHEN n<=21 THEN 'CERRADO' WHEN n=22 THEN 'ABIERTO' ELSE 'EN PROCESO' END
      RETURNING ticket_soporte_id,estado_ticket_id
    `, [emisor.usuario_id]);
    const { rows: cerrados } = await db.query(`
      SELECT t.ticket_soporte_id FROM ticket_soporte t JOIN estado_ticket e USING(estado_ticket_id)
      WHERE t.usuario_id=$1 AND e.estado_ticket='CERRADO' ORDER BY 1
    `, [emisor.usuario_id]);
    assert.equal(cerrados.length, 22);
    await call(backend, '/admin/tickets/reporte', null, 'GET', undefined, 401);
    mkdirSync(output, { recursive: true });
    for (const formato of ['pdf', 'xlsx']) {
      const url = `/admin/tickets/reporte?formato=${formato}`;
      for (const usuario of [trabajador, emisor]) await call(backend, url, usuario, 'GET', undefined, 403);
      const response = await call(backend, url, admin);
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert(response.headers.get('content-disposition').endsWith(`.${formato}"`));
      assert(formato === 'pdf' ? bytes.subarray(0, 5).toString() === '%PDF-' : bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])));
      writeFileSync(resolve(output, `tickets-cerrados.${formato}`), bytes);
    }
    writeFileSync(resolve(output, 'result.json'), JSON.stringify({
      ticketId: ticket.ticket_id, emisorId: emisor.usuario_id, trabajadorId: trabajador.usuario_id,
      cerrados: cerrados.map(t => t.ticket_soporte_id),
      excluidos: fixtures.filter(t => !cerrados.some(c => c.ticket_soporte_id === t.ticket_soporte_id)).map(t => t.ticket_soporte_id),
      solucion,
    }, null, 2));
    console.log('HTTP real OK: autor desde sesión, cierre sin cambiar autor, solo ADMIN descarga PDF/Excel; fixtures de 22 cerrados y 2 excluidos.');
    console.log('Archivos para validar: node_modules/.cache/tickets-reportes-verificacion');
  } finally {
    for (const id of usuarios.reverse()) await db.query('DELETE FROM usuario WHERE usuario_id=$1', [id]);
    await db.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
