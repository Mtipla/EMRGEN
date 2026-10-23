import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ActualizarEstadoDto } from '../admin/dto/actualizar-estado.dto';
import { CrearPinDto } from '../login/dto/crear-pin.dto';
import { JwtAuthGuard, type UsuarioSesion } from '../login/jwt-auth.guard';
import { ApadrinadosService } from './apadrinados.service';
import { CrearApadrinadoDto } from './dto/apadrinado.dto';

type Solicitud = { user: UsuarioSesion };

// Siempre la cuenta del token: el principal solo ve y modifica a sus propios apadrinados.
@Controller('usuarios/me')
@UseGuards(JwtAuthGuard)
export class ApadrinadosController {
  constructor(private readonly apadrinados: ApadrinadosService) {}

  @Get('vinculadas')
  vinculadas(@Req() request: Solicitud) {
    return this.apadrinados.vinculadas(request.user);
  }

  @Post('apadrinados')
  crear(@Req() request: Solicitud, @Body() datos: CrearApadrinadoDto) {
    return this.apadrinados.crear(request.user, datos);
  }

  @Put('apadrinados/:id/pin')
  definirPin(@Req() request: Solicitud, @Param('id', ParseIntPipe) id: number, @Body() { PIN }: CrearPinDto) {
    return this.apadrinados.definirPin(request.user, id, PIN);
  }

  @Put('apadrinados/:id/estado')
  cambiarAcceso(
    @Req() request: Solicitud,
    @Param('id', ParseIntPipe) id: number,
    @Body() { estado_ID }: ActualizarEstadoDto,
  ) {
    return this.apadrinados.cambiarAcceso(request.user, id, estado_ID);
  }

  @Delete('apadrinados/:id')
  eliminar(@Req() request: Solicitud, @Param('id', ParseIntPipe) id: number) {
    return this.apadrinados.eliminar(request.user, id);
  }
}
