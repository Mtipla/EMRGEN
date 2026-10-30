// Backend NestJS REAL (código compilado de apps/backend/src) con proveedores externos sustituidos.
// Lo inicia levantar-apis.mjs; exige EMERGEN_ENVIRONMENT=test y la BD aislada de la auditoría.
// Reproduce el arranque de src/main.ts: express sin x-powered-by, CORS + boundedJson
// (configureHttpBoundary) y ValidationPipe global con whitelist/forbidNonWhitelisted/transform.
// Los dobles NO contactan Internet: Firebase, PayPal, jsReport, Google Maps, mindicador, WhatsApp.
const { resolve } = require('node:path');
const { appendFileSync, existsSync } = require('node:fs');
const { createRequire } = require('node:module');
const { randomBytes } = require('node:crypto');

const DIST = process.env.AUD_BACKEND_DIST;
const LOG = process.env.AUD_PROVIDER_LOG;
const FLAGS = process.env.AUD_FLAGS_DIR; // archivos-bandera para simular fallos de proveedor
if (process.env.EMERGEN_ENVIRONMENT !== 'test' || process.env.DB_PORT !== '55710' || process.env.DB_HOST !== '127.0.0.1')
  throw new Error('Solo se ejecuta contra la BD aislada de la auditoría');
const req = createRequire(resolve(DIST, 'main.js'));
const { Test } = req('@nestjs/testing');
const { ValidationPipe, UnauthorizedException, ServiceUnavailableException, BadGatewayException } = req('@nestjs/common');
const load = (p) => require(resolve(DIST, p));
const { AppModule } = load('app.module.js');
const { configureHttpBoundary } = load('config/http-boundary.js');

// Solo metadatos: nunca tokens, contraseñas ni contenido de fichas.
const record = (provider, op, meta = {}) =>
  appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), provider, op, ...meta }) + '\n');
const flag = (name) => FLAGS && existsSync(resolve(FLAGS, name));

// Token Firebase falso: "aud-firebase." + base64url(JSON {email, verified, ageSec}).
const firebase = {
  async verifyIdToken(token) {
    if (typeof token !== 'string' || !token.startsWith('aud-firebase.')) {
      record('firebase', 'verifyIdToken', { result: 'rechazado' });
      throw new UnauthorizedException('ID token de Firebase inválido o expirado.');
    }
    const c = JSON.parse(Buffer.from(token.slice(13), 'base64url').toString('utf8'));
    record('firebase', 'verifyIdToken', { result: 'aceptado', verified: !!c.verified, ageSec: c.ageSec ?? 0 });
    return { uid: 'aud-' + Buffer.from(c.email).toString('hex').slice(0, 20), email: c.email,
      emailVerified: !!c.verified, authTime: Math.floor(Date.now() / 1000) - (c.ageSec ?? 0) };
  },
};

const orders = new Map();
const paypal = {
  async createOrder(dto, requestId) {
    if (flag('paypal-caida')) { record('paypal', 'createOrder', { result: 'caida-simulada' }); throw new BadGatewayException('PayPal: proveedor no disponible.'); }
    const id = 'AUD' + randomBytes(7).toString('hex').toUpperCase();
    orders.set(id, { amount: dto.amount, currency: dto.currency ?? 'USD', status: 'CREATED' });
    record('paypal', 'createOrder', { orderId: id, amount: dto.amount, currency: dto.currency, referenceId: dto.referenceId, idempotency: !!requestId });
    return { id, status: 'CREATED', approveUrl: 'https://payments.example.invalid/approve?o=' + id };
  },
  async captureOrder(orderId) {
    if (flag('paypal-caida')) { record('paypal', 'captureOrder', { orderId, result: 'caida-simulada' }); throw new BadGatewayException('PayPal: proveedor no disponible.'); }
    const o = orders.get(orderId);
    if (!o) throw new BadGatewayException('PayPal: orden desconocida');
    const declined = flag('paypal-rechazo');
    o.status = declined ? 'VOIDED' : 'COMPLETED';
    record('paypal', 'captureOrder', { orderId, result: o.status });
    return this.view(orderId, o, declined ? 'DECLINED' : 'COMPLETED');
  },
  async getOrder(orderId) {
    const o = orders.get(orderId);
    record('paypal', 'getOrder', { orderId, known: !!o });
    if (!o) throw new BadGatewayException('PayPal: orden desconocida');
    return this.view(orderId, o, o.status === 'COMPLETED' ? 'COMPLETED' : undefined);
  },
  view(orderId, o, captureStatus) {
    return { orderId, status: o.status, captureId: captureStatus ? 'CAP' + orderId : undefined, captureStatus,
      amount: captureStatus ? { value: o.amount, currency: o.currency } : undefined };
  },
};

const mindicador = {
  async get(code) { record('mindicador', 'get', { code }); return { code, name: 'Dólar (doble)', unit: 'Pesos', series: [{ date: new Date().toISOString(), value: 950 }] }; },
  async today() { record('mindicador', 'today'); return []; },
};
const reports = {
  async renderInline(template, data) {
    const rows = Object.values(data || {}).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0);
    record('jsreport', 'renderInline', { recipe: template.recipe ?? 'chrome-pdf', contentChars: String(template.content ?? '').length,
      rows, hasTripleStash: /\{\{\{/.test(String(template.content ?? '')) });
    if (flag('jsreport-caida')) throw new BadGatewayException('jsReport: proveedor no disponible.');
    return { content: Buffer.from('%PDF-1.7\n% informe sintetico auditoria\n'), contentType: template.recipe === 'html-to-xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf' };
  },
  async renderTemplate(name, data) { return this.renderInline({ name }, data); },
};
const maps = {
  async geocode(address) { record('maps', 'geocode', { chars: address.length }); return []; },
  async reverseGeocode() { record('maps', 'reverseGeocode'); return []; },
};
const whatsapp = {
  isReady: () => false, getStatus: () => ({ enabled: false, state: 'disabled' }), getQrCode: () => undefined,
  assertReady() { throw new ServiceUnavailableException('WhatsApp deshabilitado en la auditoría'); },
  async requestPairingCode() { this.assertReady(); }, async logout() {}, async findAccount() { return undefined; },
};

(async () => {
  const P = (p) => load(p);
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(P('integrations/firebase-auth/firebase-auth.service.js').FirebaseAuthService).useValue(firebase)
    .overrideProvider(P('integrations/paypal/paypal.service.js').PaypalService).useValue(paypal)
    .overrideProvider(P('integrations/mindicador/mindicador.service.js').MindicadorService).useValue(mindicador)
    .overrideProvider(P('integrations/jsreport/jsreport.service.js').JsreportService).useValue(reports)
    .overrideProvider(P('integrations/google-maps/google-maps.service.js').GoogleMapsService).useValue(maps)
    .overrideProvider(P('integrations/whatsapp/whatsapp-connection.service.js').WhatsappConnectionService).useValue(whatsapp)
    .overrideProvider(P('integrations/whatsapp/whatsapp-sos-dispatcher.service.js').WhatsappSosDispatcher).useValue({})
    .compile();
  const app = module.createNestApplication({ bodyParser: false });
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  const origins = process.env.CORS_ORIGINS.split(',').map((o) => o.trim());
  configureHttpBoundary(app, origins);
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(Number(process.env.PORT), '127.0.0.1');
  console.log(`backend-aislado escuchando en 127.0.0.1:${process.env.PORT}; CORS=${origins.join(',')}`);
})().catch((e) => { console.error('backend-aislado no arrancó:', e.message); process.exit(1); });
