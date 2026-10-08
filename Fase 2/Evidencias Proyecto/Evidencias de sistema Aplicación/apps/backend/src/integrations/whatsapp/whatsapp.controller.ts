import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type {
  EmergencyAlertResult,
  WhatsappPairingCodeResponse,
  WhatsappStatusResponse,
} from '@repo/api-types';
import { toBuffer } from 'qrcode';
import { JwtAuthGuard } from '../../login/jwt-auth.guard';
import { ROL, Roles } from '../../login/roles.decorator';
import { RolesGuard } from '../../login/roles.guard';
import { PairingCodeDto } from './dto/pairing-code.dto';
import { SendEmergencyAlertDto } from './dto/send-emergency-alert.dto';
import { WhatsappAlertService } from './whatsapp-alert.service';
import { WhatsappConnectionService } from './whatsapp-connection.service';

// Vincular el número emisor de EMERGEN y enviar alertas manuales es tarea de
// administración: todas las rutas exigen sesión y rol Administrador. Las alertas de los
// usuarios no pasan por aquí: el módulo de alertas inyecta WhatsappAlertService.
@Controller('notifications/whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL.ADMINISTRADOR)
export class WhatsappController {
  constructor(
    private readonly connection: WhatsappConnectionService,
    private readonly alerts: WhatsappAlertService,
  ) {}

  @Get('status')
  status(): WhatsappStatusResponse {
    return this.connection.getStatus();
  }

  /** QR vigente como PNG. Caduca cada ~20 s: el panel debe volver a pedirlo. */
  @Get('qr')
  @Header('Cache-Control', 'no-store')
  async qr(): Promise<StreamableFile> {
    const qr = this.connection.getQrCode();
    if (!qr) {
      throw new NotFoundException(
        `No hay un QR pendiente (estado: ${this.connection.getStatus().state}).`,
      );
    }
    const png = await toBuffer(qr, { width: 320, margin: 2 });
    return new StreamableFile(png, { type: 'image/png', disposition: 'inline' });
  }

  @Post('pairing-code')
  @HttpCode(200)
  async pairingCode(
    @Body() { phoneNumber }: PairingCodeDto,
  ): Promise<WhatsappPairingCodeResponse> {
    return { code: await this.connection.requestPairingCode(phoneNumber) };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(): Promise<WhatsappStatusResponse> {
    await this.connection.logout();
    return this.connection.getStatus();
  }

  /** Envío manual (pruebas o soporte). Responde 201 con el resultado por contacto. */
  @Post('alerts')
  sendAlert(@Body() dto: SendEmergencyAlertDto): Promise<EmergencyAlertResult> {
    return this.alerts.sendEmergencyAlert(dto);
  }
}
