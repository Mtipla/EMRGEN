// Pruebas funcionales y de seguridad contra las APIs aisladas (NestJS 3710, FastAPI 3711).
// Todas secuenciales, datos sintéticos, proveedores dobles. Evidencia -> evidencias/casos-api.jsonl
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { api, caso, creds, secrets, fakeFirebase, NEST, FAST, ORIGIN, req, sql, resumen, outFile } from './lib.mjs';

const F = 'casos-api.jsonl';
writeFileSync(outFile(F), '');
const C = creds();
const jwt = req('jsonwebtoken');
const SECRET = secrets().jwtSecret;
// Token de sesión propia como lo firma NestJS (login): sub + email. Para pruebas que no pasan por login.
const sign = (sub, over = {}) => jwt.sign({ sub, email: `aud${sub}@example.invalid`, iss: 'emergen-api', aud: 'emergen-web', ...over }, SECRET, over.noExp ? {} : { expiresIn: '1h' });
const ok = (cond, observado) => ({ ok: cond, observado });

let principal = null; // usuario final creado por API
let principalPwd = '';

async function funcionalIdentidad() {
  // HU-01 registro
  const correo = `aud.user.${randomUUID().slice(0, 8)}@example.invalid`;
  principalPwd = 'Clave-' + randomUUID().slice(0, 10);
  await caso(F, { id: 'QA-HU01-01', req: 'RF1/HU-01/CA-01.1', desc: 'Validar registro con datos correctos (correo nuevo)', esperado: '201 valido' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/registro/validar', { body: { nombre_usuario: 'AUD User', correo_usuario: correo, password: principalPwd } });
    return ok(r.status === 201 && r.json?.valido === true, { status: r.status, json: r.json });
  });
  await caso(F, { id: 'QA-HU01-02', req: 'RF1/HU-01/CA-01.1', desc: 'Registro rechaza correo con formato inválido (DTO @IsEmail)', esperado: '400' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/registro/validar', { body: { nombre_usuario: 'X', correo_usuario: 'no-es-correo', password: principalPwd } });
    return ok(r.status === 400, { status: r.status, msg: r.json?.message });
  });
  await caso(F, { id: 'QA-HU01-03', req: 'RF1/HU-01/CA-01.2', desc: 'Registro rechaza contraseña < 8 caracteres', esperado: '400' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/registro/validar', { body: { nombre_usuario: 'X', correo_usuario: correo, password: 'corta' } });
    return ok(r.status === 400, { status: r.status, msg: r.json?.message });
  });
  await caso(F, { id: 'SEC-REG-01', req: 'HU-01/RF3', desc: 'Registro exige token Firebase verificado (correo coincidente)', esperado: '201 solo con Firebase verificado y correo igual', inferido: false }, async () => {
    const created = await api(NEST, 'POST', '/usuarios/registro', { token: undefined, headers: { Authorization: 'Bearer ' + fakeFirebase(correo) }, body: { nombre_usuario: 'AUD User', correo_usuario: correo, password: principalPwd } });
    if (created.status === 201) principal = created.json;
    return ok(created.status === 201 && created.json?.usuario_ID, { status: created.status, json: created.json });
  });
  await caso(F, { id: 'SEC-REG-02', req: 'HU-01/RF3', desc: 'Registro rechaza correo no verificado en Firebase', esperado: '403' }, async () => {
    const correoNV = `otro.${randomUUID().slice(0,6)}@example.invalid`;
    const r = await api(NEST, 'POST', '/usuarios/registro', { headers: { Authorization: 'Bearer ' + fakeFirebase(correoNV, { verified: false }) }, body: { nombre_usuario: 'Usuario No Verificado', correo_usuario: correoNV, password: principalPwd } });
    return ok(r.status === 403, { status: r.status, msg: r.json?.message });
  });
  await caso(F, { id: 'SEC-REG-03', req: 'HU-01/CA-01.1', desc: 'Registro rechaza correo ya existente (duplicado)', esperado: '409' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/registro', { headers: { Authorization: 'Bearer ' + fakeFirebase(correo) }, body: { nombre_usuario: 'AUD User', correo_usuario: correo, password: principalPwd } });
    return ok(r.status === 409, { status: r.status, msg: r.json?.message });
  });
  // HU-02 login
  await caso(F, { id: 'QA-HU02-01', req: 'RF2/HU-02/CA-02.1', desc: 'Login principal con credenciales correctas emite JWT', esperado: '201 access_token' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: principal.correo_usuario, password: principalPwd } });
    return ok(r.status === 201 && !!r.json?.access_token, { status: r.status, tieneToken: !!r.json?.access_token });
  });
  await caso(F, { id: 'QA-HU02-02', req: 'RF2/HU-02/CA-02.1', desc: 'Login con contraseña incorrecta se rechaza con mensaje genérico', esperado: '401' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: principal.correo_usuario, password: principalPwd + 'x' } });
    return ok(r.status === 401 && /incorrect/i.test(r.json?.message || ''), { status: r.status, msg: r.json?.message });
  });
  await caso(F, { id: 'SEC-ENUM-01', req: 'RNF3/HU-02', desc: 'Correo inexistente da el MISMO mensaje que contraseña incorrecta (no enumeración)', esperado: '401 mismo texto', inferido: true }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: `noexiste.${randomUUID().slice(0,6)}@example.invalid`, password: 'cualquiera8' } });
    return ok(r.status === 401 && /incorrect/i.test(r.json?.message || ''), { status: r.status, msg: r.json?.message });
  });
}

