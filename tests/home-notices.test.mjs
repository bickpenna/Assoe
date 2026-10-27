import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  hasVisibleText,
  isCalendarDate,
  isHomeNoticeExpired,
  todayInRome,
} from '../shared/homeNotices.ts';

test('titolo e testo degli avvisi devono contenere caratteri visibili', () => {
  assert.equal(hasVisibleText('Avviso'), true);
  assert.equal(hasVisibleText('  Avviso  '), true);
  assert.equal(hasVisibleText(' \n\t '), false);
  assert.equal(hasVisibleText(undefined), false);
  assert.equal(hasVisibleText(42), false);
});

test('accetta solo date di calendario reali nel formato Sanity', () => {
  assert.equal(isCalendarDate('2028-02-29'), true);
  assert.equal(isCalendarDate('2026-02-29'), false);
  assert.equal(isCalendarDate('2026-10-27'), true);
  assert.equal(isCalendarDate('2026-10-27T00:00:00Z'), false);
  assert.equal(isCalendarDate('2026-13-01'), false);
  assert.equal(isCalendarDate(null), false);
});

test('la scadenza include tutta la giornata nel fuso Europe/Rome', () => {
  assert.equal(todayInRome(new Date('2026-10-27T22:59:00Z')), '2026-10-27');
  assert.equal(todayInRome(new Date('2026-10-27T23:00:00Z')), '2026-10-28');
  assert.equal(todayInRome(new Date('2026-07-01T21:59:00Z')), '2026-07-01');
  assert.equal(todayInRome(new Date('2026-07-01T22:00:00Z')), '2026-07-02');
  assert.equal(isHomeNoticeExpired('2026-10-27', '2026-10-27'), false);
  assert.equal(isHomeNoticeExpired('2026-10-27', '2026-10-28'), true);
  assert.equal(isHomeNoticeExpired(undefined, '2026-10-28'), false);
});
