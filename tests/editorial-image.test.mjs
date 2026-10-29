import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { validateEditorialImageSize } from '../studio/schemaTypes/editorialImage.ts';
import { MAX_EDITORIAL_IMAGE_BYTES } from '../shared/imageSize.ts';

function context(value) {
  const fetch = mock.fn(async () => value);
  const getClient = mock.fn(() => ({ fetch }));
  return { fetch, getClient };
}

test('senza riferimento immagine non interroga Sanity', async () => {
  const ctx = context();
  for (const image of [undefined, {}, { asset: {} }]) {
    assert.equal(await validateEditorialImageSize(image, ctx), true);
  }
  assert.equal(ctx.getClient.mock.callCount(), 0);
});

test('legge la dimensione dell’asset corretto e applica il limite inclusivo', async () => {
  const ctx = context(MAX_EDITORIAL_IMAGE_BYTES);
  assert.equal(await validateEditorialImageSize({ asset: { _ref: 'image-1' } }, ctx), true);
  assert.deepEqual(ctx.getClient.mock.calls[0].arguments, [{ apiVersion: '2026-03-01' }]);
  assert.deepEqual(ctx.fetch.mock.calls[0].arguments, ['*[_id == $assetId][0].size', { assetId: 'image-1' }]);
  for (const size of [MAX_EDITORIAL_IMAGE_BYTES + 1, null]) {
    assert.equal(typeof await validateEditorialImageSize({ asset: { _ref: 'image-1' } }, context(size)), 'string');
  }
});

test('propaga gli errori di lettura evitando una validazione positiva non verificata', async () => {
  const error = new Error('Sanity non disponibile');
  await assert.rejects(validateEditorialImageSize({ asset: { _ref: 'image-1' } }, {
    getClient: () => ({ fetch: async () => { throw error; } }),
  }), (received) => received === error);
});
