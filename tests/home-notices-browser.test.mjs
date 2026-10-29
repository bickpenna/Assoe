import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDom } from './helpers/dom.mjs';
import { initHomeNotices } from '../src/scripts/homeNotices.ts';

const markup = (dates) => `<section data-home-notices><ul>${dates.map((date) =>
  `<li class="home-notices__item"${date ? ` data-expires-on="${date}"` : ''}>Avviso</li>`,
).join('')}</ul></section>`;

function setup(t, dates, now = '2026-10-27T22:59:00Z') {
  const window = createDom(t, markup(dates));
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse(now) });
  const interval = t.mock.method(window, 'setInterval', () => 7);
  const clear = t.mock.method(window, 'clearInterval', () => {});
  initHomeNotices();
  return {
    window, interval, clear,
    section: window.document.querySelector('section'),
    items: [...window.document.querySelectorAll('li')],
  };
}

test('senza avvisi non avvia timer né registra aggiornamenti', (t) => {
  const window = createDom(t, '');
  const interval = t.mock.method(window, 'setInterval');
  initHomeNotices();
  assert.equal(interval.mock.callCount(), 0);
});

test('nasconde solo gli avvisi già scaduti e conserva quelli senza scadenza', (t) => {
  const { items, section, interval } = setup(t, ['2026-10-26', '2026-10-27', undefined]);
  assert.deepEqual(items.map((item) => item.hidden), [true, false, false]);
  assert.equal(section.hidden, false);
  assert.equal(interval.mock.calls[0].arguments[1], 60_000);
});

test('alla mezzanotte italiana nasconde la sezione vuota e arresta il timer', (t) => {
  const { items, section, interval, clear } = setup(t, ['2026-10-27']);
  assert.equal(section.hidden, false);
  t.mock.timers.setTime(Date.parse('2026-10-27T23:00:00Z'));
  interval.mock.calls[0].arguments[0]();
  assert.equal(items[0].hidden, true);
  assert.equal(section.hidden, true);
  assert.deepEqual(clear.mock.calls[0].arguments, [7]);
});

test('mantiene il timer per gli avvisi futuri e lo ferma lasciando quelli permanenti', (t) => {
  const { items, section, interval, clear } = setup(t, ['2026-10-28', undefined]);
  const tick = interval.mock.calls[0].arguments[0];
  tick();
  assert.equal(clear.mock.callCount(), 0);
  t.mock.timers.setTime(Date.parse('2026-10-28T23:00:00Z'));
  tick();
  assert.deepEqual(items.map((item) => item.hidden), [true, false]);
  assert.equal(section.hidden, false);
  assert.equal(clear.mock.callCount(), 1);
});

test('aggiorna gli avvisi quando la scheda torna visibile', (t) => {
  const { window, items } = setup(t, ['2026-10-27']);
  t.mock.timers.setTime(Date.parse('2026-10-27T23:00:00Z'));
  Object.defineProperty(window.document, 'hidden', { configurable: true, value: true });
  window.document.dispatchEvent(new window.Event('visibilitychange'));
  assert.equal(items[0].hidden, false);
  Object.defineProperty(window.document, 'hidden', { configurable: true, value: false });
  window.document.dispatchEvent(new window.Event('visibilitychange'));
  assert.equal(items[0].hidden, true);
});

test('senza scadenze non avvia controlli periodici', (t) => {
  const { section, interval } = setup(t, [undefined]);
  assert.equal(section.hidden, false);
  assert.equal(interval.mock.callCount(), 0);
});
