// Guardrail for isolated checks. No project env files, existing services or egress.
const net = require('node:net');
const fs = require('node:fs');
const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  // Node can pass an already-normalized [options, callback] as its first argument.
  const options = net._normalizeArgs(Array.isArray(args[0]) ? args[0] : args)[0];
  const host = options.host || 'localhost';
  const port = Number(options.port);
  if (!['localhost', '127.0.0.1', '::1'].includes(host) ||
      !Number.isInteger(port) || port < 10000) {
    throw new Error('SECURITY_TEST: network destination blocked');
  }
  return originalConnect.apply(this, args);
};
global.fetch = async () => { throw new Error('SECURITY_TEST: fetch must be mocked'); };
for (const name of ['readFileSync', 'readFile']) {
  const original = fs[name];
  fs[name] = function (file, ...args) {
    if (/(?:^|[\\/])\.env(?:[.\\/]|$)/.test(String(file))) {
      throw new Error('SECURITY_TEST: env file access blocked');
    }
    return original.call(this, file, ...args);
  };
}
