import { completeRows, reportLimit } from '../config/security';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { codigoPostgres } from '../config/postgres-error';
import { plantillaReporte, validarReporte, type FormatoReporte } from '../integrations/jsreport/formato-reporte';
import { JsreportService, type RenderedReport } from '../integrations/jsreport/jsreport.service';
import { transaction } from '../config/transaction';
import { registrarActividadUsuario } from '../auditoria/actividad-usuario';
import type { UsuarioSesion } from '../login/jwt-auth.guard';
import { LoginService } from '../login/login.service';
import { verificarPinPrincipal } from '../login/pin-principal';
import { ACCESO } from '../login/roles.decorator';
import { Pin } from '../usuarios/pin.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CrearApadrinadoDto } from './dto/apadrinado.dto';
import { PLANTILLA_INFORME, PLANTILLA_INFORME_EXCEL } from './plantilla-informe';

const PG_CHECK_VIOLATION = '23514';

const FECHA_CHILE = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Santiago',
});
const acceso = (estado_ID?: number) => (estado_ID === ACCESO.COMPLETO ? 'Completo' : 'Parcial');

/** Cuenta vinculada visible para la sesión. Acceso y PIN solo los ve el principal (RF9). */
export type CuentaVinculada = {
  usuario_ID: number;
  nombre_usuario: string;
  tipo: 'PRINCIPAL' | 'APADRINADO';
  estado_ID?: number;
  tiene_pin?: boolean;
};

/**
 * "Administrar cuentas" del usuario principal (RF8, RF24, RF25, HU-09, HU-10).
 * Cambio de acceso y eliminación reutilizan AdminService para dejar la misma bitácora,
 * con el principal como actor y tras comprobar que el apadrinado es suyo.
 */
