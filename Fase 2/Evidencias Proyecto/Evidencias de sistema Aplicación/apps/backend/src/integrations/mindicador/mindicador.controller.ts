import { Controller, Get, Param, Query } from '@nestjs/common';
import type { EconomicIndicator } from '@repo/api-types';
import {
  IndicatorParamDto,
  IndicatorQueryDto,
} from './dto/indicator-query.dto';
import { MindicadorService } from './mindicador.service';

@Controller('indicators')
export class MindicadorController {
  constructor(private readonly mindicadorService: MindicadorService) {}

  @Get()
  today(): Promise<EconomicIndicator[]> {
    return this.mindicadorService.today();
  }

  @Get(':code')
  get(
    @Param() { code }: IndicatorParamDto,
    @Query() { date }: IndicatorQueryDto,
  ): Promise<EconomicIndicator> {
    return this.mindicadorService.get(code, date);
  }
}
