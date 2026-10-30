import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../studio/scripts/check-audit.mjs', import.meta.url));
const report = (vulnerabilities = {}) => ({
  auditReportVersion: 2,
  vulnerabilities,
  metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 } },
});
const vulnerability = (source, overrides = {}) => ({
  severity: 'high',
  via: [{ source }],
  fixAvailable: { name: 'sanity', isSemVerMajor: true },
  ...overrides,
});

function runAudit(t, { data = report(), status = 0, stdout = JSON.stringify(data), stderr = '' } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'assoe-audit-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const payload = JSON.stringify({ stdout, stderr, status });
  fs.writeFileSync(path.join(directory, 'npm'), `#!${process.execPath}\nconst result = ${payload};\nprocess.stdout.write(result.stdout);\nprocess.stderr.write(result.stderr);\nprocess.exit(result.status);\n`, { mode: 0o755 });
  return spawnSync(process.execPath, [script], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${directory}${path.delimiter}${process.env.PATH}` },
  });
}

test('l’audit dello Studio accetta un report senza vulnerabilità high o critical', (t) => {
  assert.equal(runAudit(t).status, 0);
  assert.equal(runAudit(t, { data: report({ dependency: vulnerability(123, { severity: 'moderate', fixAvailable: true }) }) }).status, 0);
});

test('l’audit rifiuta errori di rete e report assenti o malformati, anche con codice di uscita zero', (t) => {
  for (const stdout of ['', 'non-json', 'null', '[]', '{}', JSON.stringify({ error: { code: 'ENOTFOUND' } }),
    JSON.stringify({ auditReportVersion: 2, vulnerabilities: {} }),
    JSON.stringify({ ...report(), vulnerabilities: [] }),
    JSON.stringify({ ...report(), auditReportVersion: 1 })]) {
    assert.notEqual(runAudit(t, { stdout }).status, 0, stdout);
  }
  assert.notEqual(runAudit(t, { data: { error: { code: 'ENOTFOUND' } }, status: 1 }).status, 0);
});

test('l’audit rifiuta un errore di npm anche se lo stdout contiene un report leggibile', (t) => {
  const result = runAudit(t, { status: 2, stderr: 'Audit non completato' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Audit non completato/);
  assert.notEqual(runAudit(t, { status: 1 }).status, 0);
});

test('l’audit blocca nuove advisory high e critical senza estendere l’eccezione nota', (t) => {
  for (const severity of ['high', 'critical']) {
    const result = runAudit(t, { data: report({ undici: vulnerability(9999999, { severity }) }), status: 1 });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /9999999/);
  }
});

test('l’eccezione documentata resta limitata all’advisory nota senza correzioni compatibili', (t) => {
  const result = runAudit(t, { data: report({ dependency: vulnerability(1240992) }), status: 1 });
  assert.equal(result.status, 0);
  assert.match(result.stderr, /1240992/);
  for (const fixAvailable of [true, { name: 'dependency', isSemVerMajor: false }]) {
    assert.equal(runAudit(t, { data: report({ dependency: vulnerability(1240992, { fixAvailable }) }), status: 1 }).status, 1);
  }
  const mixed = report({ dependency: vulnerability(1240992, { via: [{ source: 1240992 }, { source: 9999999 }] }) });
  assert.equal(runAudit(t, { data: mixed, status: 1 }).status, 1);
});

test('il lockfile dello Studio risolve solo undici della serie 7 con le patch di sicurezza', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../studio/package.json', import.meta.url), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(new URL('../studio/package-lock.json', import.meta.url), 'utf8'));
  assert.equal(manifest.overrides['@module-federation/dts-plugin'].undici, '^7.30.1');
  const versions = Object.entries(lock.packages).filter(([name]) => name.endsWith('/undici')).map(([, entry]) => entry.version);
  assert.ok(versions.length > 0);
  for (const version of versions) {
    const [major, minor, patch] = version.split('.').map(Number);
    assert.equal(major, 7);
    assert.ok(minor > 30 || (minor === 30 && patch >= 1), `undici vulnerabile: ${version}`);
  }
});
