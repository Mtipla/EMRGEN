import {
  buildEmergencyAlertText,
  buildFinalizedAlertText,
  buildLocationMessage,
  parseAlertLocation,
} from './emergency-alert.message';

const location = {
  lat: -33.4378,
  lng: -70.6504,
  address: 'Plaza de Armas, Santiago',
};

describe('buildEmergencyAlertText', () => {
  it('deshabilitado omite todo el bloque médico aunque reciba una ficha o resumen', () => {
    const text = buildEmergencyAlertText({
      senderName: 'Ana', message: 'Ayuda', location, includeMedicalInfo: false,
      medicalInfo: { summary: 'Dato médico privado', url: 'https://emergen.cl/f/privado' },
    });
    expect(text).toContain('Ayuda');
    expect(text).toContain('google.com/maps');
    expect(text).not.toMatch(/ANTECEDENTES|médico|privado|Sin antecedentes/i);
  });

  it('incluye el remitente, el mensaje, la dirección y el link de Maps', () => {
    const text = buildEmergencyAlertText({
      senderName: 'Ana',
      senderEmail: 'ana@emergen.test',
      occurredAt: '2026-10-26T15:30:00Z',
      emergencyType: 'URBANO',
      message: 'Me caí y no puedo levantarme',
      location,
    });

    expect(text).toContain('MENSAJE MEDIANTE APLICACIÓN EMERGEN');
    expect(text).toContain(
      'El usuario Ana de correo ana@emergen.test ha generado una alerta',
    );
    expect(text).toContain('"Me caí y no puedo levantarme"');
    expect(text).toContain('UBICACIÓN: Plaza de Armas, Santiago');
    expect(text).toContain(
      'https://www.google.com/maps/search/?api=1&query=-33.4378,-70.6504',
    );
    expect(text).toContain('12:30:00');
    expect(text).toContain('TIPO DE EMERGENCIA: URBANO');
    expect(text).toContain('America/Santiago');
  });

  it('informa si no hay antecedentes registrados', () => {
    const text = buildEmergencyAlertText({ message: 'Ayuda', location });
    expect(text).toContain('Sin antecedentes registrados.');
    expect(text).toContain('de correo no informado');
  });

  it('incluye un resumen médico sin incorporar enlaces ajenos al texto del SOS', () => {
    const text = buildEmergencyAlertText({
      message: 'Ayuda',
      location,
      medicalInfo: {
        summary: 'Alergia a la penicilina',
        url: 'https://emergen.cl/f/abc',
      },
    });
    expect(text).toContain('Alergia a la penicilina');
    expect(text).not.toContain('https://emergen.cl/f/abc');
  });

  it('incluye los seis antecedentes sin truncarlos ni confundir vacío con ausencia de enfermedad', () => {
    const text = buildEmergencyAlertText({
      message: 'Ayuda',
      medicalInfo: {
        record: {
          tipo_sangre: 'O+',
          alergias: 'Penicilina',
          enfermedades_cronicas: 'Asma',
          medicamentos_actuales: 'X'.repeat(500),
          discapacidad_presente: '',
          donante_organos: false,
        },
      },
    });
    expect(text).toContain('Tipo de sangre: O+');
    expect(text).toContain('Alergias: Penicilina');
    expect(text).toContain('Enfermedades crónicas: Asma');
    expect(text).toContain('Medicamentos actuales: ' + 'X'.repeat(500));
    expect(text).toContain('Discapacidad: No informado');
    expect(text).toContain('Donante de órganos: No');
  });

  it('explica la ausencia de ubicación sin inventar coordenadas', () => {
    const text = buildEmergencyAlertText({ message: 'Ayuda' });
    expect(text).toContain('UBICACIÓN: No disponible');
    expect(text).not.toContain('google.com');
  });

  it('conserva la marca de una ubicación simulada', () => {
    expect(
      buildEmergencyAlertText({
        message: 'Ayuda',
        location,
        locationLabel: 'SIMULADA: -33.4378,-70.6504',
      }),
    ).toContain('UBICACIÓN: SIMULADA:');
  });
});

test.each(['MEDICO', 'URBANO', 'EMERGENCIA', 'ADULTO MAYOR'])(
  'incluye el tipo %s sin sustituirlo por otro',
  (emergencyType) => {
    expect(
      buildEmergencyAlertText({ message: 'Ayuda', emergencyType }),
    ).toContain(`TIPO DE EMERGENCIA: ${emergencyType}`);
  },
);

test('el cierre tiene exactamente el formato solicitado, sin ubicación ni datos médicos', () => {
  expect(
    buildFinalizedAlertText({
      senderName: 'Ana',
      senderEmail: 'ana@emergen.test',
    }),
  ).toBe(
    'MENSAJE MEDIANTE APLICACIÓN EMERGEN\n------------------------------------\nLa alerta reciente del usuario Ana de correo ana@emergen.test, ha sido FINALIZADA',
  );
});

test('solo transforma coordenadas válidas en un pin de ubicación', () => {
  expect(parseAlertLocation('SIMULADA: -33.4378,-70.6504')).toEqual({
    lat: -33.4378,
    lng: -70.6504,
  });
  expect(parseAlertLocation('91,180')).toBeUndefined();
  expect(parseAlertLocation(null)).toBeUndefined();
  expect(parseAlertLocation('Santiago')).toBeUndefined();
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
