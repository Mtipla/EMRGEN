import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ActualizarMiUsuarioDto } from '../login/dto/actualizar-mi-usuario.dto';
import { CrearUsuarioDto } from '../login/dto/crear-usuario.dto';
import { JwtAuthGuard, type UsuarioSesion } from '../login/jwt-auth.guard';
import { ROL, Roles } from '../login/roles.decorator';
import { RolesGuard } from '../login/roles.guard';
import { AdminService } from './admin.service';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';
import { GuardarPlanDto } from './dto/guardar-plan.dto';

// SOPORTE consulta cuentas; las modificaciones requieren ADMINISTRADOR.
// El actor de la bitácora sale del token verificado, nunca del body.
@Controller('admin/usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL.ADMINISTRADOR)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Roles(ROL.ADMINISTRADOR, ROL.SOPORTE)
  obtenerTodos() {
    return this.adminService.listarUsuarios();
  }

  // El rol SOPORTE lo fuerza AdminService: el body no puede elegir rol ni estado.
  @Post('soporte')
  crearSoporte(
    @Req() request: { user: UsuarioSesion },
    @Body() datos: CrearUsuarioDto,
  ) {
    return this.adminService.crearTrabajadorSoporte(datos, request.user);
  }

  @Get(':id')
  @Roles(ROL.ADMINISTRADOR, ROL.SOPORTE)
  obtenerExpediente(
    @Req() request: { user: UsuarioSesion },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.obtenerExpedienteUsuario(id, request.user);
  }

  @Patch(':id')
  actualizarDatos(
    @Req() request: { user: UsuarioSesion },
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarMiUsuarioDto,
  ) {
    return this.adminService.actualizarDatosUsuario(id, datos, request.user);
  }

  @Put(':id/plan')
  guardarPlan(
    @Req() request: { user: UsuarioSesion },
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: GuardarPlanDto,
  ) {
    return this.adminService.guardarPlanUsuario(id, datos, request.user);
  }

  @Put(':id/estado')
  actualizarEstado(
    @Req() request: { user: UsuarioSesion },
    @Param('id', ParseIntPipe) id: number,
    @Body() { estado_ID }: ActualizarEstadoDto,
  ) {
    return this.adminService.cambiarEstadoUsuario(id, estado_ID, request.user);
  }

  @Delete('apadrinado/:id')
  eliminarApadrinado(
    @Req() request: { user: UsuarioSesion },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.eliminarUsuarioApadrinado(id, request.user);
  }
}
