import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from './../src/app.module';

/**
 * AppModule completo sin infraestructura: los e2e no levantan Postgres ni leen el
 * .env. Se reemplaza el DataSource de TypeORM por un doble (los repositorios de
 * Admin/Usuarios quedan vacíos) y se define un JWT_SECRET de prueba para que
 * LoginModule arranque. Así se sigue verificando que todos los módulos se conectan.
 */
export function createAppTestingModule(): TestingModuleBuilder {
  process.env.JWT_SECRET ??= 'e2e-secreto-jwt-solo-para-pruebas-0123456789';
  return Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(getDataSourceToken())
    .useValue({
      isInitialized: false,
      options: { type: 'postgres' },
      entityMetadatas: [],
      manager: {},
      getRepository: () => ({}),
    });
}