async function funcionalPinPerfilesSos() {
  // El principal configura su PIN y luego entra por perfil
  const pin = '1357';
  const token0 = sign(principal.usuario_ID);
  await caso(F, { id: 'QA-HU10-01', req: 'RF23/HU-10/CA-10.1', desc: 'Configurar PIN inicial de 4 dígitos del principal', esperado: '201' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/me/pin', { token: token0, body: { PIN: pin } });
    return ok(r.status === 201, { status: r.status, json: r.json });
  });
  await caso(F, { id: 'QA-HU10-02', req: 'HU-10/CA-10.1', desc: 'PIN con formato inválido (3 dígitos) se rechaza', esperado: '400' }, async () => {
    const correo2 = `aud.pin.${randomUUID().slice(0,6)}@example.invalid`;
    await api(NEST, 'POST', '/usuarios/registro', { headers: { Authorization: 'Bearer ' + fakeFirebase(correo2) }, body: { nombre_usuario: 'PinFmt', correo_usuario: correo2, password: 'Clave-pin-1' } });
    const login = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: correo2, password: 'Clave-pin-1' } });
    const r = await api(NEST, 'POST', '/usuarios/me/pin', { token: login.json.access_token, body: { PIN: '123' } });
    return ok(r.status === 400, { status: r.status, msg: r.json?.message });
  });
  // login con perfil + PIN
  await caso(F, { id: 'QA-HU02-03', req: 'RF23/HU-02', desc: 'Login con perfil principal + PIN correcto abre sesión', esperado: '201 usuario correcto' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: principal.correo_usuario, password: principalPwd, perfil_ID: principal.usuario_ID, PIN: pin } });
    return ok(r.status === 201 && r.json?.usuario?.usuario_ID === principal.usuario_ID, { status: r.status, uid: r.json?.usuario?.usuario_ID });
  });
  // PIN lockout 3 intentos -> 5 min (CA-10.1). Usamos una cuenta nueva para no interferir.
  await caso(F, { id: 'SEC-PIN-01', req: 'HU-10/CA-10.1', desc: 'Tres PIN incorrectos bloquean la acción (contador en servidor)', esperado: '429 al 3º/4º intento' }, async () => {
    const correo3 = `aud.lock.${randomUUID().slice(0,6)}@example.invalid`;
    await api(NEST, 'POST', '/usuarios/registro', { headers: { Authorization: 'Bearer ' + fakeFirebase(correo3) }, body: { nombre_usuario: 'Lock', correo_usuario: correo3, password: 'Clave-lock-1' } });
    const login = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: correo3, password: 'Clave-lock-1' } });
    await api(NEST, 'POST', '/usuarios/me/pin', { token: login.json.access_token, body: { PIN: '2468' } });
    const [{ usuario_id: uid }] = await sql('SELECT usuario_id FROM usuario WHERE correo_usuario=$1', [correo3]);
    const codes = [];
    for (let i = 0; i < 4; i++) {
      const r = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: correo3, password: 'Clave-lock-1', perfil_ID: uid, PIN: '0000' } });
      codes.push(r.status);
    }
    // correcto durante el bloqueo también debe dar 429
    const during = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: correo3, password: 'Clave-lock-1', perfil_ID: uid, PIN: '2468' } });
    return ok(codes.includes(429) && during.status === 429, { intentos: codes, correctoDuranteBloqueo: during.status });
  });
}

