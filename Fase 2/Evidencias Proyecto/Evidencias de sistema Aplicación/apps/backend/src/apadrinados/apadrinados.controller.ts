import { Body, Controller, Delete, Get, Header, Param, ParseIntPipe, Post, Put, Req, StreamableFile, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type UsuarioSesion } from '../login/jwt-auth.guard';
import { ApadrinadosService } from './apadrinados.service';
import { CrearApadrinadoDto } from './dto/apadrinado.dto';
import { CambiarAccesoApadrinadoDto, DefinirPinApadrinadoDto, PinPrincipalDto } from './dto/pin-principal.dto';

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

  @Get('informe')
  @Header('Cache-Control', 'no-store')
  async informe(@Req() request: Solicitud) {
    const reporte = await this.apadrinados.informe(request.user);
    return new StreamableFile(reporte.content, {
      type: reporte.contentType,
      disposition: `attachment; filename="informe-personal-${new Date().toISOString().slice(0, 10)}.pdf"`,
    });
  }

  @Post('apadrinados')
  crear(@Req() request: Solicitud, @Body() datos: CrearApadrinadoDto) {
    return this.apadrinados.crear(request.user, datos);
  }

  // HU-10: las tres acciones críticas exigen el PIN del principal (PIN_principal).
  @Put('apadrinados/:id/pin')
  definirPin(
    @Req() request: Solicitud,
    @Param('id', ParseIntPipe) id: number,
    @Body() { PIN, PIN_principal }: DefinirPinApadrinadoDto,
  ) {
    return this.apadrinados.definirPin(request.user, id, PIN, PIN_principal);
  }

  @Put('apadrinados/:id/estado')
  cambiarAcceso(
    @Req() request: Solicitud,
    @Param('id', ParseIntPipe) id: number,
    @Body() { estado_ID, PIN_principal }: CambiarAccesoApadrinadoDto,
  ) {
    return this.apadrinados.cambiarAcceso(request.user, id, estado_ID, PIN_principal);
  }

  @Delete('apadrinados/:id')
  eliminar(
    @Req() request: Solicitud,
    @Param('id', ParseIntPipe) id: number,
    @Body() { PIN_principal }: PinPrincipalDto,
  ) {
    return this.apadrinados.eliminar(request.user, id, PIN_principal);
  }
}
