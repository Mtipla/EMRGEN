import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsISO8601,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import type {
  EmergencyAlertLocation,
  EmergencyAlertMedicalInfo,
  SendEmergencyAlertRequest,
} from '@repo/api-types';
import { PHONE_NUMBER } from '../phone-number';
import { MAX_RECIPIENTS } from '../whatsapp.constants';
import { FichaMedicaDto } from '../../../perfil/dto/perfil.dto';

export class EmergencyAlertLocationDto implements EmergencyAlertLocation {
  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;

  // Mismo largo que UBICACION_ALERTA.ubicacion.
  @IsOptional()
  @IsString()
  @Length(1, 150)
  address?: string;
}

export class EmergencyAlertMedicalInfoDto implements EmergencyAlertMedicalInfo {
  @IsOptional()
  @ValidateNested()
  @Type(() => FichaMedicaDto)
  record?: FichaMedicaDto;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  summary?: string;

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url?: string;
}

export class SendEmergencyAlertDto implements SendEmergencyAlertRequest {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_RECIPIENTS)
  @Matches(PHONE_NUMBER, {
    each: true,
    message:
      'cada número de recipients debe tener solo dígitos (8 a 15), con "+" opcional',
  })
  recipients: string[];

  @IsOptional()
  @IsString()
  @Length(1, 50)
  senderName?: string;

  @IsOptional()
  @IsEmail()
  @Length(1, 100)
  senderEmail?: string;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @IsOptional()
  @IsIn(['MEDICO', 'URBANO', 'EMERGENCIA', 'ADULTO MAYOR'])
  emergencyType?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  locationLabel?: string;

  // Mismo largo que USUARIO_MENSAJE_PERSONALIZADO.mensaje.
  @IsString()
  @Length(1, 200)
  message: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyAlertLocationDto)
  location?: EmergencyAlertLocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyAlertMedicalInfoDto)
  medicalInfo?: EmergencyAlertMedicalInfoDto;

  @IsOptional()
  @IsBoolean()
  includeMedicalInfo?: boolean;
}
