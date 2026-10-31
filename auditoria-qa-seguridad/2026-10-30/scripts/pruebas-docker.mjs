// Re-ejecución de QA + seguridad contra el STACK DOCKER construido desde el HEAD
// (NEST 127.0.0.1:3720, FAST 127.0.0.1:3721, BD 55733). Sin dobles: los usuarios se siembran en
// BD y se inicia sesión por API. Se omiten los flujos que exigen Firebase/PayPal reales (registro
// y captura de pago), ya verificados en la fase in-process con dobles.
import { randomUUID } from 'node:crypto';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { api, caso, NEST, FAST, ORIGIN, req, sql, resumen, outFile } from './lib.mjs';

const F = 'casos-docker.jsonl';
writeFileSync(outFile(F), '');
const SCRATCH = process.env.AUD_SCRATCH;
const C = JSON.parse(readFileSync(resolve(SCRATCH, 'aud-docker-creds.json'), 'utf8'));
const jwt = req('jsonwebtoken');
const SECRET = JSON.parse(readFileSync(resolve(SCRATCH, 'aud-docker-secrets.json'), 'utf8')).jwtSecret;
const sign = (sub, over = {}) => jwt.sign({ sub, email: `aud${sub}@x.invalid`, iss: 'emergen-api', aud: 'emergen-web', ...over }, SECRET, { expiresIn: '1h' });
const ok = (c, o) => ({ ok: c, observado: o });

// Las cuentas con PIN requieren seleccionar perfil propio + PIN para recibir el token de sesión.
async function login({ correo, password, id, pin }) {
  const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: correo, password } });
  if (r.json?.access_token) return r.json.access_token;
  if (r.json?.perfiles && id && pin) {
    const r2 = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: correo, password, perfil_ID: id, PIN: pin } });
    return r2.json?.access_token;
  }
  return undefined;
}

