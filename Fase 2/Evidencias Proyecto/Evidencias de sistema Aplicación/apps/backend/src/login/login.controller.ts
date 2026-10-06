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
import { ActualizarMiUsuarioDto } from './dto/actualizar-mi-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { CrearPinDto } from './dto/crear-pin.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, type UsuarioSesion } from './jwt-auth.guard';
import { LoginService } from './login.service';
import { ROL, Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// Conserva las rutas HTTP que ya consume la web.
@Controller('usuarios')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('registro')
  registrar(@Body() datos: CrearUsuarioDto) {
    return this.loginService.crear(datos);
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
    @Body() cambios: ActualizarMiUsuarioDto,
  ) {
    return this.loginService.actualizarPropio(request.user.sub, cambios);
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
    return this.loginService.eliminar(id);
  }
}
