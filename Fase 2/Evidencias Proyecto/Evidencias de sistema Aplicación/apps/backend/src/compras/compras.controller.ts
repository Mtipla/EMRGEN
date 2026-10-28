import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, type UsuarioSesion } from '../login/jwt-auth.guard';
import { ComprasService } from './compras.service';
import { CrearOrdenCompraDto } from './dto/crear-orden-compra.dto';

// Sin sesión: el precio se muestra en la página pública de Premium (mockup web pág. 2).
@Controller('compras/precio')
export class PrecioPublicoController {
  constructor(private readonly comprasService: ComprasService) {}

  @Get()
  precio() {
    return this.comprasService.precioPublico();
  }
}

// El usuario siempre sale del token verificado; el navegador nunca envía precio ni usuario.
@Controller('compras')
@UseGuards(JwtAuthGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Get('apadrinados')
  resumen(@Req() request: { user: UsuarioSesion }) {
    return this.comprasService.resumen(request.user.sub);
  }

  @Get('resumen')
  resumenCompra(@Req() request: { user: UsuarioSesion }) {
    return this.comprasService.resumenCompra(request.user.sub);
  }

  @Get('apadrinados/ventas/pendientes')
  pendientes(@Req() request: { user: UsuarioSesion }) { return this.comprasService.pendientes(request.user.sub); }

  @Post('apadrinados/ordenes')
  crearOrden(
    @Req() request: { user: UsuarioSesion },
    @Body() { cantidad, tipo }: CrearOrdenCompraDto,
  ) {
    return this.comprasService.crearOrden(request.user.sub, cantidad, tipo ?? 'CUPOS');
  }

  @Post('apadrinados/ordenes/:orderId/captura')
  @HttpCode(200)
  capturar(
    @Req() request: { user: UsuarioSesion },
    @Param('orderId') orderId: string,
  ) {
    return this.comprasService.capturar(request.user.sub, orderId);
  }

  @Post('apadrinados/ventas/:ventaId/conciliar')
  @HttpCode(200)
  conciliar(@Req() request: { user: UsuarioSesion }, @Param('ventaId', ParseIntPipe) ventaId: number) {
    return this.comprasService.conciliar(request.user.sub, ventaId);
  }

  @Post('apadrinados/ordenes/:orderId/cancelar')
  @HttpCode(200)
  cancelar(
    @Req() request: { user: UsuarioSesion },
    @Param('orderId') orderId: string,
  ) {
    return this.comprasService.cancelar(request.user.sub, orderId);
  }
}
