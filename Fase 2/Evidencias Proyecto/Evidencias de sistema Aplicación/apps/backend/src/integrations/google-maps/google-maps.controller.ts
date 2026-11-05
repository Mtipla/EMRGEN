import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../login/jwt-auth.guard';
import type { GeocodeResult } from '@repo/api-types';
import {
  GeocodeQueryDto,
  ReverseGeocodeQueryDto,
} from './dto/geocode-query.dto';
import { GoogleMapsService } from './google-maps.service';

@Controller('maps')
@UseGuards(JwtAuthGuard)
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
