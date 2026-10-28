import { Controller, Get, Header, Query, Req, StreamableFile, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type UsuarioSesion } from '../login/jwt-auth.guard';
import { ROL, Roles } from '../login/roles.decorator';
import { RolesGuard } from '../login/roles.guard';
import { AuditoriaService } from './auditoria.service';
import { ConsultarBitacoraDto, ReporteBitacoraDto } from './dto/consultar-bitacora.dto';

// Bitácora del panel administrativo: solo rol Administrador (RBAC leído desde la BD).
// Solo lectura: las entradas las genera el backend al ejecutar cada acción, no el cliente.
@Controller('admin/auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL.ADMINISTRADOR)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  /** JSON; solo depende de la BD. */
  @Get()
  listar(@Query() filtros: ConsultarBitacoraDto) {
    return this.auditoriaService.listar(filtros);
  }

  /** PDF o Excel generado por jsReport (502 si jsReport no responde). */
  @Get('reporte')
  @Header('Cache-Control', 'no-store')
  async reporte(
    @Req() request: { user: UsuarioSesion },
    @Query() { formato, ...filtros }: ReporteBitacoraDto,
  ): Promise<StreamableFile> {
    const reporte = await this.auditoriaService.exportarReporte(filtros, request.user, formato);
    const fecha = new Date().toISOString().slice(0, 10);
    return new StreamableFile(reporte.content, {
      type: reporte.contentType,
      disposition: `attachment; filename="bitacora-${fecha}.${formato}"`,
    });
  }
}
