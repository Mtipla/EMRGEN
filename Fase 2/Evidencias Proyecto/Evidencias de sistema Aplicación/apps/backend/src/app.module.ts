import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { OperationLimitsInterceptor, securityNumber } from './config/security';
import { PostgresExceptionFilter } from './config/postgres-exception.filter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAuthModule } from './integrations/firebase-auth/firebase-auth.module';
import { GoogleMapsModule } from './integrations/google-maps/google-maps.module';
import { JsreportModule } from './integrations/jsreport/jsreport.module';
import { MindicadorModule } from './integrations/mindicador/mindicador.module';
import { PaypalModule } from './integrations/paypal/paypal.module';
import { WhatsappModule } from './integrations/whatsapp/whatsapp.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { LoginModule } from './login/login.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ComprasModule } from './compras/compras.module';
import { PerfilModule } from './perfil/perfil.module';
import { ApadrinadosModule } from './apadrinados/apadrinados.module';
import { resolve } from 'node:path';
import { validateRuntimeConfig } from './config/runtime-config';
import { HealthController } from './health/health.controller';
import { readFileSync } from 'node:fs';

const backendDir = resolve(__dirname, '..');

@Module({
  imports: [
    // Fuera de Docker (cwd = apps/backend) lee .env.local y después el .env de la raíz del
    // monorepo; gana el primer archivo que define la variable. En Docker no hay archivos:
    // las variables de docker-compose.yml ya están en el entorno y siempre tienen prioridad.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(backendDir, '.env.local'),
        resolve(backendDir, '.env'),
        resolve(backendDir, '../../.env'),
      ],
      ignoreEnvFile: ['test', 'staging', 'production'].includes(
        process.env.EMERGEN_ENVIRONMENT ?? process.env.NODE_ENV ?? '',
      ),
      validate: validateRuntimeConfig,
    }),
    // Async: DB_* se lee cuando ConfigModule ya cargó los .env, no al importar este archivo.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') || 'db',
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        ssl:
          config.get<string>('DB_SSLMODE') === 'verify-full'
            ? {
                rejectUnauthorized: true,
                ca: readFileSync(
                  config.getOrThrow<string>('DB_SSL_CA_FILE'),
                  'utf8',
                ),
              }
            : false,
        // Registra las entidades de cada TypeOrmModule.forFeature (Usuario, BitacoraSistema, PlanUsuario...).
        autoLoadEntities: true,
        synchronize: false,
        extra: { max: securityNumber('DB_POOL_MAX', 10, 100), connectionTimeoutMillis: 5000,
          statement_timeout: securityNumber('DB_STATEMENT_TIMEOUT_MS', 30_000, 300_000) },
      }),
    }),
    AdminModule,
    UsuariosModule,
    LoginModule,
    PaypalModule,
    ComprasModule,
    PerfilModule,
    ApadrinadosModule,
    FirebaseAuthModule,
    JsreportModule,
    GoogleMapsModule,
    MindicadorModule,
    WhatsappModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: PostgresExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: OperationLimitsInterceptor },
  ],
})
export class AppModule {}
