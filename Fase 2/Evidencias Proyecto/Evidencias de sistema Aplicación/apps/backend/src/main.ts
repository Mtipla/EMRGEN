import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readEnv } from './config/env';
import { configureHttpBoundary } from './config/http-boundary';

// Valor de CORS_ORIGINS cuando no está definida: los puertos de desarrollo de Vite
// (5173 y 5174 para web/móvil, 5175 fijo para el panel de escritorio).
const ORIGENES_DESARROLLO =
  'http://localhost:5173,http://localhost:5174,http://localhost:5175';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const express = app.getHttpAdapter().getInstance();
  express.disable('x-powered-by');
  express.set('trust proxy', readEnv('TRUSTED_PROXY_CIDRS')?.split(',').map(v => v.trim()) || false);
  // CORS must precede the parser, including its early 400/413/414/415 responses.
  const origenes = (readEnv('CORS_ORIGINS') ?? ORIGENES_DESARROLLO)
    .split(',')
    .map((origin) => origin.trim());
  configureHttpBoundary(app, origenes);
  const server = app.getHttpServer();
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.keepAliveTimeout = 5_000;
  server.maxHeadersCount = 64;
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const puerto = process.env.PORT ?? 3000;
  const host = readEnv('HOST') ?? '0.0.0.0';
  await app.listen(puerto, host);
  // Si un frontend muestra "sin respuesta", su origen debe aparecer en esta lista.
  new Logger('Bootstrap').log(`API en el puerto ${puerto}; orígenes CORS: ${origenes.join(', ')}`);
}
void bootstrap();
