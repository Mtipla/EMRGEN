import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MindicadorModule } from '../integrations/mindicador/mindicador.module';
import { PaypalModule } from '../integrations/paypal/paypal.module';
import { LoginModule } from '../login/login.module';
import { Plan } from '../planes/plan.entity';
import { PlanUsuario } from '../planes/plan-usuario.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';
import { DetalleVenta } from './detalle-venta.entity';
import { Venta } from './venta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, DetalleVenta, Plan, PlanUsuario, Usuario]),
    LoginModule, // JwtAuthGuard
    PaypalModule,
    MindicadorModule,
  ],
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}
