import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { requireEnv } from '../config/env';
import type { FichaMedicaDto } from './dto/perfil.dto';


export const CAMPOS_FICHA = [
  'tipo_sangre',
  'alergias',
  'enfermedades_cronicas',
  'medicamentos_actuales',
  'discapacidad_presente',
  'donante_organos',
] as const;

type Campo = (typeof CAMPOS_FICHA)[number];


function claves(): Map<string, Buffer> {
  const pares = requireEnv('MEDICAL_DATA_KEYS', 'El cifrado de la ficha médica').split(',');
  return new Map(
    pares.map((par) => {
      const [id, base64] = par.trim().split(':');
      const clave = Buffer.from(base64 ?? '', 'base64');
      if (!/^[a-z0-9]+$/i.test(id) || clave.length !== 32) throw new Error('MEDICAL_DATA_KEYS mal formada');
      return [id, clave] as const;
    }),
  );
}

export function cifrar(texto: string, aad: string): string {
  const [[id, clave]] = claves();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', clave, iv).setAAD(Buffer.from(aad));
  const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  return [id, iv, cipher.getAuthTag(), cifrado].map((p) => (typeof p === 'string' ? p : p.toString('base64'))).join(':');
}

export function descifrar(valor: string, aad: string): string {
  const [id, iv, tag, cifrado] = valor.split(':');
  const clave = claves().get(id);
  if (!clave || cifrado === undefined) throw new Error('Ficha médica cifrada con una clave desconocida');
  const decipher = createDecipheriv('aes-256-gcm', clave, Buffer.from(iv, 'base64'))
    .setAAD(Buffer.from(aad))
    .setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(cifrado, 'base64')), decipher.final()]).toString('utf8');
}

const aad = (usuarioId: number, campo: Campo) => `antecedente_medico:${usuarioId}:${campo}`;

export function cifrarFicha(usuarioId: number, ficha: FichaMedicaDto): string[] {
  return CAMPOS_FICHA.map((campo) => cifrar(String(ficha[campo]), aad(usuarioId, campo)));
}

export function descifrarFicha(usuarioId: number, fila: Record<Campo, string>): FichaMedicaDto {
  const [tipo_sangre, alergias, enfermedades_cronicas, medicamentos_actuales, discapacidad_presente, donante] =
    CAMPOS_FICHA.map((campo) => descifrar(fila[campo], aad(usuarioId, campo)));
  return {
    tipo_sangre,
    alergias,
    enfermedades_cronicas,
    medicamentos_actuales,
    discapacidad_presente,
    donante_organos: donante === 'true',
  };
}
