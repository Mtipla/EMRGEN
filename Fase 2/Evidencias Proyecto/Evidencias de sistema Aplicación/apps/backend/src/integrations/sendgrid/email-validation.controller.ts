import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import type { EmailValidationResponse } from '@repo/api-types';
import { ValidateEmailDto } from './dto/validate-email.dto';
import { EmailValidationService } from './email-validation.service';

@Controller('email')
export class EmailValidationController {
  constructor(
    private readonly emailValidationService: EmailValidationService,
  ) {}

  @Post('validate')
  @HttpCode(200)
  validate(@Body() dto: ValidateEmailDto): Promise<EmailValidationResponse> {
    return this.emailValidationService.validate(dto);
  }
}
