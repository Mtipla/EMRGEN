import { Module } from '@nestjs/common';
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


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // Registra las entidades de cada TypeOrmModule.forFeature (Usuario, BitacoraSistema, PlanUsuario...).
      autoLoadEntities: true,
      synchronize: false,
    }),
    AdminModule,
    UsuariosModule,
    LoginModule,
    PaypalModule,
    FirebaseAuthModule,
    JsreportModule,
    GoogleMapsModule,
    MindicadorModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
