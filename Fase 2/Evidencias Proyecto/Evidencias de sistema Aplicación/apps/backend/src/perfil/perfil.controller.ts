import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type UsuarioSesion } from '../login/jwt-auth.guard';
import { ActualizarPerfilDto, ContactoDto } from './dto/perfil.dto';
import { PerfilService } from './perfil.service';

type Solicitud = { user: UsuarioSesion };

// Siempre la cuenta del token: no hay forma de leer ni editar el perfil de otro usuario.
@Controller('usuarios/me')
@UseGuards(JwtAuthGuard)
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Get('perfil')
  obtener(@Req() request: Solicitud) {
    return this.perfilService.obtener(request.user.sub);
  }

  @Put('perfil')
  actualizar(@Req() request: Solicitud, @Body() cambios: ActualizarPerfilDto) {
    return this.perfilService.actualizar(request.user, cambios);
  }

  @Post('contactos')
  crearContacto(@Req() request: Solicitud, @Body() datos: ContactoDto) {
    return this.perfilService.crearContacto(request.user, datos);
  }

  @Put('contactos/:id')
  actualizarContacto(@Req() request: Solicitud, @Param('id', ParseIntPipe) id: number, @Body() datos: ContactoDto) {
    return this.perfilService.actualizarContacto(request.user, id, datos);
  }

  @Delete('contactos/:id')
  eliminarContacto(@Req() request: Solicitud, @Param('id', ParseIntPipe) id: number) {
    return this.perfilService.eliminarContacto(request.user, id);
  }
}
