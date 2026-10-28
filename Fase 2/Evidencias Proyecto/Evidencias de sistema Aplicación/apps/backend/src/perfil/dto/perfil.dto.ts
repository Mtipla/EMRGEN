import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const recortar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * CA-03.1: lleva el número a E.164 para que dos escrituras del mismo número sean iguales
 * ("+56 9 1234 5678", "(9) 1234-5678", "912345678" con Chile por defecto). Si no se reconoce,
 * solo quita espacios y @Matches lo rechaza. Misma regla que packages/ui/perfil-form.tsx.
 */
export function normalizarTelefono(valor: string): string {
  const numero = parsePhoneNumberFromString(valor, 'CL');
  return numero?.isPossible() ? numero.number : valor.replace(/\s/g, '');
}

/** Fila de CONTACTO_EMERGENCIA (init.sql: nombre ≤ 20, número E.164). */
export class ContactoDto {
  @Transform(recortar)
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  nombre_contacto!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizarTelefono(value) : value,
  )
  @Matches(/^[+][1-9][0-9]{1,14}$/, {
    message: 'El número debe estar en formato internacional, p. ej. +56912345678',
  })
  num_emergencia!: string;
}

/** Columnas de ANTECEDENTE_MEDICO; los textos son NOT NULL pero pueden ir vacíos. */
export class FichaMedicaDto {
  @IsString() @MaxLength(200) tipo_sangre!: string;
  @IsString() @MaxLength(500) alergias!: string;
  @IsString() @MaxLength(500) enfermedades_cronicas!: string;
  @IsString() @MaxLength(500) medicamentos_actuales!: string;
  @IsString() @MaxLength(500) discapacidad_presente!: string;
  @IsBoolean() donante_organos!: boolean;
}

/** Solo cambia lo que se envía; `null` borra (prioridad, mensaje o ficha). */
export class ActualizarPerfilDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  prioridad_ID?: number | null;

  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MaxLength(160, { message: 'El mensaje personalizado admite como máximo 160 caracteres' }) // CA-05.1
  mensaje?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => FichaMedicaDto)
  ficha_medica?: FichaMedicaDto | null;
}
