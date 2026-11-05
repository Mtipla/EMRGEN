// Public package names/versions only; no project sources, credentials or tokens sent.
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const lock = JSON.parse(readFileSync(new URL('package-lock.json', root), 'utf8'));
const selected = ['@nestjs/core', '@nestjs/platform-express', '@nestjs/jwt', 'typeorm', 'pg', 'bcrypt',
  'jsonwebtoken', 'jwks-rsa', '@whiskeysockets/baileys', 'firebase', 'react', 'react-router-dom', 'axios',
  'electron', 'vite', '@capacitor/core', '@capacitor/android'];
const npm = selected.map(name => `${name}@${lock.packages['node_modules/' + name].version}`);
const pip = [...readFileSync(new URL('services/internal-api/locks/requirements-linux-py312.lock', root), 'utf8')
  .matchAll(/^([\w-]+)==([\w.]+)/gm)].map(match => match[1] + '@' + match[2]);
const results = [];
for (const [ecosystem, packages] of [['npm', npm], ['pip', pip]]) {
  const url = new URL('https://api.github.com/advisories');
  url.search = new URLSearchParams({ type: 'reviewed', is_withdrawn: 'false', per_page: '100', ecosystem, affects: packages.join(',') });
  try {
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28' }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      results.push({ ecosystem, ok: false, status: response.status, packages });
      continue;
    }
    const advisories = await response.json();
    results.push({ ecosystem, ok: true, packages, more_pages: /rel="next"/.test(response.headers.get('link') || ''),
      advisories: advisories.map(item => ({ id: item.ghsa_id, severity: item.severity, summary: item.summary,
        url: item.html_url, withdrawn: item.withdrawn_at, affected: item.vulnerabilities.map(v => ({
          name: v.package.name, range: v.vulnerable_version_range, first_patched: v.first_patched_version })) })) });
  } catch { results.push({ ecosystem, ok: false, status: 'network_unavailable', packages }); }
}
console.log(JSON.stringify({ source: 'GitHub reviewed public advisories', checked_at: new Date().toISOString(), results }));
if (results.some(r => !r.ok || r.more_pages)) process.exitCode = 1;
