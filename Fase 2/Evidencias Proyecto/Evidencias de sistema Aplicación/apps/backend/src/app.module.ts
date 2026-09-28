import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAuthModule } from './integrations/firebase-auth/firebase-auth.module';
import { GoogleMapsModule } from './integrations/google-maps/google-maps.module';
import { JsreportModule } from './integrations/jsreport/jsreport.module';
import { MindicadorModule } from './integrations/mindicador/mindicador.module';
import { PaypalModule } from './integrations/paypal/paypal.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    // Prototipo temporal sin PostgreSQL. Los usuarios viven en memoria.
    UsuariosModule,
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