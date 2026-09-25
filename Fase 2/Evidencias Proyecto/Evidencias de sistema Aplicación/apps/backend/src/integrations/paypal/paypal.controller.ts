import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';
import type {
  CapturePaypalOrderResponse,
  PaypalOrderResponse,
} from '@repo/api-types';
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { PaypalService } from './paypal.service';

/** Los ids de orden de PayPal son alfanuméricos en mayúsculas (ej. "5O190127TN364715T"). */
const ORDER_ID = /^[A-Z0-9]{5,36}$/;

@Controller('payments/paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post('orders')
  createOrder(@Body() dto: CreatePaypalOrderDto): Promise<PaypalOrderResponse> {
    return this.paypalService.createOrder(dto);
  }

  @Post('orders/:orderId/capture')
  captureOrder(
    @Param('orderId') orderId: string,
  ): Promise<CapturePaypalOrderResponse> {
    if (!ORDER_ID.test(orderId))
      throw new BadRequestException('orderId inválido');
    return this.paypalService.captureOrder(orderId);
  }
}
