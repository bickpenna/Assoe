import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { cachePromise } from '../src/utils/cachePromise.ts';

test('la cache condivide richieste concorrenti e conserva il risultato', async () => {
  const factory = mock.fn(async () => ({ value: 42 }));
  const read = cachePromise(factory);
  const first = read();
  assert.equal(read(), first);
  assert.deepEqual(await first, { value: 42 });
  assert.equal(read(), first);
  assert.equal(factory.mock.callCount(), 1);
});

test('la cache propaga gli errori e permette di riprovare', async () => {
  const error = new Error('Temporaneamente non disponibile');
  let calls = 0;
  const read = cachePromise(async () => {
    if (++calls === 1) throw error;
    return 'recuperato';
  });
  await assert.rejects(read(), (received) => received === error);
  assert.equal(await read(), 'recuperato');
  assert.equal(await read(), 'recuperato');
  assert.equal(calls, 2);
});

test('senza cache ogni lettura riceve dati aggiornati', async () => {
  let calls = 0;
  const read = cachePromise(async () => ++calls, false);
  assert.deepEqual(await Promise.all([read(), read(), read()]), [1, 2, 3]);
});
