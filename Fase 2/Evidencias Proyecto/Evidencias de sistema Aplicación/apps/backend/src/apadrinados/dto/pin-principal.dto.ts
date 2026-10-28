import { Matches } from 'class-validator';
import { ActualizarEstadoDto } from '../../admin/dto/actualizar-estado.dto';
import { CrearPinDto } from '../../login/dto/crear-pin.dto';

const PIN = /^\d{4}$/;
const MENSAJE = { message: 'El PIN de la cuenta principal debe tener exactamente 4 dígitos' };

/** HU-10: PIN del principal que autoriza una acción crítica sobre un apadrinado. */
export class PinPrincipalDto {
  @Matches(PIN, MENSAJE)
  PIN_principal!: string;
}

export class CambiarAccesoApadrinadoDto extends ActualizarEstadoDto {
  @Matches(PIN, MENSAJE)
  PIN_principal!: string;
}

/** `PIN` es el nuevo PIN del apadrinado; `PIN_principal`, el que autoriza el cambio. */
export class DefinirPinApadrinadoDto extends CrearPinDto {
  @Matches(PIN, MENSAJE)
  PIN_principal!: string;
}
