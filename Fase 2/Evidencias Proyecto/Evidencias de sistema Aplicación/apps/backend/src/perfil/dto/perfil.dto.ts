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
  ValidateIf,
} from 'class-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const recortar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;


export function normalizarTelefono(valor: string): string {
  const numero = parsePhoneNumberFromString(valor, 'CL');
  return numero?.isPossible() ? numero.number : valor.replace(/\s/g, '');
}

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

  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  compartir_antecedentes?: boolean;
}

/** Columnas de ANTECEDENTE_MEDICO*/
export class FichaMedicaDto {
  @IsString() @MaxLength(200) tipo_sangre!: string;
  @IsString() @MaxLength(500) alergias!: string;
  @IsString() @MaxLength(500) enfermedades_cronicas!: string;
  @IsString() @MaxLength(500) medicamentos_actuales!: string;
  @IsString() @MaxLength(500) discapacidad_presente!: string;
  @IsBoolean() donante_organos!: boolean;
}

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