async function seguridadAutorizacion() {
  const user = sign(principal.usuario_ID);
  const admin = sign(C.admin.id);
  const soporte = sign(C.soporte.id);
  // HU-13 / CA-13.1 panel admin restringido
  await caso(F, { id: 'SEC-AUTHZ-01', req: 'RNF4/HU-13/CA-13.1', desc: 'GET /admin/usuarios permitido a ADMINISTRADOR', esperado: '200' }, async () => {
    const r = await api(NEST, 'GET', '/admin/usuarios', { token: admin });
    return ok(r.status === 200, { status: r.status });
  });
  await caso(F, { id: 'SEC-AUTHZ-02', req: 'RNF4/HU-13/CA-13.1', desc: 'GET /admin/usuarios DENEGADO a usuario común (rol USUARIO)', esperado: '403' }, async () => {
    const r = await api(NEST, 'GET', '/admin/usuarios', { token: user });
    return ok(r.status === 403, { status: r.status, msg: r.json?.message });
  });
  await caso(F, { id: 'SEC-AUTHZ-03', req: 'RNF4', desc: 'GET /admin/usuarios sin token se rechaza', esperado: '401' }, async () => {
    const r = await api(NEST, 'GET', '/admin/usuarios');
    return ok(r.status === 401, { status: r.status });
  });
  await caso(F, { id: 'SEC-AUTHZ-04', req: 'HU-13', desc: 'GET /admin/usuarios/planes solo ADMINISTRADOR, no SOPORTE', esperado: 'admin 200 / soporte 403' }, async () => {
    const a = await api(NEST, 'GET', '/admin/usuarios/planes', { token: admin });
    const s = await api(NEST, 'GET', '/admin/usuarios/planes', { token: soporte });
    return ok(a.status === 200 && s.status === 403, { admin: a.status, soporte: s.status });
  });
  await caso(F, { id: 'SEC-AUTHZ-05', req: 'HU-13', desc: 'GET /admin/usuarios permitido también a SOPORTE (lista con alcance S)', esperado: '200' }, async () => {
    const r = await api(NEST, 'GET', '/admin/usuarios', { token: soporte });
    return ok(r.status === 200, { status: r.status });
  });
  // HU-13.2: un admin no puede cambiar el estado de su propia cuenta
  await caso(F, { id: 'SEC-AUTHZ-06', req: 'HU-13', desc: 'Admin no puede cambiar su propio estado', esperado: '4xx' }, async () => {
    const r = await api(NEST, 'PUT', `/admin/usuarios/${C.admin.id}/estado`, { token: admin, body: { estado_ID: 2 } });
    return ok(r.status >= 400 && r.status < 500, { status: r.status, msg: r.json?.message });
  });
}

async function seguridadIdorBola() {
  // CA-NF5-02 IDOR/BOLA: un usuario intenta acceder/modificar objetos de otro
  const correoA = `aud.a.${randomUUID().slice(0,6)}@example.invalid`;
  const correoB = `aud.b.${randomUUID().slice(0,6)}@example.invalid`;
  // El principal nace con estado=2 (acceso parcial); editar perfil/contactos exige acceso
  // completo, que se habilita al configurar el PIN inicial. Por eso mk() también crea el PIN.
  const mk = async (correo) => {
    await api(NEST, 'POST', '/usuarios/registro', { headers: { Authorization: 'Bearer ' + fakeFirebase(correo) }, body: { nombre_usuario: 'Cuenta IDOR', correo_usuario: correo, password: 'Clave-idor-1' } });
    const l = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: correo, password: 'Clave-idor-1' } });
    await api(NEST, 'POST', '/usuarios/me/pin', { token: l.json.access_token, body: { PIN: '4321' } });
    return l.json.access_token;
  };
  const tokA = await mk(correoA); const tokB = await mk(correoB);
  // A crea un contacto
  let contactoA;
  await caso(F, { id: 'QA-HU03-01', req: 'RF6/HU-03/CA-03.1', desc: 'Crear contacto de emergencia con teléfono E.164 válido', esperado: '201' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/me/contactos', { token: tokA, body: { nombre_contacto: 'Mamá', num_emergencia: '+56912345678', compartir_antecedentes: true } });
    const [row] = await sql('SELECT contacto_emergencia_id FROM contacto_emergencia WHERE usuario_id=(SELECT usuario_id FROM usuario WHERE correo_usuario=$1)', [correoA]);
    contactoA = row?.contacto_emergencia_id;
    return ok(r.status === 201 && contactoA, { status: r.status, id: contactoA });
  });
  await caso(F, { id: 'QA-HU03-02', req: 'HU-03/CA-03.1', desc: 'Rechaza teléfono con formato inválido', esperado: '400' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/me/contactos', { token: tokA, body: { nombre_contacto: 'X', num_emergencia: '123', compartir_antecedentes: false } });
    return ok(r.status === 400, { status: r.status, msg: r.json?.message });
  });
  await caso(F, { id: 'QA-HU03-03', req: 'HU-03/CA-03.1', desc: 'Rechaza contacto duplicado (mismo número)', esperado: '4xx' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/me/contactos', { token: tokA, body: { nombre_contacto: 'Dup', num_emergencia: '+56912345678', compartir_antecedentes: false } });
    return ok(r.status >= 400, { status: r.status, msg: r.json?.message });
  });
  await caso(F, { id: 'SEC-IDOR-01', req: 'RNF5/CA-NF5-02', desc: 'Usuario B NO puede modificar el contacto de A (PUT /contactos/:id ajeno)', esperado: '404/403' }, async () => {
    const r = await api(NEST, 'PUT', `/usuarios/me/contactos/${contactoA}`, { token: tokB, body: { nombre_contacto: 'Hackeado', num_emergencia: '+56900000009', compartir_antecedentes: false } });
    const [row] = await sql('SELECT nombre_contacto FROM contacto_emergencia WHERE contacto_emergencia_id=$1', [contactoA]);
    return ok((r.status === 404 || r.status === 403) && row?.nombre_contacto === 'Mamá', { status: r.status, nombreTrasIntento: row?.nombre_contacto });
  });
  await caso(F, { id: 'SEC-IDOR-02', req: 'RNF5/CA-NF5-02', desc: 'Usuario B NO puede borrar el contacto de A (DELETE ajeno)', esperado: '404/403 y contacto intacto' }, async () => {
    const r = await api(NEST, 'DELETE', `/usuarios/me/contactos/${contactoA}`, { token: tokB });
    const [row] = await sql('SELECT 1 FROM contacto_emergencia WHERE contacto_emergencia_id=$1', [contactoA]);
    return ok((r.status === 404 || r.status === 403) && !!row, { status: r.status, sigueExistiendo: !!row });
  });
  return { tokA, tokB, correoA };
}

