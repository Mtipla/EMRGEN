import { Module } from '@nestjs/common';
import { MindicadorController } from './mindicador.controller';
import { MindicadorService } from './mindicador.service';
import { LoginModule } from '../../login/login.module';

@Module({
  imports: [LoginModule],
  controllers: [MindicadorController],
  providers: [MindicadorService],
  exports: [MindicadorService],
})
export class MindicadorModule {}
