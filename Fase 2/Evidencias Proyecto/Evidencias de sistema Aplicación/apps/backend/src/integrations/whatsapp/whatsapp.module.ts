import { Module } from '@nestjs/common';
import { LoginModule } from '../../login/login.module';
import {
  MultiFileAuthStateStore,
  WhatsappAuthStateStore,
} from './whatsapp-auth-state.store';
import { WhatsappAlertService } from './whatsapp-alert.service';
import { WhatsappConnectionService } from './whatsapp-connection.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappSosDispatcher } from './whatsapp-sos-dispatcher.service';

@Module({
  imports: [LoginModule], 
  controllers: [WhatsappController],
  providers: [
    { provide: WhatsappAuthStateStore, useClass: MultiFileAuthStateStore },
    WhatsappConnectionService,
    WhatsappAlertService,
    WhatsappSosDispatcher,
  ],
  exports: [WhatsappAlertService, WhatsappConnectionService],
})
export class WhatsappModule {}
