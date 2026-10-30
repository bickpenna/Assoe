import assert from 'node:assert/strict';
import { test } from 'node:test';
import { eventDisplayStatus, getNextEvent, groupEventsByDate, groupEventsByYear, isEventArchived } from '../src/utils/events.ts';

import { eventArchivePages } from '../src/utils/eventArchive.ts';

const now = Date.parse('2026-10-19T12:00:00Z');
const event = (slug, date, status = 'scheduled') => ({ id: slug, slug, title: slug, date, status });

test('divide gli eventi e ordina futuri e passati in versi opposti', () => {
  const input = [
    event('passato-vecchio', '2026-09-01T10:00:00Z', 'completed'),
    event('futuro-lontano', '2026-11-01T10:00:00Z'),
    event('passato-recente', '2026-10-15T10:00:00Z', 'completed'),
    event('futuro-vicino', '2026-10-20T10:00:00Z'),
  ];

  const { future, past } = groupEventsByDate(input, now);

  assert.deepEqual(future.map(({ slug }) => slug), ['futuro-vicino', 'futuro-lontano']);
  assert.deepEqual(past.map(({ slug }) => slug), ['passato-recente', 'passato-vecchio']);
  assert.equal(input[0].slug, 'passato-vecchio');
});

test('la data archivia anche un evento rimasto in corso, un annullato non compare in home', () => {
  const events = [
    event('annullato', '2026-10-21T10:00:00Z', 'cancelled'),
    event('programmato', '2026-10-22T10:00:00Z'),
    event('in-corso', '2026-10-18T10:00:00Z', 'ongoing'),
  ];

  assert.deepEqual(groupEventsByDate(events, now).future.map(({ slug }) => slug), [
    'annullato', 'programmato',
  ]);
  assert.deepEqual(groupEventsByDate(events, now).past.map(({ slug }) => slug), ['in-corso']);
  assert.equal(getNextEvent(events, now)?.slug, 'programmato');
  assert.equal(getNextEvent(events.slice(0, 2), now)?.slug, 'programmato');
});

test('gli eventi di oggi restano in programma fino alla mezzanotte italiana, anche dopo l’orario di inizio', () => {
  const today = event('oggi', '2026-10-19T08:00:00Z');
  assert.equal(isEventArchived(today, now), false);
  assert.equal(getNextEvent([today], now), today);
  assert.equal(isEventArchived(today, Date.parse('2026-10-19T21:59:59.999Z')), false);
  assert.equal(isEventArchived(today, Date.parse('2026-10-19T22:00:00Z')), true);
});

test('il passaggio di giorno rispetta ora legale, ora solare, cambi d’ora e anno bisestile', () => {
  for (const [date, lastInstant, nextDay] of [
    ['2026-07-01T08:00:00Z', '2026-07-01T21:59:59.999Z', '2026-07-01T22:00:00Z'],
    ['2026-03-28T23:30:00Z', '2026-03-29T21:59:59.999Z', '2026-03-29T22:00:00Z'],
    ['2026-10-24T22:30:00Z', '2026-10-25T22:59:59.999Z', '2026-10-25T23:00:00Z'],
    ['2024-02-29T08:00:00Z', '2024-02-29T22:59:59.999Z', '2024-02-29T23:00:00Z'],
  ]) {
    const item = event('limite', date);
    assert.equal(isEventArchived(item, Date.parse(lastInstant)), false, date);
    assert.equal(isEventArchived(item, Date.parse(nextDay)), true, date);
  }
});

test('tutti gli stati vengono archiviati per data, mantenendo visibile l’annullamento', () => {
  for (const status of ['scheduled', 'ongoing', 'completed', 'cancelled']) {
    const past = event(status, '2026-10-18T10:00:00Z', status);
    const future = event(status, '2026-10-20T10:00:00Z', status);
    assert.equal(isEventArchived(past, now), true);
    assert.equal(eventDisplayStatus(past, now), status === 'cancelled' ? 'cancelled' : 'completed');
    assert.equal(isEventArchived(future, now), false);
    assert.equal(eventDisplayStatus(future, now), status);
    assert.equal(past.status, status);
  }
  assert.equal(getNextEvent([event('concluso', '2026-10-20T10:00:00Z', 'completed')], now), undefined);
});

test('l’archivio raggruppa per anno italiano e ordina anni ed eventi dal più recente', () => {
  const events = [
    event('vecchio', '2024-05-01T10:00:00Z'),
    event('fine-2025', '2025-12-31T22:59:59Z'),
    event('inizio-2026', '2025-12-31T23:00:00Z'),
    event('recente', '2026-02-01T10:00:00Z'),
  ];
  const before = structuredClone(events);
  assert.deepEqual(groupEventsByYear(events).map(({ year, events }) => [year, events.map(({ slug }) => slug)]), [
    ['2026', ['recente', 'inizio-2026']], ['2025', ['fine-2025']], ['2024', ['vecchio']],
  ]);
  assert.deepEqual(events, before);
});

