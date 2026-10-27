import { ConflictException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { transaction } from '../config/transaction';

/** CA-10.1: tres fallos bloquean la acción 5 minutos (contador en el servidor, por cuenta). */
const MAX_INTENTOS_PIN = 3;
const PIN_BLOQUEADO =
  'Por seguridad, se ha bloqueado el intento de acceso por 5 minutos debido a intentos fallidos reiterados';

/**
 * HU-10 / CA-10.1: PIN de la cuenta principal que autoriza una acción crítica (gestionar
 * apadrinados, o que un apadrinado parcial edite su perfil). Los fallos se cuentan en la fila
 * PIN del principal (las mismas columnas que usa el SOS en internal-api); al tercero, 5 min.
 * El error se devuelve y se lanza después del commit, para no deshacer el contador.
 */
export async function verificarPinPrincipal(dataSource: DataSource, principalId: number, pin: string) {
  const error = await transaction(dataSource, async (manager) => {
    const [credencial] = await manager.query(
      `SELECT p.pin_id, p.pin_hash, p.intentos_fallidos, p.bloqueado_hasta,
              p.bloqueado_hasta > clock_timestamp() AS bloqueado
         FROM pin p JOIN usuario u USING (pin_id) WHERE u.usuario_id = $1 FOR UPDATE OF p`,
      [principalId],
    );
    if (!credencial) return new ConflictException('Configura tu PIN antes de gestionar cuentas apadrinadas');
    if (credencial.bloqueado) return new HttpException(PIN_BLOQUEADO, HttpStatus.TOO_MANY_REQUESTS);
    if (await bcrypt.compare(pin, credencial.pin_hash)) {
      await manager.query('UPDATE pin SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE pin_id = $1', [
        credencial.pin_id,
      ]);
      return null;
    }
    // Un bloqueo ya vencido reinicia la cuenta, igual que internal-api.
    const intentos = (credencial.bloqueado_hasta ? 0 : credencial.intentos_fallidos) + 1;
    await manager.query(
      `UPDATE pin SET intentos_fallidos = $2::int,
              bloqueado_hasta = CASE WHEN $2::int >= $3::int THEN clock_timestamp() + interval '5 minutes' END
        WHERE pin_id = $1`,
      [credencial.pin_id, intentos, MAX_INTENTOS_PIN],
    );
    return intentos >= MAX_INTENTOS_PIN
      ? new HttpException(PIN_BLOQUEADO, HttpStatus.TOO_MANY_REQUESTS)
      : new ForbiddenException(`PIN incorrecto. Te quedan ${MAX_INTENTOS_PIN - intentos} intentos.`);
  });
  if (error) throw error;
}
