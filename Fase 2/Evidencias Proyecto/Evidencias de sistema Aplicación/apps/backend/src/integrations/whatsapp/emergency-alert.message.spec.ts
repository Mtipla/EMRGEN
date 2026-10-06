import {
  buildEmergencyAlertText,
  buildLocationMessage,
} from './emergency-alert.message';

const location = { lat: -33.4378, lng: -70.6504, address: 'Plaza de Armas, Santiago' };

describe('buildEmergencyAlertText', () => {
  it('incluye el remitente, el mensaje, la dirección y el link de Maps', () => {
    const text = buildEmergencyAlertText({
      senderName: 'Ana',
      message: 'Me caí y no puedo levantarme',
      location,
    });

    expect(text).toContain('*Ana* activó una alerta');
    expect(text).toContain('💬 *Mensaje:* Me caí y no puedo levantarme');
    expect(text).toContain('📍 *Ubicación:* Plaza de Armas, Santiago');
    expect(text).toContain(
      'https://www.google.com/maps/search/?api=1&query=-33.4378,-70.6504',
    );
    expect(text).toContain('SAMU 131');
  });

  it('omite la sección médica si no viene', () => {
    const text = buildEmergencyAlertText({ message: 'Ayuda', location });
    expect(text).not.toContain('médica');
    expect(text).toContain('Un usuario de EMERGEN');
  });

  it('agrega el resumen y el enlace a la ficha médica', () => {
    const text = buildEmergencyAlertText({
      message: 'Ayuda',
      location,
      medicalInfo: { summary: 'Alergia a la penicilina', url: 'https://emergen.cl/f/abc' },
    });
    expect(text).toContain('🩺 *Información médica:* Alergia a la penicilina');
    expect(text).toContain('🔗 *Ficha médica:* https://emergen.cl/f/abc');
  });
});

describe('buildLocationMessage', () => {
  it('arma el pin de ubicación nativo', () => {
    expect(buildLocationMessage(location)).toEqual({
      location: {
        degreesLatitude: -33.4378,
        degreesLongitude: -70.6504,
        name: 'Ubicación de la emergencia',
        address: 'Plaza de Armas, Santiago',
      },
    });
  });
});
