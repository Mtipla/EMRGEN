import {
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
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginService } from './login.service';

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
  @Get()
  listar() {
    return this.loginService.listar();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  actualizarMiUsuario(
    @Req() request: { user: { sub: number; email: string } },
    @Body() cambios: ActualizarMiUsuarioDto,
  ) {
    return this.loginService.actualizarPropio(request.user.sub, cambios);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.loginService.eliminar(id);
  }
}
