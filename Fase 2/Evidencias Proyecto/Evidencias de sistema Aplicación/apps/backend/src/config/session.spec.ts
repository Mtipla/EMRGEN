import { JwtService } from '@nestjs/jwt';
import { sessionDurationSeconds } from './session';

describe('duración de sesión configurable', () => {
  it.each([undefined, '', ' '])(
    'usa dos horas sin configuración: %s',
    (value) => {
      expect(sessionDurationSeconds(value)).toBe(7200);
    },
  );

  it.each(['1', '2', '4', '8', '168'])(
    'emite y verifica un JWT de %s horas',
    async (hours) => {
      const jwt = new JwtService({
        secret: 'solo-pruebas-duracion-de-sesion-0123456789',
        signOptions: {
          expiresIn: sessionDurationSeconds(hours),
          algorithm: 'HS256',
          issuer: 'emergen-api',
          audience: 'emergen-web',
        },
      });
      const token = await jwt.signAsync({ sub: 42 });
      const claims = await jwt.verifyAsync<{
        sub: number;
        iat: number;
        exp: number;
      }>(token, {
        algorithms: ['HS256'],
        issuer: 'emergen-api',
        audience: 'emergen-web',
      });
      expect(claims.sub).toBe(42);
      expect(claims.exp - claims.iat).toBe(Number(hours) * 3600);
      await expect(
        jwt.verifyAsync(token, { clockTimestamp: claims.exp }),
      ).rejects.toThrow('jwt expired');
    },
  );

  it.each(['0', '-1', '0.5', '4h', 'abc', '169', 'Infinity'])(
    'rechaza una duración inválida: %s',
    (value) => {
      expect(() => sessionDurationSeconds(value)).toThrow('JWT_SESSION_HOURS');
    },
  );
});
