import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { JsreportModule } from '../integrations/jsreport/jsreport.module';
import { LoginModule } from '../login/login.module';
import { Usuario } from '../usuarios/usuarios.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ApadrinadosController } from './apadrinados.controller';
import { ApadrinadosService } from './apadrinados.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    LoginModule, 
    UsuariosModule, 
    AdminModule, 
    JsreportModule, 
  ],
  controllers: [ApadrinadosController],
  providers: [ApadrinadosService],
})
export class ApadrinadosModule {}
