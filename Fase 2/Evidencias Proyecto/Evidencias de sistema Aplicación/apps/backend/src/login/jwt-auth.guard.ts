import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginService } from './login.service';

/** Datos de la sesión. `rol_ID` se lee de la BD en cada petición, no del token. */
export type UsuarioSesion = { sub: number; email: string; rol_ID: number };

export type SolicitudAutenticada = {
  headers: { authorization?: string };
  user?: UsuarioSesion;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly loginService: LoginService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<SolicitudAutenticada>();
    const [scheme, token, extra] =
      request.headers.authorization?.trim().split(/\s+/) ?? [];

    if (scheme?.toLowerCase() !== 'bearer' || !token || extra) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }

    let payload: { sub: number; email: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
      }>(token, {
        algorithms: ['HS256'],
        issuer: 'emergen-api',
        audience: 'emergen-web',
      });
    } catch {
      throw new UnauthorizedException('La sesión no es válida o expiró');
    }

    // Fuera del try: un fallo de la BD no debe disfrazarse de sesión inválida.
    const usuario = Number.isInteger(payload.sub)
      ? await this.loginService.buscarActivo(payload.sub)
      : null;
    if (!usuario) {
      throw new UnauthorizedException('La sesión no corresponde a un usuario activo');
    }
    request.user = {
      sub: usuario.usuario_ID,
      email: usuario.correo_usuario,
      rol_ID: usuario.rol_ID,
    };
    return true;
  }
}
