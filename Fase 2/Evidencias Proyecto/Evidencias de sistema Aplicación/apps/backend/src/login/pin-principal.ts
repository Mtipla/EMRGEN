import { ConflictException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { transaction } from '../config/transaction';

const MAX_INTENTOS_PIN = 3;
const PIN_BLOQUEADO =
  'Por seguridad, se ha bloqueado el intento de acceso por 5 minutos debido a intentos fallidos reiterados';


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