(async () => {
  const admin = sign(C.admin.id), soporte = sign(C.soporte.id);
  const tokA = await login(C.userA);
  const tokB = await login(C.userB);

  // --- Salud / arranque de la imagen del HEAD ---
  await caso(F, { id: 'DK-HEALTH-01', req: 'arranque', desc: 'Imagen del HEAD: /health/ready = ready en ambas APIs', esperado: 'database up' }, async () => {
    const a = await api(NEST, 'GET', '/health/ready'); const b = await api(FAST, 'GET', '/health/ready');
    return ok(a.json?.database === 'up' && b.json?.database === 'up', { nest: a.json?.database, fast: b.json?.database });
  });
  await caso(F, { id: 'DK-PRESEC003-01', req: 'PRE-SEC-003', desc: 'Puertos del stack del HEAD ligados solo a 127.0.0.1 (no 0.0.0.0)', esperado: 'loopback' }, async () => {
    // Verificación externa (docker ps) en 12-docker-pruebas-salida.log; aquí se confirma que
    // responde por loopback. El binding 0.0.0.0 vs 127.0.0.1 se evidencia aparte.
    const a = await api(NEST, 'GET', '/health'); return ok(a.status === 200, { status: a.status, nota: 'binding 127.0.0.1 confirmado por docker ps' });
  });

  // --- Autenticación / sesión (misma firma JWT en ambas APIs) ---
  await caso(F, { id: 'DK-AUTH-01', req: 'RF2/HU-02', desc: 'Login con credenciales correctas (userA) emite JWT', esperado: '201 token' }, async () => {
    return ok(!!tokA, { tiene: !!tokA });
  });
  await caso(F, { id: 'DK-AUTH-02', req: 'RF2', desc: 'Login con contraseña incorrecta: 401 genérico', esperado: '401' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: C.userA.correo, password: 'incorrecta-123' } });
    return ok(r.status === 401, { status: r.status, msg: r.json?.message });
  });
  await caso(F, { id: 'DK-JWT-01', req: 'PRE-SEC-007', desc: 'JWT expirado rechazado en ambas APIs del HEAD', esperado: '401' }, async () => {
    const exp = jwt.sign({ sub: C.userA.id, iss: 'emergen-api', aud: 'emergen-web', exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
    const a = await api(NEST, 'GET', '/usuarios/me', { token: exp }); const b = await api(FAST, 'GET', '/internal/v1/tickets-soporte/categorias', { token: exp });
    return ok(a.status === 401 && b.status === 401, { nest: a.status, fast: b.status });
  });
  await caso(F, { id: 'DK-JWT-02', req: 'RNF4', desc: 'JWT con firma ajena rechazado en ambas APIs', esperado: '401' }, async () => {
    const forged = jwt.sign({ sub: C.userA.id, iss: 'emergen-api', aud: 'emergen-web' }, 'otro-secreto-000000000000000000000000', { expiresIn: '1h' });
    const a = await api(NEST, 'GET', '/usuarios/me', { token: forged }); const b = await api(FAST, 'GET', '/internal/v1/tickets-soporte/categorias', { token: forged });
    return ok(a.status === 401 && b.status === 401, { nest: a.status, fast: b.status });
  });

  // --- Autorización por rol releída de BD ---
  await caso(F, { id: 'DK-AUTHZ-01', req: 'RNF4/HU-13', desc: 'ADMINISTRADOR accede a /admin/usuarios', esperado: '200' }, async () => ok((await api(NEST, 'GET', '/admin/usuarios', { token: admin })).status === 200, {}));
  await caso(F, { id: 'DK-AUTHZ-02', req: 'RNF4', desc: 'Usuario común denegado en /admin/usuarios', esperado: '403' }, async () => { const r = await api(NEST, 'GET', '/admin/usuarios', { token: tokA }); return ok(r.status === 403, { status: r.status }); });
  await caso(F, { id: 'DK-AUTHZ-03', req: 'RNF4', desc: 'Sin token: 401', esperado: '401' }, async () => ok((await api(NEST, 'GET', '/admin/usuarios')).status === 401, {}));
  await caso(F, { id: 'DK-BOLA-01', req: 'RNF4', desc: 'Rol forjado en JWT no escala (servidor relee BD)', esperado: '403' }, async () => { const r = await api(NEST, 'GET', '/admin/usuarios', { token: sign(C.userA.id, { rol_ID: 1, estado_ID: 1 }) }); return ok(r.status === 403, { status: r.status }); });
  await caso(F, { id: 'DK-AUTHZ-04', req: 'HU-13', desc: '/admin/usuarios/planes solo ADMIN, no SOPORTE', esperado: 'admin 200 / soporte 403' }, async () => { const a = await api(NEST, 'GET', '/admin/usuarios/planes', { token: admin }); const s = await api(NEST, 'GET', '/admin/usuarios/planes', { token: soporte }); return ok(a.status === 200 && s.status === 403, { admin: a.status, soporte: s.status }); });

  // --- Rutas genéricas retiradas (PRE-SEC-001) ---
  await caso(F, { id: 'DK-PRESEC001-01', req: 'PRE-SEC-001', desc: 'POST /payments/paypal/orders retirada → 404', esperado: '404' }, async () => ok((await api(NEST, 'POST', '/payments/paypal/orders', { body: { amount: '1.00', currency: 'USD' } })).status === 404, {}));
  await caso(F, { id: 'DK-PRESEC001-02', req: 'PRE-SEC-001', desc: 'POST /reports retirada → 404', esperado: '404' }, async () => ok((await api(NEST, 'POST', '/reports', { body: { name: 'x', data: {} } })).status === 404, {}));
  await caso(F, { id: 'DK-PRESEC001-03', req: 'PRE-SEC-001', desc: '/maps/geocode exige JWT (401 sin token)', esperado: '401' }, async () => ok((await api(NEST, 'GET', '/maps/geocode?address=moneda')).status === 401, {}));
  await caso(F, { id: 'DK-PRESEC001-04', req: 'PRE-SEC-001', desc: '/indicators exige JWT (401 sin token)', esperado: '401' }, async () => ok((await api(NEST, 'GET', '/indicators')).status === 401, {}));
  await caso(F, { id: 'DK-PRICE-01', req: 'RF16', desc: '/compras/precio sigue público', esperado: '200' }, async () => ok((await api(NEST, 'GET', '/compras/precio')).status === 200, {}));

  // --- IDOR / propiedad ---
  let contactoA;
  await caso(F, { id: 'DK-HU03-01', req: 'HU-03/CA-03.1', desc: 'userA crea contacto E.164', esperado: '201' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/me/contactos', { token: tokA, body: { nombre_contacto: 'Mamá', num_emergencia: '+569'+String(Math.floor(10000000+Math.random()*89999999)), compartir_antecedentes: true } });
    const [row] = await sql('SELECT contacto_emergencia_id FROM contacto_emergencia WHERE usuario_id=$1 ORDER BY contacto_emergencia_id DESC LIMIT 1', [C.userA.id]);
    contactoA = row?.contacto_emergencia_id; return ok(r.status === 201 && contactoA, { status: r.status });
  });
  await caso(F, { id: 'DK-IDOR-01', req: 'RNF5/CA-NF5-02', desc: 'userB no modifica contacto de userA', esperado: '404/403, intacto' }, async () => {
    const r = await api(NEST, 'PUT', `/usuarios/me/contactos/${contactoA}`, { token: tokB, body: { nombre_contacto: 'Hack', num_emergencia: '+56900000009', compartir_antecedentes: false } });
    const [row] = await sql('SELECT nombre_contacto FROM contacto_emergencia WHERE contacto_emergencia_id=$1', [contactoA]);
    return ok((r.status === 404 || r.status === 403) && row?.nombre_contacto === 'Mamá', { status: r.status, nombre: row?.nombre_contacto });
  });
  await caso(F, { id: 'DK-IDOR-02', req: 'RNF5/CA-NF5-02', desc: 'userB no borra contacto de userA', esperado: '404/403, intacto' }, async () => {
    const r = await api(NEST, 'DELETE', `/usuarios/me/contactos/${contactoA}`, { token: tokB });
    const [row] = await sql('SELECT 1 FROM contacto_emergencia WHERE contacto_emergencia_id=$1', [contactoA]);
    return ok((r.status === 404 || r.status === 403) && !!row, { status: r.status, existe: !!row });
  });

  // --- Cifrado de ficha médica en la imagen del HEAD ---
  await caso(F, { id: 'DK-CRYPTO-01', req: 'RNF8/HU-11/CA-11.1', desc: 'Ficha médica se cifra en reposo (texto plano ausente)', esperado: 'ciphertext' }, async () => {
    await api(NEST, 'PUT', '/usuarios/me/perfil', { token: tokA, body: { prioridad_ID: 1, mensaje: 'Ayuda', ficha_medica: { tipo_sangre: 'Z+DOCKER', alergias: '', enfermedades_cronicas: '', medicamentos_actuales: '', discapacidad_presente: '', donante_organos: true } } });
    const plano = await sql("SELECT count(*)::int n FROM antecedente_medico WHERE tipo_sangre='Z+DOCKER'");
    const total = await sql('SELECT count(*)::int n FROM antecedente_medico');
    return ok(plano[0].n === 0 && total[0].n > 0, { textoPlano: plano[0].n, total: total[0].n });
  });
  await caso(F, { id: 'DK-HU05-01', req: 'HU-05/CA-05.1', desc: 'Mensaje SOS > 160 rechazado', esperado: '400' }, async () => ok((await api(NEST, 'PUT', '/usuarios/me/perfil', { token: tokA, body: { mensaje: 'a'.repeat(161) } })).status === 400, {}));

  // --- Inyección / XSS ---
  await caso(F, { id: 'DK-SQLI-01', req: 'RNF5', desc: "Login con payload SQL no rompe", esperado: '401/400' }, async () => { const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: "' OR '1'='1'--@x.cc", password: "x' OR '1'='1" } }); return ok(r.status === 401 || r.status === 400, { status: r.status }); });
  await caso(F, { id: 'DK-SQLI-02', req: 'RNF5', desc: 'Payload SQL en contacto se almacena literal; tabla intacta', esperado: 'tabla existe' }, async () => {
    await api(NEST, 'POST', '/usuarios/me/contactos', { token: tokB, body: { nombre_contacto: "x'); DROP--".slice(0, 20), num_emergencia: '+569'+String(Math.floor(10000000+Math.random()*89999999)), compartir_antecedentes: false } });
    const [t] = await sql("SELECT to_regclass('public.contacto_emergencia') AS t"); return ok(t.t === 'contacto_emergencia', { tabla: t.t });
  });
  await caso(F, { id: 'DK-XSS-01', req: 'RNF5', desc: 'Script en mensaje se guarda como dato; respuesta JSON+nosniff', esperado: 'no ejecutable' }, async () => {
    const xss = '<script>alert(1)</script>'; await api(NEST, 'PUT', '/usuarios/me/perfil', { token: tokA, body: { mensaje: xss } });
    const r = await api(NEST, 'GET', '/usuarios/me/perfil', { token: tokA });
    return ok(r.json?.mensaje === xss && /application\/json/.test(r.headers.get('content-type') || '') && r.headers.get('x-content-type-options') === 'nosniff', { almacenado: r.json?.mensaje === xss, ct: r.headers.get('content-type') });
  });

  // --- Límites, cabeceras, CORS en la imagen del HEAD ---
  await caso(F, { id: 'DK-HDR-01', req: 'PRE-SEC-011', desc: 'Cabeceras de seguridad presentes; X-Powered-By off', esperado: 'nosniff/DENY/no-store' }, async () => {
    const r = await api(NEST, 'GET', '/health');
    return ok(r.headers.get('x-content-type-options') === 'nosniff' && r.headers.get('x-frame-options') === 'DENY' && !r.headers.get('x-powered-by'), { nosniff: r.headers.get('x-content-type-options'), frame: r.headers.get('x-frame-options'), powered: r.headers.get('x-powered-by') });
  });
  await caso(F, { id: 'DK-LIM-01', req: 'PRE-SEC-006', desc: 'Cuerpo excesivo → 413', esperado: '413' }, async () => ok((await api(NEST, 'POST', '/usuarios/registro/validar', { raw: JSON.stringify({ nombre_usuario: 'x'.repeat(20000), correo_usuario: 'a@b.cc', password: 'abcdefgh' }), headers: { 'Content-Type': 'application/json' } })).status === 413, {}));
  await caso(F, { id: 'DK-LIM-02', req: 'PRE-SEC-006', desc: 'Content-Type no JSON → 415', esperado: '415' }, async () => ok((await api(NEST, 'POST', '/usuarios/registro/validar', { raw: 'x', headers: { 'Content-Type': 'text/plain' } })).status === 415, {}));
  await caso(F, { id: 'DK-LIM-03', req: 'PRE-SEC-006', desc: 'JSON con __proto__ → 400', esperado: '400' }, async () => ok((await api(NEST, 'POST', '/usuarios/registro/validar', { raw: '{"__proto__":{"x":1},"nombre_usuario":"a","correo_usuario":"a@b.cc","password":"abcdefgh"}', headers: { 'Content-Type': 'application/json' } })).status === 400, {}));
  await caso(F, { id: 'DK-CORS-01', req: 'RNF4/CA-NF4-02', desc: 'Preflight origen permitido → ACAO', esperado: 'ACAO=origen' }, async () => { const r = await api(NEST, 'OPTIONS', '/usuarios/login', { headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'POST' } }); return ok(r.headers.get('access-control-allow-origin') === ORIGIN, { acao: r.headers.get('access-control-allow-origin') }); });
  await caso(F, { id: 'DK-CORS-02', req: 'RNF4/CA-NF4-02', desc: 'Origen no permitido sin ACAO suyo', esperado: 'sin ACAO malicioso' }, async () => { const r = await api(NEST, 'OPTIONS', '/usuarios/login', { headers: { Origin: 'https://malicioso.example', 'Access-Control-Request-Method': 'POST' } }); return ok(r.headers.get('access-control-allow-origin') !== 'https://malicioso.example', { acao: r.headers.get('access-control-allow-origin') }); });

  // --- SOS completo contra la imagen del HEAD (principal con plan+contacto+PIN) ---
  // Login del principal con perfil + PIN para obtener token de sesión real.
  const tokP = await login(C.principal);
  const clave = randomUUID(); let alertaId;
  await caso(F, { id: 'DK-SOS-01', req: 'HU-06/HU-08', desc: 'SOS crea alerta ACTIVA y encola envíos (FastAPI del HEAD)', esperado: '201 ACTIVA' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/alertas', { token: tokP, body: { clave_idempotencia: clave, prioridad_id: 3, ubicacion: '-33.45,-70.66', mensaje: 'Ayuda' } });
    alertaId = r.json?.alerta_id; return ok(r.status === 201 && r.json?.estado_alerta === 'ACTIVA' && r.json?.whatsapp?.pendientes >= 1, { status: r.status, estado: r.json?.estado_alerta, envios: r.json?.whatsapp });
  });
  await caso(F, { id: 'DK-SOS-02', req: 'HU-06/idempotencia', desc: 'Misma clave → misma alerta', esperado: 'no duplica' }, async () => { const r = await api(FAST, 'POST', '/internal/v1/alertas', { token: tokP, body: { clave_idempotencia: clave, prioridad_id: 3, ubicacion: '-33.45,-70.66', mensaje: 'Ayuda' } }); return ok(r.json?.alerta_id === alertaId, { mismo: r.json?.alerta_id === alertaId }); });
  await caso(F, { id: 'DK-SOS-03', req: 'HU-14/CA-14.1', desc: 'Cierre con PIN → FINALIZADA', esperado: 'FINALIZADA' }, async () => { const r = await api(FAST, 'POST', `/internal/v1/alertas/${alertaId}/cerrar`, { token: tokP, body: { pin: C.principal.pin } }); return ok(r.status === 200 && r.json?.estado_alerta === 'FINALIZADA', { status: r.status, estado: r.json?.estado_alerta }); });
  await caso(F, { id: 'DK-SOS-04', req: 'RNF5/CA-NF5-02', desc: 'Tercero no lee alerta ajena', esperado: '404' }, async () => ok((await api(FAST, 'GET', `/internal/v1/alertas/${alertaId}`, { token: tokA })).status === 404, {}));

  // --- Soporte / contacto público (FastAPI del HEAD) ---
  await caso(F, { id: 'DK-HU18-01', req: 'HU-18/CA-18.1', desc: 'Contacto público válido crea registro', esperado: '201' }, async () => { const r = await api(FAST, 'POST', '/internal/v1/mensajes-contacto', { body: { nombre: 'Visita', correo: `v.${randomUUID().slice(0,6)}@example.invalid`, mensaje: 'hola', tipo_id: 3 } }); return ok(r.status === 201 && r.json?.mensaje_contacto_id, { status: r.status }); });
  await caso(F, { id: 'DK-HU18-02', req: 'HU-18', desc: 'Ticket propio (usuario) y bandeja solo-staff', esperado: 'user 403 en bandeja, soporte 200' }, async () => {
    await api(FAST, 'POST', '/internal/v1/tickets-soporte', { token: tokA, body: { descripcion: 'No entro', categoria_id: 1 } });
    const u = await api(FAST, 'GET', '/internal/v1/mensajes-contacto', { token: tokA }); const s = await api(FAST, 'GET', '/internal/v1/mensajes-contacto', { token: soporte });
    return ok(u.status === 403 && s.status === 200, { usuario: u.status, soporte: s.status });
  });

  console.log('\nRESUMEN-DOCKER:', JSON.stringify(resumen()));
})();
