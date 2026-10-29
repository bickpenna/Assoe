import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDate, formatDateTime } from '../src/utils/date.ts';
import { eventStatusLabel } from '../src/utils/labels.ts';

test('le date usano il calendario italiano anche vicino alla mezzanotte UTC', () => {
  assert.equal(formatDate('2026-10-28T23:30:00Z'), '29 ottobre 2026');
  assert.equal(formatDate('2026-07-01T22:30:00Z'), '2 luglio 2026');
});

test('gli orari rispettano ora solare e legale di Roma', () => {
  assert.equal(formatDateTime('2026-01-15T12:00:00Z'), '15 gennaio 2026 alle ore 13:00');
  assert.equal(formatDateTime('2026-07-15T12:00:00Z'), '15 luglio 2026 alle ore 14:00');
  assert.equal(formatDateTime('2026-10-25T00:30:00Z'), '25 ottobre 2026 alle ore 02:30');
  assert.equal(formatDateTime('2026-10-25T01:30:00Z'), '25 ottobre 2026 alle ore 02:30');
});

test('le date non valide producono un errore esplicito', () => {
  for (const input of ['', 'non-una-data']) {
    assert.throws(() => formatDate(input), RangeError);
    assert.throws(() => formatDateTime(input), RangeError);
  }
});

test('tutti gli stati degli eventi hanno la propria etichetta italiana', () => {
  assert.deepEqual(['scheduled', 'ongoing', 'completed', 'cancelled'].map(eventStatusLabel), [
    'Programmato', 'In corso', 'Concluso', 'Annullato',
  ]);
});
