import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readEnv } from './config/env';

// Valor de CORS_ORIGINS cuando no está definida: los puertos de desarrollo de Vite
// (5173 y 5174 para web/móvil, 5175 fijo para el panel de escritorio).
const ORIGENES_DESARROLLO =
  'http://localhost:5173,http://localhost:5174,http://localhost:5175';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  // Único lugar donde se definen los orígenes permitidos: la variable CORS_ORIGINS.
  const origenes = (readEnv('CORS_ORIGINS') ?? ORIGENES_DESARROLLO)
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({ origin: origenes });
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
