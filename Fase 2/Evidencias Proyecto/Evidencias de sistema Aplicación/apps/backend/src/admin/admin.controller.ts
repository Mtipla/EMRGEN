import { Controller, Get, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin/usuarios')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  // @UseGuards(RolesGuard) -> Validará el RBAC requiriendo Rol Administrador[cite: 1]
  obtenerTodos() {
    return this.adminService.listarUsuarios();
  }

  @Put(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado_ID', ParseIntPipe) estado_ID: number,
    @Body('admin_ID', ParseIntPipe) admin_ID: number // Temporal hasta implementar JWT
  ) {
    return this.adminService.cambiarEstadoUsuario(id, estado_ID, admin_ID);
  }

  @Delete('apadrinado/:id')
  eliminarApadrinado(
    @Param('id', ParseIntPipe) id: number,
    @Body('admin_ID', ParseIntPipe) admin_ID: number
  ) {
    return this.adminService.eliminarUsuarioApadrinado(id, admin_ID);
  }
}