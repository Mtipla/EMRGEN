import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleMapsModule } from './integrations/google-maps/google-maps.module';
import { JsreportModule } from './integrations/jsreport/jsreport.module';
import { PaypalModule } from './integrations/paypal/paypal.module';
import { SendgridModule } from './integrations/sendgrid/sendgrid.module';

@Module({
  imports: [PaypalModule, SendgridModule, JsreportModule, GoogleMapsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
