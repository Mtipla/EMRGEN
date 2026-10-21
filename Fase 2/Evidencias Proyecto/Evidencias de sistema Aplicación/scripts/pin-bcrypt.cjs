// Fixed JSON protocol on stdin: no PIN in argv, shell, logs or responses.
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const bcrypt = createRequire(resolve(__dirname, '../apps/backend/package.json'))('bcrypt');
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; if (input.length > 2048) process.exit(2); });
process.stdin.on('end', async () => {
  try {
    const { pin, hash } = JSON.parse(input);
    if (!/^\d{4}$/.test(pin) || typeof hash !== 'string') process.exit(2);
    process.stdout.write(JSON.stringify(await bcrypt.compare(pin, hash)));
  } catch { process.exitCode = 2; }
});
