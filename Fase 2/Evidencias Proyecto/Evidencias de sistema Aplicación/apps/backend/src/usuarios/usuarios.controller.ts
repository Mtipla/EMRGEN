import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarMiUsuarioDto } from './dto/actualizar-mi-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('registro')
  registrar(@Body() datos: CrearUsuarioDto) {
    return this.usuariosService.crear(datos);
  }

  @Post('login')
  iniciarSesion(@Body() datos: LoginDto) {
    return this.usuariosService.iniciarSesion(datos);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  actualizarMiUsuario(
    @Req() request: { user: { sub: number; email: string } },
    @Body() cambios: ActualizarMiUsuarioDto,
  ) {
    return this.usuariosService.actualizarPropio(request.user.sub, cambios);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }
}
