import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';

@Module({
  // HTTP genérico retirado: toda compra debe usar ComprasService (precio/propiedad/reserva).
  providers: [PaypalService],
  exports: [PaypalService],
})
export class PaypalModule {}