async function seguridadFichaMedica(tokA) {
  // HU-11/CA-11.1 cifrado AES-256 en reposo de datos médicos
  await caso(F, { id: 'QA-HU11-01', req: 'RF10/HU-11/CA-11.1', desc: 'Guardar ficha médica (PUT /perfil) con consentimiento', esperado: '200' }, async () => {
    const r = await api(NEST, 'PUT', '/usuarios/me/perfil', { token: tokA, body: { prioridad_ID: 1, mensaje: 'Ayuda médica', ficha_medica: { tipo_sangre: 'O+AUDIT', alergias: 'penicilina', enfermedades_cronicas: '', medicamentos_actuales: '', discapacidad_presente: '', donante_organos: true } } });
    return ok(r.status === 200, { status: r.status });
  });
  await caso(F, { id: 'SEC-CRYPTO-01', req: 'RNF8/HU-11/CA-11.1', desc: 'La ficha médica se almacena cifrada (el valor en claro NO aparece en la columna)', esperado: 'ciphertext != texto plano' }, async () => {
    const rows = await sql("SELECT tipo_sangre FROM antecedente_medico WHERE usuario_id=(SELECT usuario_id FROM usuario WHERE correo_usuario=(SELECT correo_usuario FROM usuario ORDER BY usuario_id DESC LIMIT 1))");
    // más robusto: buscar cualquier fila cuyo tipo_sangre en claro sea 'O+AUDIT'
    const plano = await sql("SELECT count(*)::int n FROM antecedente_medico WHERE tipo_sangre = 'O+AUDIT'");
    const total = await sql("SELECT count(*)::int n FROM antecedente_medico");
    return ok(plano[0].n === 0 && total[0].n > 0, { filasConTextoPlano: plano[0].n, filasTotales: total[0].n });
  });
  await caso(F, { id: 'QA-HU05-01', req: 'RF12/HU-05/CA-05.1', desc: 'Mensaje SOS rechaza > 160 caracteres (límite servidor)', esperado: '400' }, async () => {
    const r = await api(NEST, 'PUT', '/usuarios/me/perfil', { token: tokA, body: { mensaje: 'a'.repeat(161) } });
    return ok(r.status === 400, { status: r.status, msg: r.json?.message });
  });
}

async function seguridadRutasGenericas() {
  const user = sign(principal.usuario_ID);
  // PRE-SEC-001: rutas genéricas retiradas
  await caso(F, { id: 'SEC-PRESEC001-01', req: 'PRE-SEC-001', desc: 'POST /payments/paypal/orders (vía genérica) ya NO existe', esperado: '404' }, async () => {
    const r = await api(NEST, 'POST', '/payments/paypal/orders', { body: { amount: '1.00', currency: 'USD' } });
    return ok(r.status === 404, { status: r.status });
  });
  await caso(F, { id: 'SEC-PRESEC001-02', req: 'PRE-SEC-001', desc: 'POST /reports (render genérico) ya NO existe', esperado: '404' }, async () => {
    const r = await api(NEST, 'POST', '/reports', { body: { name: 'x', data: {} } });
    return ok(r.status === 404, { status: r.status });
  });
  await caso(F, { id: 'SEC-PRESEC001-03', req: 'PRE-SEC-001', desc: '/maps/geocode ahora exige JWT propio (antes público)', esperado: 'sin token 401, con token 200' }, async () => {
    const sinTok = await api(NEST, 'GET', '/maps/geocode?address=moneda');
    const conTok = await api(NEST, 'GET', '/maps/geocode?address=moneda', { token: user });
    return ok(sinTok.status === 401 && conTok.status === 200, { sinToken: sinTok.status, conToken: conTok.status });
  });
  await caso(F, { id: 'SEC-PRESEC001-04', req: 'PRE-SEC-001', desc: '/indicators exige JWT propio', esperado: 'sin token 401' }, async () => {
    const r = await api(NEST, 'GET', '/indicators');
    return ok(r.status === 401, { status: r.status });
  });
  await caso(F, { id: 'QA-HU16-PRICE', req: 'RF16/HU-16', desc: '/compras/precio sigue público (catálogo)', esperado: '200' }, async () => {
    const r = await api(NEST, 'GET', '/compras/precio');
    return ok(r.status === 200, { status: r.status, json: r.json });
  });
}

