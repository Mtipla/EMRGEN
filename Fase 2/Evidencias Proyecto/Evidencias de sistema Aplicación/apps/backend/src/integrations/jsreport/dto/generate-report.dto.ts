import { IsObject, IsOptional, Matches } from 'class-validator';
import type { GenerateReportRequest } from '@repo/api-types';

export class GenerateReportDto implements GenerateReportRequest {
  @Matches(/^[\w\-/ ]{1,100}$/, {
    message:
      'templateName solo admite letras, números, espacios, "-", "_" y "/"',
  })
  templateName: string;

  @IsObject()
  data: Record<string, unknown>;

  @IsOptional()
  @Matches(/^[\w-]{1,100}$/, {
    message: 'fileName solo admite letras, números, "-" y "_"',
  })
  fileName?: string;
}
