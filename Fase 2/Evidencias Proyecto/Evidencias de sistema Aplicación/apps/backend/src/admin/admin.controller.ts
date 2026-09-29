import { Controller, Get, Put, Delete, Param, Body, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type UsuarioSesion } from '../login/jwt-auth.guard';
import { ROL, Roles } from '../login/roles.decorator';
import { RolesGuard } from '../login/roles.guard';
import { AdminService } from './admin.service';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';

// Todas las rutas exigen sesión válida y rol Administrador (RBAC leído desde la BD).
// El admin_ID de la bitácora sale del token verificado, nunca del body.
@Controller('admin/usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL.ADMINISTRADOR)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  obtenerTodos() {
    return this.adminService.listarUsuarios();
  }

  @Put(':id/estado')
  actualizarEstado(
    @Req() request: { user: UsuarioSesion },
    @Param('id', ParseIntPipe) id: number,
    @Body() { estado_ID }: ActualizarEstadoDto,
  ) {
    return this.adminService.cambiarEstadoUsuario(id, estado_ID, request.user.sub);
  }

  @Delete('apadrinado/:id')
  eliminarApadrinado(
    @Req() request: { user: UsuarioSesion },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.eliminarUsuarioApadrinado(id, request.user.sub);
  }
}
