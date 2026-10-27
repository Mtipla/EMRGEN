import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  FirebaseAuthGuard,
  type FirebaseRequest,
} from '../integrations/firebase-auth/firebase-auth.guard';
import { ActualizarMiUsuarioPropioDto } from './dto/actualizar-mi-usuario.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { CrearPinDto } from './dto/crear-pin.dto';
import { SincronizarPasswordDto } from './dto/sincronizar-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, type UsuarioSesion } from './jwt-auth.guard';
import { LoginService } from './login.service';
import { ROL, Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// Conserva las rutas HTTP que ya consume la web.
@Controller('usuarios')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  // Exige el ID token de la cuenta recién creada en Firebase (Authorization: Bearer).
  @UseGuards(FirebaseAuthGuard)
  @Post('registro')
  registrar(@Req() request: FirebaseRequest, @Body() datos: CrearUsuarioDto) {
    return this.loginService.crear(datos, request.firebaseUser!);
  }

  // Tras restablecer la contraseña con el correo de Firebase: el ID token recién emitido con la
  // contraseña nueva prueba que el dueño del correo la conoce, y se copia a la BD.
  @UseGuards(FirebaseAuthGuard)
  @Post('password/firebase')
  sincronizarPassword(@Req() request: FirebaseRequest, @Body() datos: SincronizarPasswordDto) {
    return this.loginService.sincronizarPasswordFirebase(request.firebaseUser!, datos.password);
  }

  @Post('login')
  iniciarSesion(@Body() datos: LoginDto) {
    return this.loginService.iniciarSesion(datos);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/pin')
  crearPin(
    @Req() request: { user: UsuarioSesion },
    @Body() datos: CrearPinDto,
  ) {
    return this.loginService.crearPinInicial(request.user.sub, datos.PIN);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  obtenerMiCuenta(@Req() request: { user: UsuarioSesion }) {
    return this.loginService.obtenerPropio(request.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  @Get()
  listar() {
    return this.loginService.listar();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  actualizarMiUsuario(
    @Req() request: { user: UsuarioSesion },
    @Body() cambios: ActualizarMiUsuarioPropioDto,
  ) {
    return this.loginService.actualizarPropio(request.user.sub, cambios);
  }

  // HU-15 / RF3: la contraseña actual es la verificación de identidad.
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  cambiarPassword(
    @Req() request: { user: UsuarioSesion },
    @Body() datos: CambiarPasswordDto,
  ) {
    return this.loginService.cambiarPassword(request.user.sub, datos.password_actual, datos.password_nueva);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL.ADMINISTRADOR)
  @Delete(':id')
  eliminar(
    @Req() request: { user: UsuarioSesion },
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (id === request.user.sub) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta');
    }
    return this.loginService.eliminar(id, request.user);
  }
}
