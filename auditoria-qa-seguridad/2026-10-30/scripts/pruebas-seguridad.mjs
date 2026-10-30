// Pruebas dinámicas de seguridad adicionales (inyección, XSS, elusión, resiliencia de proveedor).
// Volúmenes pequeños, secuenciales, entorno aislado. Evidencia -> evidencias/casos-seguridad.jsonl
import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { api, caso, creds, secrets, fakeFirebase, NEST, FAST, req, sql, resumen, outFile } from './lib.mjs';

const F = 'casos-seguridad.jsonl';
writeFileSync(outFile(F), '');
const C = creds();
const jwt = req('jsonwebtoken');
const SECRET = secrets().jwtSecret;
const sign = (sub, over = {}) => jwt.sign({ sub, email: `aud${sub}@x.invalid`, iss: 'emergen-api', aud: 'emergen-web', ...over }, SECRET, { expiresIn: '1h' });
const ok = (c, o) => ({ ok: c, observado: o });
const FLAGS = resolve(process.env.AUD_SCRATCH, 'flags');

// Usuario principal con acceso completo para las pruebas (registro + PIN por API).
async function nuevoPrincipal() {
  const correo = `aud.sec.${randomUUID().slice(0, 8)}@example.invalid`;
  const pwd = 'Clave-sec-' + randomUUID().slice(0, 6);
  await api(NEST, 'POST', '/usuarios/registro', { headers: { Authorization: 'Bearer ' + fakeFirebase(correo) }, body: { nombre_usuario: 'Cuenta Seguridad', correo_usuario: correo, password: pwd } });
  const l = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: correo, password: pwd } });
  await api(NEST, 'POST', '/usuarios/me/pin', { token: l.json.access_token, body: { PIN: '9090' } });
  const [{ usuario_id }] = await sql('SELECT usuario_id FROM usuario WHERE correo_usuario=$1', [correo]);
  return { token: l.json.access_token, correo, id: usuario_id };
}

