import { Matches } from 'class-validator';
import type { WhatsappPairingCodeRequest } from '@repo/api-types';
import { PHONE_NUMBER } from '../phone-number';

export class PairingCodeDto implements WhatsappPairingCodeRequest {
  @Matches(PHONE_NUMBER, {
    message: 'phoneNumber debe tener solo dígitos (8 a 15), con "+" opcional',
  })
  phoneNumber: string;
}
