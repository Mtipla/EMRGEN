import { Module } from '@nestjs/common';
import { EmailValidationController } from './email-validation.controller';
import { EmailValidationService } from './email-validation.service';

@Module({
  controllers: [EmailValidationController],
  providers: [EmailValidationService],
  exports: [EmailValidationService],
})
export class SendgridModule {}
