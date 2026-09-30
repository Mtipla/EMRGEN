import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAuthModule } from './integrations/firebase-auth/firebase-auth.module';
import { GoogleMapsModule } from './integrations/google-maps/google-maps.module';
import { JsreportModule } from './integrations/jsreport/jsreport.module';
import { MindicadorModule } from './integrations/mindicador/mindicador.module';
import { PaypalModule } from './integrations/paypal/paypal.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { LoginModule } from './login/login.module';
import { UsuariosModule } from './usuarios/usuarios.module';


@Module({
  imports: [
    // Fuera de Docker (cwd = apps/backend) lee .env.local y después el .env de la raíz del
    // monorepo; gana el primer archivo que define la variable. En Docker no hay archivos:
    // las variables de docker-compose.yml ya están en el entorno y siempre tienen prioridad.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env'],
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
        // Registra las entidades de cada TypeOrmModule.forFeature (Usuario, BitacoraSistema, PlanUsuario...).
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AdminModule,
    UsuariosModule,
    LoginModule,
    PaypalModule,
    FirebaseAuthModule,
    JsreportModule,
    GoogleMapsModule,
    MindicadorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
