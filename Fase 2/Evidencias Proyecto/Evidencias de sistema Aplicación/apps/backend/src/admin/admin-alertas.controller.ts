import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../login/jwt-auth.guard';
import { ROL, Roles } from '../login/roles.decorator';
import { RolesGuard } from '../login/roles.guard';
import { AdminAlertasService } from './admin-alertas.service';
import { ConsultarAlertasDto } from './dto/consultar-alertas.dto';

@Controller('admin/alertas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL.ADMINISTRADOR)
export class AdminAlertasController {
  constructor(private readonly alertas: AdminAlertasService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  listar(@Query() filtros: ConsultarAlertasDto) {
    return this.alertas.listar(filtros);
  }
}
