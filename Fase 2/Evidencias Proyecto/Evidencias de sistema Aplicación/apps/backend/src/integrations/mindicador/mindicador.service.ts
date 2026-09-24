import { Injectable } from '@nestjs/common';
import type { EconomicIndicator, IndicatorCode } from '@repo/api-types';
import { readEnv } from '../../config/env';
import { requestExternalJson } from '../http-client';
import { INDICATOR_CODES } from './dto/indicator-query.dto';

const INTEGRATION = 'mindicador';
const DEFAULT_URL = 'https://mindicador.cl/api';

interface MindicadorSerie {
  codigo: IndicatorCode;
  nombre: string;
  unidad_medida: string;
  serie: Array<{ fecha: string; valor: number }>;
}

interface MindicadorDaily {
  codigo: IndicatorCode;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

/**
 * mindicador.cl: indicadores económicos de Chile (UF, dólar, euro, UTM, IPC...).
 * API pública y gratuita, no requiere API key. Sirve para mostrar precios en CLP
 * junto a los cobros en USD de PayPal.
 */
@Injectable()
export class MindicadorService {
  private get baseUrl(): string {
    return (readEnv('MINDICADOR_API_URL') ?? DEFAULT_URL).replace(/\/+$/, '');
  }

  /** Valor del día de todos los indicadores. */
  async today(): Promise<EconomicIndicator[]> {
    const body = await requestExternalJson<
      Partial<Record<IndicatorCode, MindicadorDaily>>
    >(INTEGRATION, this.baseUrl);

    return INDICATOR_CODES.flatMap((code) => {
      const item = body[code];
      if (!item) return [];
      return [
        {
          code,
          name: item.nombre,
          unit: item.unidad_medida,
          series: [{ date: item.fecha, value: item.valor }],
        },
      ];
    });
  }

  /** Serie del último mes, o solo el día indicado (`date` en dd-mm-yyyy). */
  async get(code: IndicatorCode, date?: string): Promise<EconomicIndicator> {
    const path = date ? `${code}/${date}` : code;
    const body = await requestExternalJson<MindicadorSerie>(
      INTEGRATION,
      `${this.baseUrl}/${path}`,
    );
    return {
      code: body.codigo,
      name: body.nombre,
      unit: body.unidad_medida,
      series: body.serie.map(({ fecha, valor }) => ({
        date: fecha,
        value: valor,
      })),
    };
  }
}
