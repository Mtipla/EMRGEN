import { UnauthorizedException } from '@nestjs/common';
import { JwksClient } from 'jwks-rsa';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { readEnv } from './../src/config/env';
import { FirebaseAuthService } from './../src/integrations/firebase-auth/firebase-auth.service';
import { GoogleMapsService } from './../src/integrations/google-maps/google-maps.service';
import { JsreportService } from './../src/integrations/jsreport/jsreport.service';
import { MindicadorService } from './../src/integrations/mindicador/mindicador.service';
import { PaypalService } from './../src/integrations/paypal/paypal.service';

/**
 * Pruebas contra los proveedores REALES con las credenciales del .env.
 * Están desactivadas por defecto; para correrlas (PowerShell):
 *   $env:LIVE_APIS=1; npm run test:e2e --workspace=backend -- integrations.live
 * PayPal solo se prueba en sandbox y no captura dinero (solo crea la orden).
 */
const live = process.env.LIVE_APIS === '1' ? describe : describe.skip;

live('Integraciones externas (proveedores reales)', () => {
  jest.setTimeout(60_000);

  // process.loadEnvFile() (loadEnvFile) escribe en el process.env nativo, que Jest
  // no comparte con el sandbox del test: se lee el .env de la raíz a mano.
  // Igual que loadEnvFile, no sobrescribe variables ya definidas.
  beforeAll(() => {
    const file = resolve(__dirname, '../../../.env');
    if (existsSync(file))
      process.env = {
        ...parseEnv(readFileSync(file, 'utf8')),
        ...process.env,
      };
  });

  it('mindicador: obtiene el valor de la UF de hoy', async () => {
    const uf = await new MindicadorService().get('uf');
    expect(uf.code).toBe('uf');
    expect(uf.series.length).toBeGreaterThan(0);
    expect(uf.series[0].value).toBeGreaterThan(30_000);
  });

  it('mindicador: lista los indicadores del día', async () => {
    const codes = (await new MindicadorService().today()).map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(['uf', 'dolar', 'utm']));
  });

  it('PayPal sandbox: obtiene token OAuth y crea una orden', async () => {
    if (readEnv('PAYPAL_MODE') === 'live')
      throw new Error('PAYPAL_MODE=live: esta prueba solo corre en sandbox.');

    const order = await new PaypalService().createOrder({
      amount: '1.00',
      description: 'Prueba automatizada EMERGEN',
    });
    expect(order.id).toMatch(/^[A-Z0-9]{5,36}$/);
    expect(order.status).toBe('CREATED');
    expect(order.approveUrl).toContain('paypal.com');
  });

  it('Google Maps: geocodifica una dirección de Santiago', async () => {
    const [first] = await new GoogleMapsService().geocode(
      'Plaza de Armas, Santiago',
    );
    expect(first.location.lat).toBeCloseTo(-33.44, 1);
    expect(first.location.lng).toBeCloseTo(-70.65, 1);
  });

  it('Firebase: el JWKS de Google responde con claves RS256', async () => {
    const keys = await new JwksClient({
      jwksUri:
        'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
    }).getSigningKeys();
    expect(keys.length).toBeGreaterThan(0);
    expect(readEnv('FIREBASE_PROJECT_ID')).toBeDefined();
  });

  it('Firebase: rechaza un token falso con 401', async () => {
    await expect(
      new FirebaseAuthService().verifyIdToken('x.y.z'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('jsReport: renderiza un PDF en el servidor configurado', async () => {
    const report = await new JsreportService().renderInline(
      { content: '<h1>{{titulo}}</h1>' },
      { titulo: 'Prueba EMERGEN' },
    );
    expect(report.contentType).toContain('pdf');
    expect(report.content.subarray(0, 4).toString()).toBe('%PDF');
  });
});
