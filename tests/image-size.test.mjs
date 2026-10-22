import assert from 'node:assert/strict';
import { test } from 'node:test';
import { editorialImageSizeResult, MAX_EDITORIAL_IMAGE_BYTES } from '../shared/imageSize.ts';

test('accetta immagini fino a 5 MiB inclusi', () => {
  assert.equal(editorialImageSizeResult(0), true);
  assert.equal(editorialImageSizeResult(MAX_EDITORIAL_IMAGE_BYTES), true);
});

test('rifiuta immagini oltre il limite con un messaggio utile', () => {
  assert.match(editorialImageSizeResult(MAX_EDITORIAL_IMAGE_BYTES + 1), /supera 5 MB/);
});

test('segnala quando la dimensione dell’asset non è disponibile', () => {
  for (const value of [null, undefined, -1, NaN, '5 MB']) {
    assert.match(editorialImageSizeResult(value), /Impossibile verificare/);
  }
});
