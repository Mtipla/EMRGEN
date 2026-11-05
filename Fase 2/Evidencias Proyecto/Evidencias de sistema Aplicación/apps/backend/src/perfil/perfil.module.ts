import { Module } from '@nestjs/common';
import { LoginModule } from '../login/login.module';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';

@Module({
  imports: [LoginModule], // JwtAuthGuard
  controllers: [PerfilController],
  providers: [PerfilService],
})
export class PerfilModule {}
