import { Module } from '@nestjs/common';
import { LoginModule } from '../../login/login.module';
import {
  MultiFileAuthStateStore,
  WhatsappAuthStateStore,
} from './whatsapp-auth-state.store';
import { WhatsappAlertService } from './whatsapp-alert.service';
import { WhatsappConnectionService } from './whatsapp-connection.service';
import { WhatsappController } from './whatsapp.controller';

@Module({
  imports: [LoginModule], // JwtAuthGuard + RolesGuard
  controllers: [WhatsappController],
  providers: [
    // Para guardar la sesión en PostgreSQL basta con cambiar useClass.
    { provide: WhatsappAuthStateStore, useClass: MultiFileAuthStateStore },
    WhatsappConnectionService,
    WhatsappAlertService,
  ],
  exports: [WhatsappAlertService, WhatsappConnectionService],
})
export class WhatsappModule {}