@Injectable()
export class ApadrinadosService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly usuariosService: UsuariosService,
    private readonly adminService: AdminService,
    private readonly loginService: LoginService,
    private readonly jsreport: JsreportService,
  ) {}

  /** El alcance sale de la sesión y de los vínculos actuales, nunca de IDs enviados por el cliente. */
  async informe(sesion: UsuarioSesion, formato: FormatoReporte = 'pdf'): Promise<RenderedReport> {
    const yo = await this.loginService.obtenerPropio(sesion.sub);
    const principal = yo.usuario_principal_ID === null;
    // Un apadrinado ve solo su cuenta: vinculadas() le devolvería la de su principal.
    const apadrinados = principal ? await this.vinculadas(sesion) : [];
    const ids = [sesion.sub, ...apadrinados.map((a) => a.usuario_ID)];
    const [alertas, acciones] = await Promise.all([
      this.dataSource.query<{
        alerta_id: number; nombre_usuario: string; estado_alerta: string; tipo_prioridad: string;
        texto_mensaje: string; ubicacion: string | null; fecha_creacion: Date; fecha_cierre: Date | null;
      }[]>(
        `SELECT a.alerta_id,u.nombre_usuario,a.estado_alerta,p.tipo_prioridad,
          d.texto_mensaje,l.ubicacion,a.fecha_creacion,a.fecha_cierre
         FROM alerta a JOIN usuario u ON u.usuario_id=a.usuario_id
         JOIN prioridad p ON p.prioridad_id=a.prioridad_id
         JOIN detalle_alerta d ON d.detalle_alerta_id=a.detalle_alerta_id
         LEFT JOIN ubicacion_alerta l ON l.ubicacion_alerta_id=a.ubicacion_alerta_id
         WHERE a.usuario_id=ANY($1::int[]) AND a.estado_alerta='FINALIZADA'
         ORDER BY a.fecha_creacion DESC,a.alerta_id DESC LIMIT $2`, [ids, reportLimit() + 1],
      ),
      this.dataSource.query<{
        fecha: Date | null; usuario: string; accion: string; resultado: string; origen: string; afectado: string;
      }[]>(
        `SELECT * FROM (
          SELECT b.fecha_accion AS fecha,COALESCE(u.nombre_usuario,'Cuenta eliminada') AS usuario,
            b.accion_realizada AS accion,b.resultado,app.origen_aplicacion AS origen,
            COALESCE(af.nombre_usuario,'Cuenta eliminada') AS afectado
          FROM bitacora_sistema b LEFT JOIN usuario u ON u.usuario_id=b.usuario_id
          LEFT JOIN usuario af ON af.usuario_id=b.usuario_afectado_id
          JOIN aplicacion app USING(aplicacion_id)
          WHERE b.usuario_id=ANY($1::int[]) OR b.usuario_afectado_id=ANY($1::int[])
          UNION ALL
          SELECT v.fecha_venta,u.nombre_usuario,'Compra #' || v.venta_id,ep.descripcion_estado,'EMERGEN',u.nombre_usuario
          FROM venta v JOIN usuario u USING(usuario_id) JOIN estado_pago ep USING(estado_pago_id)
          WHERE v.usuario_id=ANY($1::int[])
        ) actividad ORDER BY fecha DESC NULLS LAST,usuario,accion LIMIT $2`, [ids, reportLimit() + 1],
      ),
    ]);
    completeRows(alertas);
    completeRows(acciones);
    const reporte = await this.jsreport.renderInline(
      plantillaReporte(formato, PLANTILLA_INFORME, PLANTILLA_INFORME_EXCEL),
      {
        generado: FECHA_CHILE.format(new Date()),
        principal,
        usuario: {
          nombre: yo.nombre_usuario,
          // Un apadrinado no tiene correo propio.
          correo: yo.correo_usuario ?? 'Sin correo (usa el de la cuenta principal)',
          tipo: principal ? 'Cuenta principal' : 'Cuenta apadrinada',
          acceso: acceso(yo.estado_ID),
          premium: yo.plan_efectivo ? 'Sí' : 'No',
        },
        apadrinados: apadrinados.map((a) => ({
          nombre: a.nombre_usuario,
          acceso: acceso(a.estado_ID),
          pin: a.tiene_pin ? 'Configurado' : 'Sin PIN',
        })),
        alertas: alertas.map((a) => ({
          ...a,
          ubicacion: a.ubicacion ?? 'No registrada',
          creada: FECHA_CHILE.format(a.fecha_creacion),
          cerrada: a.fecha_cierre ? FECHA_CHILE.format(a.fecha_cierre) : 'Sin cierre',
        })),
        acciones: acciones.map((a) => ({
          ...a, fecha: a.fecha ? FECHA_CHILE.format(a.fecha) : 'No registrada',
        })),
      },
    );
    validarReporte(reporte, formato);
    return reporte;
  }

  async vinculadas(sesion: UsuarioSesion): Promise<CuentaVinculada[]> {
    const yo = await this.usuarios.findOneBy({ usuario_ID: sesion.sub });
    if (!yo) throw new NotFoundException('No se encontró la cuenta');

    if (yo.usuario_principal_ID === null) {
      const apadrinados = await this.usuarios.find({
        where: { usuario_principal_ID: yo.usuario_ID },
        order: { usuario_ID: 'ASC' },
      });
      return apadrinados.map((a) => ({
        usuario_ID: a.usuario_ID,
        nombre_usuario: a.nombre_usuario,
        tipo: 'APADRINADO',
        estado_ID: a.estado_ID,
        tiene_pin: a.PIN_ID !== null,
      }));
    }

    // Apadrinado: su principal y los demás apadrinados del mismo principal, solo con el nombre.
    const familia = await this.usuarios.find({
      where: [{ usuario_ID: yo.usuario_principal_ID }, { usuario_principal_ID: yo.usuario_principal_ID }],
      order: { usuario_ID: 'ASC' },
    });
    return familia
      .filter((u) => u.usuario_ID !== yo.usuario_ID)
      .map((u) => ({
        usuario_ID: u.usuario_ID,
        nombre_usuario: u.nombre_usuario,
        tipo: u.usuario_principal_ID === null ? 'PRINCIPAL' : 'APADRINADO',
      }));
  }

  async crear(sesion: UsuarioSesion, datos: CrearApadrinadoDto): Promise<CuentaVinculada[]> {
    await this.exigirPrincipal(sesion);
    try {
      // El trigger emergen_validar_vinculo comprueba plan y cupos dentro de la misma escritura.
      await this.usuariosService.crearUsuarioApadrinado(sesion.sub, {
        nombre_usuario: datos.nombre_usuario,
        estado_ID: datos.acceso_completo ? ACCESO.COMPLETO : ACCESO.PARCIAL,
        pin: datos.PIN,
      });
    } catch (error) {
      if (codigoPostgres(error) === PG_CHECK_VIOLATION) {
        throw new ConflictException(
          'No tienes cupos libres: compra un cupo de cuenta apadrinada para añadir otra cuenta',
        );
      }
      throw error;
    }
    return this.vinculadas(sesion);
  }

  /** PIN de primer ingreso que el principal define para su apadrinado (mockup web págs. 68-73). */
  async definirPin(sesion: UsuarioSesion, id: number, pin: string, pinPrincipal: string): Promise<CuentaVinculada[]> {
    await this.exigirPropio(sesion, id);
    await this.verificarPinPrincipal(sesion, pinPrincipal);
    const pinHash = await bcrypt.hash(pin, 12);
    await transaction(this.dataSource, async (manager) => {
      const usuarios = manager.getRepository(Usuario);
      const apadrinado = await usuarios.findOne({ where: { usuario_ID: id }, lock: { mode: 'pessimistic_write' } });
      if (!apadrinado || apadrinado.usuario_principal_ID !== sesion.sub) {
        throw new NotFoundException('No se encontró la cuenta apadrinada');
      }
      // Completo: PIN de primer acceso que debe cambiar. Parcial: PIN fijo que no puede cambiar.
      const pin_temporal = apadrinado.estado_ID === ACCESO.COMPLETO;
      if (apadrinado.PIN_ID !== null) {
        await manager.update(Pin, { PIN_ID: apadrinado.PIN_ID }, { pin_hash: pinHash, pin_temporal });
        await registrarActividadUsuario(manager, sesion, 'Regeneró el PIN de una cuenta apadrinada', 'MODIFICACION', id);
        return;
      }
      const nuevo = await manager.save(Pin, manager.create(Pin, { pin_hash: pinHash, pin_temporal }));
      apadrinado.PIN_ID = nuevo.PIN_ID;
      await usuarios.save(apadrinado);
      await registrarActividadUsuario(manager, sesion, 'Configuró el PIN de una cuenta apadrinada', 'MODIFICACION', id);
    });
    return this.vinculadas(sesion);
  }

  async cambiarAcceso(sesion: UsuarioSesion, id: number, estadoId: number, pinPrincipal: string): Promise<CuentaVinculada[]> {
    await this.exigirPropio(sesion, id);
    await this.verificarPinPrincipal(sesion, pinPrincipal);
    await this.adminService.cambiarEstadoUsuario(id, estadoId, sesion);
    // Al pasar a completo el PIN dado por la principal pasa a ser de primer acceso; al pasar a parcial, fijo.
    await this.dataSource.query(
      'UPDATE pin SET pin_temporal = $2 FROM usuario u WHERE u.pin_id = pin.pin_id AND u.usuario_id = $1',
      [id, estadoId === ACCESO.COMPLETO],
    );
    return this.vinculadas(sesion);
  }

  async eliminar(sesion: UsuarioSesion, id: number, pinPrincipal: string): Promise<CuentaVinculada[]> {
    await this.exigirPropio(sesion, id);
    await this.verificarPinPrincipal(sesion, pinPrincipal);
    await this.adminService.eliminarUsuarioApadrinado(id, sesion);
    return this.vinculadas(sesion);
  }

  /** HU-10 / CA-10.1: el PIN del principal (la sesión) autoriza la acción; bloqueo en login/pin-principal. */
  private verificarPinPrincipal(sesion: UsuarioSesion, pin: string) {
    return verificarPinPrincipal(this.dataSource, sesion.sub, pin);
  }

  /** Mismo criterio que ComprasService.titular: solo el principal con acceso completo gestiona cuentas. */
  private async exigirPrincipal(sesion: UsuarioSesion) {
    const yo = await this.usuarios.findOneBy({ usuario_ID: sesion.sub });
    if (!yo || yo.usuario_principal_ID !== null || sesion.estado_ID !== ACCESO.COMPLETO) {
      throw new ForbiddenException('Solo la cuenta principal con acceso completo administra cuentas apadrinadas');
    }
  }

  private async exigirPropio(sesion: UsuarioSesion, id: number) {
    await this.exigirPrincipal(sesion);
    const apadrinado = await this.usuarios.findOneBy({ usuario_ID: id });
    if (!apadrinado || apadrinado.usuario_principal_ID !== sesion.sub) {
      throw new NotFoundException('No se encontró la cuenta apadrinada');
    }
  }
}
