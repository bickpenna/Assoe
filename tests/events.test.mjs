import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getNextEvent, groupEventsByDate } from '../src/utils/events.ts';

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

test('un evento in corso resta tra i futuri, un annullato non compare in home', () => {
  const events = [
    event('annullato', '2026-10-21T10:00:00Z', 'cancelled'),
    event('programmato', '2026-10-22T10:00:00Z'),
    event('in-corso', '2026-10-18T10:00:00Z', 'ongoing'),
  ];

  assert.deepEqual(groupEventsByDate(events, now).future.map(({ slug }) => slug), [
    'in-corso', 'annullato', 'programmato',
  ]);
  assert.equal(getNextEvent(events, now)?.slug, 'in-corso');
  assert.equal(getNextEvent(events.slice(0, 2), now)?.slug, 'programmato');
});

test('la home non mostra eventi passati o solo annullati', () => {
  const events = [
    event('passato', '2026-10-01T10:00:00Z', 'completed'),
    event('annullato', '2026-10-21T10:00:00Z', 'cancelled'),
  ];

  assert.equal(getNextEvent(events, now), undefined);
});
