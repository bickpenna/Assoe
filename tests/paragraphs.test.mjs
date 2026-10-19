import assert from 'node:assert/strict';
import { test } from 'node:test';
import { toParagraphs } from '../src/utils/paragraphs.ts';

test('divide il testo in paragrafi mantenendo il contenuto letterale', () => {
  assert.deepEqual(toParagraphs('  Primo paragrafo.\n\nSecondo <b>testo</b>.  '), [
    'Primo paragrafo.',
    'Secondo <b>testo</b>.',
  ]);
});

test('gestisce testo assente, vuoto e soli spazi', () => {
  assert.deepEqual(toParagraphs(undefined), []);
  assert.deepEqual(toParagraphs(''), []);
  assert.deepEqual(toParagraphs(' \n \n '), []);
});

test('non crea paragrafi vuoti con più righe di separazione', () => {
  assert.deepEqual(toParagraphs('Uno\n\n\nDue'), ['Uno', 'Due']);
});
