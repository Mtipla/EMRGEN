import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsString, Length } from 'class-validator';

export class GeocodeQueryDto {
  @IsString()
  @Length(3, 200)
  address: string;
}

export class ReverseGeocodeQueryDto {
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @Type(() => Number)
  @IsLongitude()
  lng: number;
}