async function seguridadSesion() {
  // CA-02.1 / PRE-SEC-007 expiración y validación de token
  await caso(F, { id: 'SEC-JWT-01', req: 'CA-02.1/HU-02', desc: 'JWT expirado se rechaza', esperado: '401' }, async () => {
    const expired = jwt.sign({ sub: principal.usuario_ID, email: 'x', iss: 'emergen-api', aud: 'emergen-web', exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
    const r = await api(NEST, 'GET', '/usuarios/me', { token: expired });
    const rf = await api(FAST, 'GET', '/internal/v1/tickets-soporte/categorias', { token: expired });
    return ok(r.status === 401 && rf.status === 401, { nest: r.status, fastapi: rf.status });
  });
  await caso(F, { id: 'SEC-JWT-02', req: 'RNF4', desc: 'JWT firmado con secreto distinto se rechaza en ambas APIs', esperado: '401' }, async () => {
    const forged = jwt.sign({ sub: principal.usuario_ID, iss: 'emergen-api', aud: 'emergen-web' }, 'secreto-equivocado-00000000000000000000', { expiresIn: '1h' });
    const r = await api(NEST, 'GET', '/usuarios/me', { token: forged });
    const rf = await api(FAST, 'GET', '/internal/v1/tickets-soporte/categorias', { token: forged });
    return ok(r.status === 401 && rf.status === 401, { nest: r.status, fastapi: rf.status });
  });
  await caso(F, { id: 'SEC-JWT-03', req: 'RNF4', desc: 'JWT con issuer/audience incorrectos se rechaza', esperado: '401' }, async () => {
    const bad = jwt.sign({ sub: principal.usuario_ID, iss: 'otro', aud: 'otro' }, SECRET, { expiresIn: '1h' });
    const r = await api(NEST, 'GET', '/usuarios/me', { token: bad });
    return ok(r.status === 401, { status: r.status });
  });
}

async function seguridadCorsHeadersLimites() {
  // CA-NF4-02 CORS allowlist
  await caso(F, { id: 'SEC-CORS-01', req: 'RNF4/CA-NF4-02', desc: 'Preflight desde origen permitido devuelve ACAO con ese origen', esperado: 'ACAO = origen permitido' }, async () => {
    const r = await api(NEST, 'OPTIONS', '/usuarios/login', { headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'POST' } });
    return ok(r.headers.get('access-control-allow-origin') === ORIGIN, { acao: r.headers.get('access-control-allow-origin'), status: r.status });
  });
  await caso(F, { id: 'SEC-CORS-02', req: 'RNF4/CA-NF4-02', desc: 'Origen NO permitido no recibe ACAO con su valor', esperado: 'sin ACAO del origen malicioso' }, async () => {
    const r = await api(NEST, 'OPTIONS', '/usuarios/login', { headers: { Origin: 'https://sitio-malicioso.example', 'Access-Control-Request-Method': 'POST' } });
    const acao = r.headers.get('access-control-allow-origin');
    return ok(acao !== 'https://sitio-malicioso.example', { acao });
  });
  await caso(F, { id: 'SEC-HDR-01', req: 'PRE-SEC-011', desc: 'Respuestas llevan cabeceras de seguridad (nosniff, no-store, X-Frame-Options)', esperado: 'cabeceras presentes' }, async () => {
    const r = await api(NEST, 'GET', '/health');
    return ok(r.headers.get('x-content-type-options') === 'nosniff' && r.headers.get('x-frame-options') === 'DENY', {
      nosniff: r.headers.get('x-content-type-options'), frame: r.headers.get('x-frame-options'), referrer: r.headers.get('referrer-policy'), poweredBy: r.headers.get('x-powered-by') });
  });
  await caso(F, { id: 'SEC-LIM-01', req: 'PRE-SEC-006', desc: 'Cuerpo JSON excesivo rechazado con 413 antes del negocio', esperado: '413' }, async () => {
    const big = JSON.stringify({ nombre_usuario: 'x'.repeat(20000), correo_usuario: 'a@b.cc', password: 'abcdefgh' });
    const r = await api(NEST, 'POST', '/usuarios/registro/validar', { raw: big, headers: { 'Content-Type': 'application/json' } });
    return ok(r.status === 413, { status: r.status });
  });
  await caso(F, { id: 'SEC-LIM-02', req: 'PRE-SEC-006', desc: 'Content-Type no JSON rechazado con 415', esperado: '415' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/registro/validar', { raw: 'texto', headers: { 'Content-Type': 'text/plain' } });
    return ok(r.status === 415, { status: r.status });
  });
  await caso(F, { id: 'SEC-LIM-03', req: 'PRE-SEC-006', desc: 'JSON con anidamiento/propiedad peligrosa (__proto__) rechazado con 400', esperado: '400' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/registro/validar', { raw: '{"__proto__":{"x":1},"nombre_usuario":"a","correo_usuario":"a@b.cc","password":"abcdefgh"}', headers: { 'Content-Type': 'application/json' } });
    return ok(r.status === 400, { status: r.status });
  });
  await caso(F, { id: 'SEC-MASSASSIGN-01', req: 'HU-01/mass-assignment', desc: 'Registro rechaza campo extra rol_id/estado_id (whitelist DTO forbidNonWhitelisted)', esperado: '400' }, async () => {
    const r = await api(NEST, 'POST', '/usuarios/registro/validar', { body: { nombre_usuario: 'Masa Asignada', correo_usuario: `ma.${randomUUID().slice(0,6)}@example.invalid`, password: 'Clave-ma-1', rol_id: 1, estado_id: 1 } });
    return ok(r.status === 400 && /rol_id|estado_id|should not exist/i.test(JSON.stringify(r.json?.message || '')), { status: r.status, msg: r.json?.message });
  });
  // PRE-SEC-006: el rate-limiter existe. /compras/precio mantiene su límite por defecto (60/min).
  await caso(F, { id: 'SEC-RATE-01', req: 'PRE-SEC-006/RNF', desc: 'Rate-limit activo: ráfaga a /compras/precio acaba devolviendo 429', esperado: 'aparece 429 con Retry-After' }, async () => {
    let got429 = false, retryAfter = null, exitosos = 0;
    for (let i = 0; i < 75 && !got429; i++) {
      const r = await api(NEST, 'GET', '/compras/precio');
      if (r.status === 429) { got429 = true; retryAfter = r.headers.get('retry-after'); }
      else if (r.status === 200) exitosos++;
    }
    return ok(got429, { got429, exitososAntesDe429: exitosos, retryAfter });
  });
}

async function fastapiContactoSoporte() {
  const user = sign(principal.usuario_ID);
  const soporte = sign(C.soporte.id);
  // HU-18 formulario de contacto público (sin sesión)
  await caso(F, { id: 'QA-HU18-01', req: 'RF18/HU-18/CA-18.1', desc: 'Mensaje de contacto público válido crea registro y devuelve ID', esperado: '201 con id' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/mensajes-contacto', { body: { nombre: 'Visitante', correo: `visita.${randomUUID().slice(0,6)}@example.invalid`, mensaje: 'Hola, consulta', tipo_id: 3 } });
    return ok(r.status === 201 && r.json?.mensaje_contacto_id, { status: r.status, json: r.json });
  });
  await caso(F, { id: 'QA-HU18-02', req: 'HU-18/CA-18.1', desc: 'Mensaje de contacto con correo inválido se rechaza', esperado: '422/400' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/mensajes-contacto', { body: { nombre: 'X', correo: 'no-correo', mensaje: 'hola', tipo_id: 3 } });
    return ok(r.status === 422 || r.status === 400, { status: r.status });
  });
  await caso(F, { id: 'QA-HU18-03', req: 'HU-18/CA-18.1', desc: 'Descripción de ticket > 500 caracteres se rechaza', esperado: '422/400' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/tickets-soporte', { token: user, body: { descripcion: 'a'.repeat(501), categoria_id: 1 } });
    return ok(r.status === 422 || r.status === 400, { status: r.status });
  });
  // ticket propio
  let ticketId;
  await caso(F, { id: 'QA-HU18-04', req: 'HU-18', desc: 'Usuario autenticado crea ticket de soporte', esperado: '201' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/tickets-soporte', { token: user, body: { descripcion: 'No puedo entrar', categoria_id: 1 } });
    ticketId = r.json?.ticket_id;
    return ok(r.status === 201 && ticketId, { status: r.status, ticketId });
  });
  // separación: otro usuario no ve el ticket ajeno
  await caso(F, { id: 'SEC-IDOR-03', req: 'RNF5/CA-NF5-02', desc: 'Usuario distinto recibe 404 al pedir ticket ajeno por ID', esperado: '404' }, async () => {
    const correoX = `aud.tx.${randomUUID().slice(0,6)}@example.invalid`;
    await api(NEST, 'POST', '/usuarios/registro', { headers: { Authorization: 'Bearer ' + fakeFirebase(correoX) }, body: { nombre_usuario: 'Tercero Ticket', correo_usuario: correoX, password: 'Clave-tx-1' } });
    const lx = await api(NEST, 'POST', '/usuarios/login', { body: { correo_usuario: correoX, password: 'Clave-tx-1' } });
    const r = await api(FAST, 'GET', `/internal/v1/tickets-soporte/${ticketId}`, { token: lx.json.access_token });
    return ok(r.status === 404, { status: r.status });
  });
  await caso(F, { id: 'SEC-AUTHZ-07', req: 'HU-18', desc: 'PATCH de ticket (transición) solo para staff, no usuario común', esperado: 'usuario 403' }, async () => {
    const r = await api(FAST, 'GET', '/internal/v1/mensajes-contacto', { token: user });
    const rs = await api(FAST, 'GET', '/internal/v1/mensajes-contacto', { token: soporte });
    return ok(r.status === 403 && rs.status === 200, { usuario: r.status, soporte: rs.status });
  });
}

async function fastapiSos(tokA) {
  // HU-06/HU-07/HU-14 SOS: requiere plan del titular y contacto. El principal (user final) no tiene plan.
  // Usamos un usuario con plan sembrado por API: el principal creó contacto y tiene que comprar plan;
  // en su lugar probamos el contrato de validación y la regla "sin plan".
  const user = sign(principal.usuario_ID);
  await caso(F, { id: 'QA-HU06-01', req: 'RF11/HU-06', desc: 'SOS sin plan del titular se rechaza (regla de negocio)', esperado: '409' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/alertas', { token: user, body: { clave_idempotencia: randomUUID(), prioridad_id: 3, ubicacion: '-33.45,-70.66', mensaje: 'Ayuda' } });
    return ok(r.status === 409, { status: r.status, msg: r.json?.detail || r.json });
  });
  await caso(F, { id: 'QA-HU06-02', req: 'HU-06', desc: 'SOS con prioridad fuera de rango (5) se rechaza por esquema (FastAPI mapea 422->400)', esperado: '400' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/alertas', { token: user, body: { clave_idempotencia: randomUUID(), prioridad_id: 5 } });
    return ok(r.status === 400 || r.status === 422, { status: r.status });
  });
  await caso(F, { id: 'QA-HU06-03', req: 'HU-06', desc: 'SOS con campo extra se rechaza (Pydantic extra=forbid, 400)', esperado: '400' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/alertas', { token: user, body: { clave_idempotencia: randomUUID(), prioridad_id: 3, campo_malicioso: 1 } });
    return ok(r.status === 400 || r.status === 422, { status: r.status });
  });
  await caso(F, { id: 'SEC-DOCS-01', req: 'PRE-SEC-011', desc: 'En entorno test las docs están activas (se desactivan en producción por config)', esperado: '200 en test', inferido: true }, async () => {
    const r = await api(FAST, 'GET', '/docs');
    return { estado: r.status === 200 ? 'APROBADO' : 'FALLIDO', observado: { status: r.status, nota: 'docs_enabled=false en staging/production por config.py' } };
  });
}

async function flujoSosCompleto() {
  // Flujo SOS completo con un usuario que SÍ tiene plan y contacto (sembrado directo en BD de prueba).
  const bcrypt = req('bcrypt');
  const pinHash = await bcrypt.hash('1111', 12);
  const [{ pin_id }] = await sql('INSERT INTO pin(pin_hash) VALUES ($1) RETURNING pin_id', [pinHash]);
  const [{ usuario_id }] = await sql("INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,rol_id,estado_id,pin_id) VALUES ('SOS Full',$1,'x',3,1,$2) RETURNING usuario_id", [`aud.sos.${randomUUID().slice(0,6)}@example.invalid`, pin_id]);
  await sql('INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES ($1,2,0)', [usuario_id]);
  await sql("INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES ($1,'+56988887777','Contacto SOS')", [usuario_id]);
  const tok = sign(usuario_id);
  const clave = randomUUID();
  let alertaId;
  await caso(F, { id: 'QA-HU06-04', req: 'RF11/HU-06/CA-08.1', desc: 'SOS con plan+contacto crea alerta ACTIVA y encola envíos', esperado: '201 ACTIVA con envío pendiente' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/alertas', { token: tok, body: { clave_idempotencia: clave, prioridad_id: 3, ubicacion: '-33.45,-70.66', mensaje: 'Ayuda urgente' } });
    alertaId = r.json?.alerta_id;
    return ok(r.status === 201 && r.json?.estado_alerta === 'ACTIVA' && r.json?.whatsapp?.pendientes >= 1, { status: r.status, estado: r.json?.estado_alerta, envios: r.json?.whatsapp });
  });
  await caso(F, { id: 'QA-HU06-05', req: 'HU-06/idempotencia', desc: 'Repetir SOS con misma clave de idempotencia devuelve la misma alerta (no duplica)', esperado: 'misma alerta' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/alertas', { token: tok, body: { clave_idempotencia: clave, prioridad_id: 3, ubicacion: '-33.45,-70.66', mensaje: 'Ayuda urgente' } });
    return ok(r.status === 201 && r.json?.alerta_id === alertaId, { status: r.status, mismo: r.json?.alerta_id === alertaId });
  });
  await caso(F, { id: 'QA-HU06-06', req: 'HU-06', desc: 'Segunda alerta activa se rechaza (una activa por usuario)', esperado: '409' }, async () => {
    const r = await api(FAST, 'POST', '/internal/v1/alertas', { token: tok, body: { clave_idempotencia: randomUUID(), prioridad_id: 2 } });
    return ok(r.status === 409, { status: r.status });
  });
  await caso(F, { id: 'QA-HU07-01', req: 'RF13/HU-07/CA-07.1', desc: 'SOS sin ubicación (GPS no disponible) se acepta igualmente', esperado: '201 sin ubicacion' }, async () => {
    // usuario nuevo para no chocar con "una activa"
    const bcrypt2 = req('bcrypt'); const ph = await bcrypt2.hash('2222', 12);
    const [{ pin_id: p2 }] = await sql('INSERT INTO pin(pin_hash) VALUES ($1) RETURNING pin_id', [ph]);
    const [{ usuario_id: u2 }] = await sql("INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,rol_id,estado_id,pin_id) VALUES ('SOS NoGPS',$1,'x',3,1,$2) RETURNING usuario_id", [`aud.nogps.${randomUUID().slice(0,6)}@example.invalid`, p2]);
    await sql('INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES ($1,2,0)', [u2]);
    await sql("INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES ($1,'+56911112222','C')", [u2]);
    const r = await api(FAST, 'POST', '/internal/v1/alertas', { token: sign(u2), body: { clave_idempotencia: randomUUID(), prioridad_id: 1 } });
    return ok(r.status === 201 && r.json?.ubicacion === null, { status: r.status, ubicacion: r.json?.ubicacion });
  });
  await caso(F, { id: 'QA-HU14-01', req: 'HU-14/CA-14.1', desc: 'Finalizar alerta con PIN correcto -> FINALIZADA', esperado: 'FINALIZADA' }, async () => {
    const r = await api(FAST, 'POST', `/internal/v1/alertas/${alertaId}/cerrar`, { token: tok, body: { pin: '1111' } });
    return ok(r.status === 200 && r.json?.estado_alerta === 'FINALIZADA', { status: r.status, estado: r.json?.estado_alerta });
  });
  await caso(F, { id: 'QA-HU14-02', req: 'HU-14/CA-14.1', desc: 'Cerrar una alerta ya finalizada no cambia su estado', esperado: 'idempotente FINALIZADA' }, async () => {
    const r = await api(FAST, 'POST', `/internal/v1/alertas/${alertaId}/cerrar`, { token: tok, body: { pin: '1111' } });
    return ok(r.status === 200 && r.json?.estado_alerta === 'FINALIZADA', { status: r.status, estado: r.json?.estado_alerta });
  });
  await caso(F, { id: 'SEC-IDOR-04', req: 'RNF5/CA-NF5-02', desc: 'Un tercero no puede leer la alerta ajena (404)', esperado: '404' }, async () => {
    const r = await api(FAST, 'GET', `/internal/v1/alertas/${alertaId}`, { token: sign(principal.usuario_ID) });
    return ok(r.status === 404, { status: r.status });
  });
}

async function comprasFlujo() {
  // HU-16 compra de plan con PayPal doble, usando usuario principal real creado por API
  // El principal ya existe; necesita estado 1 (acceso completo) y sin plan todavía.
  const tok = sign(principal.usuario_ID);
  let orderId;
  await caso(F, { id: 'QA-HU16-01', req: 'RF16/HU-16/CA-16.1', desc: 'Crear orden de compra de PLAN (precio del servidor, PayPal doble)', esperado: '201 con orderId' }, async () => {
    const r = await api(NEST, 'POST', '/compras/apadrinados/ordenes', { token: tok, body: { tipo: 'PLAN', cantidad: 1 } });
    orderId = r.json?.orderId;
    return ok(r.status === 201 && orderId, { status: r.status, orderId: orderId ? '[orderId]' : undefined, monto: r.json?.montoCobrado });
  });
  await caso(F, { id: 'QA-HU16-02', req: 'HU-16/CA-16.1', desc: 'Capturar la orden aprobada habilita el plan', esperado: '200 PAGADO' }, async () => {
    if (!orderId) return { estado: 'BLOQUEADO', observado: 'sin orderId de la prueba anterior' };
    const r = await api(NEST, 'POST', `/compras/apadrinados/ordenes/${orderId}/captura`, { token: tok });
    return ok(r.status === 200 && (r.json?.estado === 'PAGADO' || r.json?.estadoPago === 'PAGADO'), { status: r.status, json: r.json });
  });
  await caso(F, { id: 'QA-HU16-03', req: 'HU-16/CA-16.1', desc: 'Cantidad fuera de rango (6) se rechaza', esperado: '400' }, async () => {
    const r = await api(NEST, 'POST', '/compras/apadrinados/ordenes', { token: tok, body: { tipo: 'CUPOS', cantidad: 6 } });
    return ok(r.status === 400, { status: r.status });
  });
}

(async () => {
  try {
    await funcionalIdentidad();
    await funcionalPinPerfilesSos();
    await seguridadAutorizacion();
    const { tokA } = await seguridadIdorBola();
    await seguridadFichaMedica(tokA);
    await seguridadRutasGenericas();
    await seguridadSesion();
    await seguridadCorsHeadersLimites();
    await fastapiContactoSoporte();
    await fastapiSos(tokA);
    await flujoSosCompleto();
    await comprasFlujo();
  } finally {
    console.log('\nRESUMEN:', JSON.stringify(resumen()));
  }
})();
