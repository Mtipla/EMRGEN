import {
  Controller,
  Get,
  Header,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../login/jwt-auth.guard';
import { ROL, Roles } from '../login/roles.decorator';
import { RolesGuard } from '../login/roles.guard';
import { AdminVentasService } from './admin-ventas.service';
import {
  ConsultarVentasDto,
  ReporteVentasDto,
} from './dto/consultar-ventas.dto';

@Controller('admin/ventas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL.ADMINISTRADOR)
export class AdminVentasController {
  constructor(private readonly ventas: AdminVentasService) {}

  @Get()
  @Roles(ROL.ADMINISTRADOR, ROL.SOPORTE)
  @Header('Cache-Control', 'no-store')
  listar(@Query() filtros: ConsultarVentasDto) {
    return this.ventas.listar(filtros);
  }

  @Get('reporte')
  @Header('Cache-Control', 'no-store')
  async reporte(@Query() { formato, ...filtros }: ReporteVentasDto) {
    const reporte = await this.ventas.generarReporte(filtros, formato);
    return new StreamableFile(reporte.content, {
      type: reporte.contentType,
      disposition: `attachment; filename="ventas-${new Date().toISOString().slice(0, 10)}.${formato}"`,
    });
  }
}
