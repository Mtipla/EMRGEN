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
import { AdminTicketsService } from './admin-tickets.service';
import { ReporteTicketsDto } from './dto/reporte-tickets.dto';

@Controller('admin/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL.ADMINISTRADOR)
export class AdminTicketsController {
  constructor(private readonly tickets: AdminTicketsService) {}

  @Get('reporte')
  @Header('Cache-Control', 'no-store')
  async reporte(@Query() { formato }: ReporteTicketsDto) {
    const reporte = await this.tickets.generarReporte(formato);
    return new StreamableFile(reporte.content, {
      type: reporte.contentType,
      disposition: `attachment; filename="tickets-cerrados-${new Date().toISOString().slice(0, 10)}.${formato}"`,
    });
  }
}
