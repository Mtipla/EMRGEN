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

const recortar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Fila de CONTACTO_EMERGENCIA (init.sql: nombre ≤ 20, número E.164). */
export class ContactoDto {
  @Transform(recortar)
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  nombre_contacto!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\s/g, '') : value,
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
  @MaxLength(200)
  mensaje?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => FichaMedicaDto)
  ficha_medica?: FichaMedicaDto | null;
}
