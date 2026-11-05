import { Matches } from 'class-validator';

export class CrearPinDto {
  @Matches(/^\d{4}$/, { message: 'El PIN debe tener exactamente 4 dígitos' })
  PIN!: string;
}
