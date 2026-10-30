import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EventEmitter } from 'node:events';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';
import { createHash } from 'node:crypto';
import { parseEnv } from 'node:util';

const source = fs.readFileSync(new URL('./backup-db.mjs', import.meta.url), 'utf8');
for (const collision of [false, true]) {
  test(collision ? 'no sobrescribe un respaldo temporal existente' : 'finaliza respaldo sintético y manifiesto sin Docker', async () => {
    const temporary = fs.mkdtempSync(join(tmpdir(), 'emergen-backup-isolated-'));
    const directory = join(temporary, 'backups');
    const archive = join(directory, 'emergen-2000-01-01T00-00-00-000Z.dump');
    fs.mkdirSync(directory);
    if (collision) fs.writeFileSync(archive, 'preserve-existing-test-file');
    const calls = [];
    const context = createContext({ URL, console: { log() {} }, process: { env: {} },
      Date: class extends Date { constructor() { super('2000-01-01T00:00:00.000Z'); } } });
    const files = { ...fs, readFileSync: (file, ...args) => String(file).endsWith('.env')
      ? 'DB_USER=synthetic\nDB_NAME=synthetic_test\n' : fs.readFileSync(file, ...args) };
    const modules = {
      'node:fs': files,
      'node:crypto': { createHash },
      'node:path': { resolve: (...args) => join(...args) },
      'node:url': { fileURLToPath: () => temporary },
      'node:util': { parseEnv },
      'node:child_process': { spawn: (_binary, args, options) => {
        calls.push(args);
        if (args.includes('pg_dump')) fs.writeSync(options.stdio[1], 'synthetic-dump-only');
        const child = new EventEmitter();
        queueMicrotask(() => child.emit('exit', 0));
        return child;
      } },
    };
    try {
      const module = new SourceTextModule(source, { context, initializeImportMeta(meta) { meta.url = 'file:///synthetic/scripts/backup-db.mjs'; } });
      await module.link((name) => {
        assert.ok(Object.hasOwn(modules, name), 'No unmocked import');
        const entries = modules[name];
        return new SyntheticModule(Object.keys(entries), function () {
          for (const [key, value] of Object.entries(entries)) this.setExport(key, value);
        }, { context });
      });
      if (collision) {
        await assert.rejects(module.evaluate(), /no se sobrescribe/);
        assert.equal(fs.readFileSync(archive, 'utf8'), 'preserve-existing-test-file');
        assert.equal(fs.existsSync(archive + '.json'), false);
      } else {
        await module.evaluate();
        assert.equal(fs.readFileSync(archive, 'utf8'), 'synthetic-dump-only');
        assert.equal(JSON.parse(fs.readFileSync(archive + '.json', 'utf8')).archiveReadable, true);
      }
      assert.equal(calls.length, 2);
      assert.ok(calls[0].includes('pg_dump') && calls[1].includes('pg_restore'));
    } finally {
      // Delete only known files in the newly-created temporary directory; no recursive removal.
      for (const file of fs.readdirSync(directory)) {
        const path = join(directory, file);
        assert.ok(fs.lstatSync(path).isFile());
        fs.unlinkSync(path);
      }
      fs.rmdirSync(directory);
      fs.rmdirSync(temporary);
    }
  });
}
