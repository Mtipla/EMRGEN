import { Injectable } from '@nestjs/common';
import type {
  EmailValidationRequest,
  EmailValidationResponse,
  EmailValidationVerdict,
} from '@repo/api-types';
import { readEnv, requireEnv } from '../../config/env';
import { requestExternalJson } from '../http-client';

const INTEGRATION = 'SendGrid Email Validation';
const VALIDATION_URL = 'https://api.sendgrid.com/v3/validations/email';

interface SendgridValidationResult {
  result: {
    email: string;
    verdict: EmailValidationVerdict;
    score: number;
    suggestion?: string;
  };
}

/**
 * Twilio SendGrid Email Validation API: verifica si un correo existe y es entregable
 * antes de guardarlo (registro de usuarios, contactos de emergencia, formulario de contacto).
 * Requiere una API key con el permiso "Email Address Validation", distinta de la key de envío.
 */
@Injectable()
export class EmailValidationService {
  async validate({
    email,
    source,
  }: EmailValidationRequest): Promise<EmailValidationResponse> {
    const { result } = await requestExternalJson<SendgridValidationResult>(
      INTEGRATION,
      VALIDATION_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source }),
      },
    );

    return {
      email: result.email,
      verdict: result.verdict,
      score: result.score,
      isValid: result.verdict === 'Valid',
      suggestion: result.suggestion,
    };
  }

  /** Usa la key dedicada de validación y, si no existe, la key general de SendGrid. */
  private apiKey(): string {
    return (
      readEnv('SENDGRID_VALIDATION_API_KEY') ??
      requireEnv('SENDGRID_API_KEY', INTEGRATION)
    );
  }
}
