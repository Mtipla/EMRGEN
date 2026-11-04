import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const apkPath = resolve(root, 'apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk');
const output = resolve(root, 'apps/web/public/downloads');
const apk = await readFile(apkPath);
if (apk.readUInt32LE(0) !== 0x04034b50) throw new Error('El archivo no es una APK válida.');
const metadata = JSON.parse(await readFile(resolve(root, 'apps/mobile/android/app/src/main/assets/public/android-build.json'), 'utf8'));
if (!['android-lan', 'android-production'].includes(metadata.mode)) throw new Error('La descarga requiere una compilación android-lan o android-production.');
await mkdir(output, { recursive: true });
await copyFile(apkPath, resolve(output, 'emergen.apk'));
const download = {
  ...metadata,
  file: 'emergen.apk',
  bytes: apk.length,
  sha256: createHash('sha256').update(apk).digest('hex'),
};
await writeFile(resolve(output, 'android-build.json'), JSON.stringify(download, null, 2) + '\n');
console.log(`APK ${download.version}: ${resolve(output, download.file)}`);
console.log(`SHA-256: ${download.sha256}`);
