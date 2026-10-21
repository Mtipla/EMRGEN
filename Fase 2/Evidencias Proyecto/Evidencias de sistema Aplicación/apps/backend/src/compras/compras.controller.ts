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

// El usuario siempre sale del token verificado; el navegador nunca envía precio ni usuario.
@Controller('compras/apadrinados')
@UseGuards(JwtAuthGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Get()
  resumen(@Req() request: { user: UsuarioSesion }) {
    return this.comprasService.resumen(request.user.sub);
  }

  @Get('ventas/pendientes')
  pendientes(@Req() request: { user: UsuarioSesion }) { return this.comprasService.pendientes(request.user.sub); }

  @Post('ordenes')
  crearOrden(
    @Req() request: { user: UsuarioSesion },
    @Body() { cantidad }: CrearOrdenCompraDto,
  ) {
    return this.comprasService.crearOrden(request.user.sub, cantidad);
  }

  @Post('ordenes/:orderId/captura')
  @HttpCode(200)
  capturar(
    @Req() request: { user: UsuarioSesion },
    @Param('orderId') orderId: string,
  ) {
    return this.comprasService.capturar(request.user.sub, orderId);
  }

  @Post('ventas/:ventaId/conciliar')
  @HttpCode(200)
  conciliar(@Req() request: { user: UsuarioSesion }, @Param('ventaId', ParseIntPipe) ventaId: number) {
    return this.comprasService.conciliar(request.user.sub, ventaId);
  }

  @Post('ordenes/:orderId/cancelar')
  @HttpCode(200)
  cancelar(
    @Req() request: { user: UsuarioSesion },
    @Param('orderId') orderId: string,
  ) {
    return this.comprasService.cancelar(request.user.sub, orderId);
  }
}
