import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerHooks } from 'node:module';
import { inferRemoteSize } from './helpers/astro-assets.mjs';

// Solo il servizio Astro viene sostituito: la cache sotto test è quella di produzione.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'astro:assets') {
      return { url: new URL('./helpers/astro-assets.mjs', import.meta.url).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const { getRemoteImageSize } = await import('../src/utils/remoteImageSize.ts');
hooks.deregister();

test('condivide richieste concorrenti per la stessa immagine e conserva le dimensioni', async () => {
  const size = { width: 1200, height: 800 };
  inferRemoteSize.mock.mockImplementation(async () => size);
  const url = 'https://cdn.sanity.io/cache.jpg';
  const first = getRemoteImageSize(url);
  assert.equal(getRemoteImageSize(url), first);
  assert.equal(await first, size);
  assert.equal(await getRemoteImageSize(url), size);
  assert.equal(inferRemoteSize.mock.callCount(), 1);
  assert.deepEqual(inferRemoteSize.mock.calls[0].arguments, [url]);
});

test('immagini diverse non condividono le dimensioni', async () => {
  inferRemoteSize.mock.mockImplementation(async (url) => ({ width: url.endsWith('a.jpg') ? 100 : 200, height: 80 }));
  const [first, second] = await Promise.all([
    getRemoteImageSize('https://cdn.sanity.io/a.jpg'),
    getRemoteImageSize('https://cdn.sanity.io/b.jpg'),
  ]);
  assert.equal(first.width, 100);
  assert.equal(second.width, 200);
});

test('rimuove gli errori dalla cache e riprova la stessa immagine', async () => {
  const error = new Error('Immagine non disponibile');
  inferRemoteSize.mock.mockImplementationOnce(async () => { throw error; });
  const url = 'https://cdn.sanity.io/retry.jpg';
  await assert.rejects(getRemoteImageSize(url), (received) => received === error);
  inferRemoteSize.mock.mockImplementation(async () => ({ width: 640, height: 480 }));
  assert.deepEqual(await getRemoteImageSize(url), { width: 640, height: 480 });
});
