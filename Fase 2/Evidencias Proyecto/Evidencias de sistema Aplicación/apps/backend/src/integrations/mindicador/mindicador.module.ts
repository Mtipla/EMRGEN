import { Module } from '@nestjs/common';
import { MindicadorController } from './mindicador.controller';
import { MindicadorService } from './mindicador.service';

@Module({
  controllers: [MindicadorController],
  providers: [MindicadorService],
  exports: [MindicadorService],
})
export class MindicadorModule {}
