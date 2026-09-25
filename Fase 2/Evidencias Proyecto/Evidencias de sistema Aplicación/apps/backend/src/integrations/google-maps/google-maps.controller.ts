import { Controller, Get, Query } from '@nestjs/common';
import type { GeocodeResult } from '@repo/api-types';
import {
  GeocodeQueryDto,
  ReverseGeocodeQueryDto,
} from './dto/geocode-query.dto';
import { GoogleMapsService } from './google-maps.service';

@Controller('maps')
export class GoogleMapsController {
  constructor(private readonly googleMapsService: GoogleMapsService) {}

  @Get('geocode')
  geocode(@Query() { address }: GeocodeQueryDto): Promise<GeocodeResult[]> {
    return this.googleMapsService.geocode(address);
  }

  @Get('reverse-geocode')
  reverseGeocode(
    @Query() point: ReverseGeocodeQueryDto,
  ): Promise<GeocodeResult[]> {
    return this.googleMapsService.reverseGeocode(point);
  }
}
