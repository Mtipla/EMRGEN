import { completeRows, reportLimit } from '../config/security';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  JsreportService,
  type RenderedReport,
} from '../integrations/jsreport/jsreport.service';
import {
  plantillaReporte,
  validarReporte,
  type FormatoReporte,
} from '../integrations/jsreport/formato-reporte';
import { PLANTILLA_TICKETS_EXCEL, PLANTILLA_TICKETS_PDF } from './plantilla-tickets';

export interface TicketCerrado {
  ticket_id: number;
  estado: string;
  usuario_id: number;
  nombre_usuario: string | null;
  correo_usuario: string | null;
  categoria: string;
  descripcion: string;
  solucion: string | null;
  trabajador_id: number | null;
  trabajador_nombre: string | null;
  trabajador_correo: string | null;
}

const FECHA_CHILE = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Santiago',
});

@Injectable()
export class AdminTicketsService {
  constructor(
    private readonly source: DataSource,
    private readonly jsreport: JsreportService,
  ) {}

  async generarReporte(formato: FormatoReporte = 'pdf'): Promise<RenderedReport> {
    // La consulta fija el estado en el servidor y no aplica la paginación de la bandeja.
    const tickets = await this.source.query<TicketCerrado[]>(`
      SELECT t.ticket_soporte_id AS ticket_id, e.estado_ticket AS estado,
             t.usuario_id, u.nombre_usuario, u.correo_usuario,
             c.nombre_categoria AS categoria, t.desc_ticket AS descripcion,
             s.solucion_caso AS solucion, s.trabajador_id,
             s.trabajador_nombre, s.trabajador_correo
      FROM ticket_soporte t
      JOIN estado_ticket e USING (estado_ticket_id)
      JOIN categoria_soporte c USING (categoria_soporte_id)
      LEFT JOIN soporte s USING (ticket_soporte_id)
      LEFT JOIN usuario u ON u.usuario_id = t.usuario_id
      WHERE UPPER(e.estado_ticket) = 'CERRADO'
      ORDER BY t.ticket_soporte_id DESC LIMIT $1
    `, [reportLimit() + 1]);
    completeRows(tickets);
    const reporte = await this.jsreport.renderInline(
      plantillaReporte(formato, PLANTILLA_TICKETS_PDF, PLANTILLA_TICKETS_EXCEL),
      {
        generado: FECHA_CHILE.format(new Date()),
        total: tickets.length,
        tickets: tickets.map((ticket) => ({
          ...ticket,
          nombre_usuario: ticket.nombre_usuario ?? 'Usuario sin nombre registrado',
          correo_usuario: ticket.correo_usuario ?? 'Sin correo registrado',
          solucion: ticket.solucion ?? 'Sin solución registrada',
          trabajador_nombre: ticket.trabajador_nombre ?? 'Sin trabajador registrado',
          trabajador_correo: ticket.trabajador_correo ?? 'Sin correo registrado',
        })),
      },
    );
    validarReporte(reporte, formato);
    return reporte;
  }
}
