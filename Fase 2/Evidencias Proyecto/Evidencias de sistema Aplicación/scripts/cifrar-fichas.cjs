// CA-11.1: lleva una BD existente a ANTECEDENTE_MEDICO cifrada. En una sola transacción
// cambia donante_organos a text y cifra con MEDICAL_DATA_KEYS las filas aún en claro.
// Repetible: omite valores ya cifrados. Instalación nueva (init.sql) no lo necesita.
//   node scripts/cifrar-fichas.cjs
const { createCipheriv, randomBytes } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { parseEnv } = require('node:util');

const CAMPOS = ['tipo_sangre', 'alergias', 'enfermedades_cronicas', 'medicamentos_actuales', 'discapacidad_presente', 'donante_organos'];

// Mismo formato y AAD que apps/backend/src/perfil/cifrado-medico.ts (lo comprueba su spec).
function claves(texto) {
  return new Map((texto ?? '').split(',').map((par) => {
    const [id, base64] = par.trim().split(':');
    const clave = Buffer.from(base64 ?? '', 'base64');
    if (!/^[a-z0-9]+$/i.test(id) || clave.length !== 32) throw new Error('MEDICAL_DATA_KEYS mal formada o ausente');
    return [id, clave];
  }));
}

function cifrar(texto, aad, mapa) {
  const [[id, clave]] = mapa;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', clave, iv).setAAD(Buffer.from(aad));
  const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  return [id, iv.toString('base64'), cipher.getAuthTag().toString('base64'), cifrado.toString('base64')].join(':');
}

const yaCifrado = (valor, mapa) => valor.split(':').length === 4 && mapa.has(valor.split(':')[0]);

async function main() {
  const { client } = require('./db-dev.cjs');
  const env = { ...parseEnv(readFileSync(resolve(__dirname, '../.env'), 'utf8')), ...process.env };
  const mapa = claves(env.MEDICAL_DATA_KEYS);
  const db = client();
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query('ALTER TABLE public.antecedente_medico ALTER COLUMN donante_organos TYPE text USING donante_organos::text');
    const { rows } = await db.query(`SELECT usuario_id, ${CAMPOS.join(', ')} FROM public.antecedente_medico FOR UPDATE`);
    let cifradas = 0;
    for (const fila of rows) {
      if (CAMPOS.every((c) => yaCifrado(fila[c], mapa))) continue;
      const valores = CAMPOS.map((c) => {
        // ::text de un boolean da 'true'/'false', lo mismo que String(boolean) en el backend.
        return yaCifrado(fila[c], mapa) ? fila[c] : cifrar(fila[c], `antecedente_medico:${fila.usuario_id}:${c}`, mapa);
      });
      await db.query(
        `UPDATE public.antecedente_medico SET ${CAMPOS.map((c, i) => `${c} = $${i + 2}`).join(', ')} WHERE usuario_id = $1`,
        [fila.usuario_id, ...valores],
      );
      cifradas++;
    }
    await db.query(`COMMENT ON TABLE public.antecedente_medico IS 'CA-11.1: las seis columnas de datos guardan AES-256-GCM (id_clave:iv:tag:cifrado) generado en backend con MEDICAL_DATA_KEYS; donante_organos cifra "true"/"false". Nunca almacenar en claro.'`);
    await db.query('COMMIT');
    console.log(JSON.stringify({ fichas: rows.length, cifradas }));
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    await db.end();
  }
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exitCode = 1; });
module.exports = { cifrar, claves };