test('paginazione completa e per anno non perdono né duplicano eventi e non includono quelli futuri', () => {
  const events = [[2024, 7], [2026, 13], [2025, 2]].flatMap(([year, count]) => (
    Array.from({ length: count }, (_, index) => event(`${year}-${index}`, `${year}-01-${String(index + 1).padStart(2, '0')}T10:00:00Z`))
  ));
  events.push(event('futuro', '2027-01-02T10:00:00Z'));
  const pages = eventArchivePages(events, Date.parse('2027-01-01T12:00:00Z'));
  assert.deepEqual(pages.map(({ route }) => route), [
    undefined, 'pagina/2', 'pagina/3', 'pagina/4',
    '2026', '2026/pagina/2', '2026/pagina/3', '2025', '2024', '2024/pagina/2',
  ]);
  const all = pages.filter(({ year }) => !year);
  const ids = all.flatMap(({ events }) => events.map(({ id }) => id));
  assert.equal(ids.length, 22);
  assert.equal(new Set(ids).size, 22);
  assert.ok(!ids.includes('futuro'));
  for (const page of pages) {
    assert.deepEqual(page.years, ['2026', '2025', '2024']);
    assert.ok(page.events.length <= 6);
    assert.equal(page.basePath, page.year ? `/eventi/archivio/${page.year}/` : '/eventi/archivio/');
  }
  for (const [year, total] of [['2026', 13], ['2025', 2], ['2024', 7]]) {
    const annual = pages.filter((page) => page.year === year);
    assert.ok(annual.every(({ totalItems }) => totalItems === total));
    assert.deepEqual(annual.flatMap(({ events }) => events.map(({ id }) => id)), ids.filter((id) => id.startsWith(year)));
  }
});

test('i limiti di sei eventi generano soltanto le pagine necessarie', () => {
  for (const count of [0, 1, 6, 7, 12]) {
    const events = Array.from({ length: count }, (_, index) => event(String(index), '2026-01-01T10:00:00Z'));
    const pages = eventArchivePages(events, now).filter(({ year }) => !year);
    assert.equal(pages.length, Math.max(1, Math.ceil(count / 6)));
    assert.equal(pages.flatMap(({ events }) => events).length, count);
    assert.deepEqual(pages.map(({ currentPage }) => currentPage), Array.from({ length: pages.length }, (_, index) => index + 1));
  }
});

test('elenchi vuoti e soli eventi futuri mantengono accessibile l’archivio senza anni inesistenti', () => {
  assert.deepEqual(groupEventsByDate([], now), { future: [], past: [] });
  assert.deepEqual(groupEventsByYear([]), []);
  assert.equal(getNextEvent([], now), undefined);
  for (const events of [[], [event('futuro', '2026-10-20T10:00:00Z')]]) {
    assert.deepEqual(eventArchivePages(events, now), [{
      route: undefined, year: undefined, years: [], basePath: '/eventi/archivio/',
      currentPage: 1, totalItems: 0, events: [],
    }]);
  }
});

test('date non valide falliscono esplicitamente senza generare anni o archivi corrotti', () => {
  for (const date of ['', 'errata', '2026-02-31T10:00:00Z', '2026-10-19']) {
    const item = event('errato', date);
    assert.throws(() => isEventArchived(item, now), RangeError);
    assert.throws(() => groupEventsByYear([item]), RangeError);
    assert.throws(() => eventArchivePages([item], now), RangeError);
  }
  assert.throws(() => isEventArchived(event('valido', '2026-10-19T10:00:00Z'), NaN), RangeError);
});

test('le funzioni usano l’orologio corrente quando non viene fornita una data di riferimento', () => {
  const past = event('passato', '2000-01-01T10:00:00Z');
  const future = event('futuro', '2099-01-01T10:00:00Z');
  assert.equal(isEventArchived(past), true);
  assert.equal(eventDisplayStatus(past), 'completed');
  assert.deepEqual(groupEventsByDate([past, future]), { future: [future], past: [past] });
  assert.equal(getNextEvent([past, future]), future);
  assert.equal(eventArchivePages([past, future])[0].totalItems, 1);
});

test('la home non mostra eventi passati o solo annullati', () => {
  const events = [
    event('passato', '2026-10-01T10:00:00Z', 'completed'),
    event('annullato', '2026-10-21T10:00:00Z', 'cancelled'),
  ];

  assert.equal(getNextEvent(events, now), undefined);
});
