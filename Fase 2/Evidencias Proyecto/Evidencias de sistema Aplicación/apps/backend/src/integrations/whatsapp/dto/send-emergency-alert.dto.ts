import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
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
    message: 'cada número de recipients debe tener solo dígitos (8 a 15), con "+" opcional',
  })
  recipients: string[];

  @IsOptional()
  @IsString()
  @Length(1, 50)
  senderName?: string;

  // Mismo largo que USUARIO_MENSAJE_PERSONALIZADO.mensaje.
  @IsString()
  @Length(1, 200)
  message: string;

  @ValidateNested()
  @Type(() => EmergencyAlertLocationDto)
  location: EmergencyAlertLocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyAlertMedicalInfoDto)
  medicalInfo?: EmergencyAlertMedicalInfoDto;
}
