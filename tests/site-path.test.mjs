import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sitePath } from '../src/utils/sitePath.ts';

test('mantiene i link alla radice sul dominio definitivo', () => {
  assert.equal(sitePath('/', '/'), '/');
  assert.equal(sitePath('/iniziative/uno/#foto', '/'), '/iniziative/uno/#foto');
});

test('aggiunge la base di GitHub Pages a pagine, home e ancore', () => {
  assert.equal(sitePath('/', '/Assoe/'), '/Assoe/');
  assert.equal(sitePath('/iniziative/uno/#foto', '/Assoe/'), '/Assoe/iniziative/uno/#foto');
  assert.equal(sitePath('/eventi/pagina/2/', '/Assoe'), '/Assoe/eventi/pagina/2/');
});

test('rifiuta URL esterni o relativi', () => {
  for (const path of ['https://example.org', '//example.org', 'iniziative/']) {
    assert.throws(() => sitePath(path, '/Assoe/'), /Percorso interno non valido/);
  }
});
