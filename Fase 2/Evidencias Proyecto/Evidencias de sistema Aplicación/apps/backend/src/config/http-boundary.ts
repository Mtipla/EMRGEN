import type { INestApplication } from '@nestjs/common';
import { boundedJson } from './security';

/** Shared by the real bootstrap and HTTP checks: early rejections need CORS too. */
export function configureHttpBoundary(
  app: INestApplication,
  origins: string[],
  maximumBodyBytes?: number,
): void {
  app.enableCors({ origin: origins });
  app.use(boundedJson(maximumBodyBytes));
}
