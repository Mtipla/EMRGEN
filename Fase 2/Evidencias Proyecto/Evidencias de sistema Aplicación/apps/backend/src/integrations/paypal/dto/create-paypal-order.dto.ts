import { IsOptional, IsString, Length, Matches } from 'class-validator';
import type { CreatePaypalOrderRequest } from '@repo/api-types';

export class CreatePaypalOrderDto implements CreatePaypalOrderRequest {
  @Matches(/^\d{1,7}(\.\d{1,2})?$/, {
    message:
      'amount debe ser un monto positivo con hasta 2 decimales, ej. "9.99"',
  })
  amount: string;

  @IsOptional()
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency debe ser un código ISO 4217 en mayúsculas, ej. "USD"',
  })
  currency?: string;

  @IsOptional()
  @IsString()
  @Length(1, 127)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  referenceId?: string;
}
