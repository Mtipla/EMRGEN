import { BadGatewayException } from '@nestjs/common';
import { EmailValidationService } from './email-validation.service';

describe('EmailValidationService', () => {
  const originalEnv = { ...process.env };
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    delete process.env.SENDGRID_VALIDATION_API_KEY;
    process.env.SENDGRID_API_KEY = 'SG.test';
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    fetchMock.mockRestore();
  });

  it('traduce la respuesta de SendGrid', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          result: {
            email: 'a@gmial.com',
            verdict: 'Risky',
            score: 0.4,
            suggestion: 'gmail.com',
          },
        }),
        { status: 200 },
      ),
    );

    await expect(
      new EmailValidationService().validate({ email: 'a@gmial.com' }),
    ).resolves.toEqual({
      email: 'a@gmial.com',
      verdict: 'Risky',
      score: 0.4,
      isValid: false,
      suggestion: 'gmail.com',
    });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer SG.test',
    );
  });

  it('responde 502 si SendGrid rechaza la key', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"errors":[]}', { status: 403 }),
    );
    await expect(
      new EmailValidationService().validate({ email: 'a@b.cl' }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
