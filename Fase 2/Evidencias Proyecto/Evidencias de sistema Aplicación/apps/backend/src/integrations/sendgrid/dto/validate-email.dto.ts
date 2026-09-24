import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import type { EmailValidationRequest } from '@repo/api-types';

export class ValidateEmailDto implements EmailValidationRequest {
  @IsEmail({}, { message: 'email no tiene un formato válido' })
  @Length(3, 254)
  email: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  source?: string;
}
