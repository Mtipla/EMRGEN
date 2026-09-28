import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from './usuarios.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { sub: number; email: string };
    }>();
    const [scheme, token, extra] =
      request.headers.authorization?.trim().split(/\s+/) ?? [];

    if (scheme?.toLowerCase() !== 'bearer' || !token || extra) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: number; email: string }>(token, {
        algorithms: ['HS256'],
        issuer: 'emergen-api',
        audience: 'emergen-web',
      });
      if (!Number.isInteger(payload.sub) || !this.usuariosService.existe(payload.sub)) {
        throw new UnauthorizedException('La sesión no corresponde a un usuario activo');
      }
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('La sesión no es válida o expiró');
    }
  }
}
