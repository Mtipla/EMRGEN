import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAuthModule } from './integrations/firebase-auth/firebase-auth.module';
import { GoogleMapsModule } from './integrations/google-maps/google-maps.module';
import { JsreportModule } from './integrations/jsreport/jsreport.module';
import { MindicadorModule } from './integrations/mindicador/mindicador.module';
import { PaypalModule } from './integrations/paypal/paypal.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { Usuario } from './usuarios/usuarios.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Usuario],
      synchronize: false,
    }),
    AdminModule,
    PaypalModule,
    FirebaseAuthModule,
    JsreportModule,
    GoogleMapsModule,
    MindicadorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}