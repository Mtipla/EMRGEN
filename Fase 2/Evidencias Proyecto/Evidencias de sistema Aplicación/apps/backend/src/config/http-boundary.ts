import type { INestApplication } from '@nestjs/common';
import { boundedJson } from './security';

export function configureHttpBoundary(
  app: INestApplication,
  origins: string[],
  maximumBodyBytes?: number,
): void {
  app.enableCors({ origin: origins });
  app.use(boundedJson(maximumBodyBytes));
}
