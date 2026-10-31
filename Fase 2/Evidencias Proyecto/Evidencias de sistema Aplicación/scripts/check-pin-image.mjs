import { createRequire } from 'node:module';
import { randomInt } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const require = createRequire(new URL('../apps/backend/package.json', import.meta.url));
const bcrypt = require('bcrypt');
const pin = String(randomInt(10000)).padStart(4, '0');
const other = String((Number(pin) + 1) % 10000).padStart(4, '0');
const hash = await bcrypt.hash(pin, 12);
const program = `import json,sys,socket
socket.socket.connect=lambda *a,**k: (_ for _ in ()).throw(RuntimeError('Network blocked'))
from app.core.pin import verify_pin
d=json.load(sys.stdin)
assert verify_pin(d['valid'],d['hash']) is True
assert verify_pin(d['invalid'],d['hash']) is False
print('PIN image: 2/2 PASS; Nest bcrypt cost 12; no mounts or network')`;
const result = spawnSync('docker', ['run', '--rm', '--network=none', '--read-only', '--cap-drop=ALL',
  '--security-opt=no-new-privileges', '--pids-limit=32', '-i', '-e', 'EMERGEN_ENVIRONMENT=test',
  '--entrypoint=python', process.argv[2] || 'emergen-internal-security:20261029', '-c', program],
  { input: JSON.stringify({ valid: pin, invalid: other, hash }), encoding: 'utf8', windowsHide: true });
if (result.status === 0) process.stdout.write(result.stdout);
else console.error('PIN image check failed; no credential material printed.', result.error?.code || result.status);
process.exitCode = result.status ?? 1;