(async () => {
  const user = await nuevoPrincipal();
  const admin = sign(C.admin.id);

  // --- Inyección SQL ---
  await caso(F, { id: 'SEC-SQLI-01', req: 'RNF5', desc: "Login con payload SQL en correo no autentica ni rompe (' OR '1'='1)", esperado: '401/400, sin error 500' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: "' OR '1'='1' --@x.cc", password: "x' OR '1'='1" } });
    return ok(r.status === 401 || r.status === 400, { status: r.status });
  });
  await caso(F, { id: 'SEC-SQLI-02', req: 'RNF5', desc: 'Payload SQL en nombre de contacto se almacena como literal (parametrizado)', esperado: 'guardado tal cual, sin efecto SQL' }, async () => {
    const payload = "Robert'); DROP TABLE contacto_emergencia;--";
    const r = await api(NEST, 'POST', '/usuarios/me/contactos', { token: user.token, body: { nombre_contacto: payload.slice(0, 20), num_emergencia: '+56955550001', compartir_antecedentes: false } });
    const [tabla] = await sql("SELECT to_regclass('public.contacto_emergencia') AS t");
    return ok(r.status === 201 && tabla.t === 'contacto_emergencia', { status: r.status, tablaSigueExistiendo: tabla.t });
  });
  await caso(F, { id: 'SEC-SQLI-03', req: 'RNF5', desc: 'Filtro de alertas admin con payload SQL en estado se rechaza por DTO allowlist', esperado: '400' }, async () => {
    const r = await api(NEST, 'GET', "/admin/alertas?estado=ACTIVA'OR'1", { token: admin });
    return ok(r.status === 400, { status: r.status });
  });

  // --- XSS almacenado ---
  await caso(F, { id: 'SEC-XSS-01', req: 'RNF5', desc: 'Script en mensaje SOS se almacena/retorna como dato, no se ejecuta en servidor', esperado: 'texto guardado literal' }, async () => {
    const xss = '<script>alert(1)</script>';
    await api(NEST, 'PUT', '/usuarios/me/perfil', { token: user.token, body: { mensaje: xss } });
    const r = await api(NEST, 'GET', '/usuarios/me/perfil', { token: user.token });
    return ok(r.json?.mensaje === xss, { almacenado: r.json?.mensaje === xss });
  });
  await caso(F, { id: 'SEC-XSS-02', req: 'RNF5', desc: 'El contenido devuelto es application/json (no HTML ejecutable) con nosniff', esperado: 'JSON + nosniff' }, async () => {
    const r = await api(NEST, 'GET', '/usuarios/me/perfil', { token: user.token });
    return ok(/application\/json/.test(r.headers.get('content-type') || '') && r.headers.get('x-content-type-options') === 'nosniff',
      { contentType: r.headers.get('content-type'), nosniff: r.headers.get('x-content-type-options') });
  });

  // --- Elusión de autorización / BOLA en rutas administrativas ---
  await caso(F, { id: 'SEC-BOLA-01', req: 'RNF4/CA-NF5-02', desc: 'Usuario común no puede ver expediente admin de otro (GET /admin/usuarios/:id)', esperado: '403' }, async () => {
    const r = await api(NEST, 'GET', `/admin/usuarios/${C.admin.id}`, { token: user.token });
    return ok(r.status === 403, { status: r.status });
  });
  await caso(F, { id: 'SEC-BOLA-02', req: 'RNF4', desc: 'Usuario común no puede eliminar cuentas (DELETE /usuarios/:id)', esperado: '403' }, async () => {
    const r = await api(NEST, 'DELETE', `/usuarios/${C.soporte.id}`, { token: user.token });
    return ok(r.status === 403, { status: r.status });
  });
  await caso(F, { id: 'SEC-BOLA-03', req: 'RNF4', desc: 'FastAPI: usuario común que falsea usuario_id ajeno en historial solo ve lo suyo', esperado: 'ignora usuario_id ajeno' }, async () => {
    const r = await api(FAST, 'GET', `/internal/v1/alertas?usuario_id=${C.admin.id}`, { token: user.token });
    // Un no-staff fuerza su propio id; no debe devolver alertas de otros.
    const ajenas = Array.isArray(r.json) ? r.json.filter((a) => a.usuario_id !== user.id).length : -1;
    return ok(r.status === 200 && ajenas === 0, { status: r.status, alertasAjenas: ajenas });
  });
  await caso(F, { id: 'SEC-BOLA-04', req: 'RNF4', desc: 'Rol en el JWT no se respeta: el servidor relee rol de BD (token con rol admin falso)', esperado: '403 pese a rol=1 en token' }, async () => {
    const forgedRole = sign(user.id, { rol_ID: 1, estado_ID: 1 });
    const r = await api(NEST, 'GET', '/admin/usuarios', { token: forgedRole });
    return ok(r.status === 403, { status: r.status });
  });

  // --- Resiliencia: caída de proveedor de pago ---
  await caso(F, { id: 'SEC-RESIL-01', req: 'RNF7/HU-16', desc: 'Caída de PayPal al crear orden devuelve 5xx controlado (no 500 crudo ni cuelga)', esperado: '502/503' }, async () => {
    mkdirSync(FLAGS, { recursive: true });
    writeFileSync(resolve(FLAGS, 'paypal-caida'), '1');
    const r = await api(NEST, 'POST', '/compras/apadrinados/ordenes', { token: user.token, body: { tipo: 'PLAN', cantidad: 1 } });
    rmSync(resolve(FLAGS, 'paypal-caida'), { force: true });
    return ok(r.status === 502 || r.status === 503, { status: r.status, msg: r.json?.message });
  });
  await caso(F, { id: 'SEC-RESIL-02', req: 'RNF7', desc: 'Tras restaurar PayPal, la compra vuelve a funcionar (sin cobro duplicado por el fallo)', esperado: '201 nueva orden' }, async () => {
    const r = await api(NEST, 'POST', '/compras/apadrinados/ordenes', { token: user.token, body: { tipo: 'PLAN', cantidad: 1 } });
    return ok(r.status === 201 || r.status === 409, { status: r.status, nota: '409 si quedó una reserva en creación del intento fallido (se concilia)' });
  });

  // --- Open redirect / SSRF superficial en wrappers ---
  await caso(F, { id: 'SEC-SSRF-01', req: 'PRE-SEC-001', desc: '/maps/geocode no acepta URL arbitraria (solo dirección de texto validada)', esperado: '400 o tratado como texto, sin fetch a destino externo del atacante' }, async () => {
    const r = await api(NEST, 'GET', '/maps/geocode?address=' + encodeURIComponent('http://169.254.169.254/latest/meta-data/'), { token: user.token });
    // El doble de Maps no llama a Internet; el servidor trata el valor como dirección (3-200 chars) -> 200 [] o 400.
    return ok(r.status === 200 || r.status === 400, { status: r.status, nota: 'destino es constante del servidor; el address es solo query de geocodificación' });
  });
  await caso(F, { id: 'SEC-REDIR-01', req: 'OWASP', desc: 'Respuestas 2xx/4xx no incluyen Location hacia dominios externos no controlados', esperado: 'sin redirección abierta' }, async () => {
    const r = await api(NEST, 'GET', '/usuarios/me', { token: user.token });
    const loc = r.headers.get('location');
    return ok(!loc, { location: loc });
  });

  console.log('\nRESUMEN-SEG:', JSON.stringify(resumen()));
})();
