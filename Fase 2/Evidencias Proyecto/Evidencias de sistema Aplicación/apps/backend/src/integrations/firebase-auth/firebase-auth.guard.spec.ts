import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { FirebaseAuthUser } from '@repo/api-types';
import { FirebaseAuthGuard, type FirebaseRequest } from './firebase-auth.guard';
import type { FirebaseAuthService } from './firebase-auth.service';

const contextFor = (request: FirebaseRequest) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('FirebaseAuthGuard', () => {
  const user: FirebaseAuthUser = { uid: 'uid-123', emailVerified: true };
  const verifyIdToken = jest.fn();
  const guard = new FirebaseAuthGuard({
    verifyIdToken,
  } as unknown as FirebaseAuthService);

  beforeEach(() => verifyIdToken.mockReset().mockResolvedValue(user));

  it('deja pasar y adjunta el usuario con un Bearer válido', async () => {
    const request: FirebaseRequest = {
      headers: { authorization: 'Bearer abc.def.ghi' },
    };
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(verifyIdToken).toHaveBeenCalledWith('abc.def.ghi');
    expect(request.firebaseUser).toBe(user);
  });

  it.each([undefined, '', 'Bearer', 'Bearer ', 'Basic abc', 'abc.def.ghi'])(
    'responde 401 con Authorization = %p',
    async (authorization) => {
      await expect(
        guard.canActivate(contextFor({ headers: { authorization } })),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(verifyIdToken).not.toHaveBeenCalled();
    },
  );

  it('propaga el 401 del servicio cuando el token es inválido', async () => {
    verifyIdToken.mockRejectedValueOnce(new UnauthorizedException());
    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: 'Bearer malo' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
