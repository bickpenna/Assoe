import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initiativeImageUrl } from '../src/content/providers/sanityImage.ts';

const image = {
  url: 'https://cdn.sanity.io/images/assoe123/production/photo.jpg',
  width: 1000,
  height: 800,
  crop: null,
};

test('mantiene l’immagine originale se non è ritagliata in Sanity', () => {
  assert.equal(initiativeImageUrl(image), image.url);
  assert.equal(initiativeImageUrl(null), undefined);
});

test('scarta URL immagine esterni al CDN Sanity', () => {
  assert.equal(initiativeImageUrl({ ...image, url: 'https://example.com/photo.jpg' }), undefined);
  assert.equal(initiativeImageUrl({ ...image, url: 'javascript:alert(1)' }), undefined);
});

test('rispetta il ritaglio scelto in Sanity', () => {
  const cropped = initiativeImageUrl({
    ...image,
    crop: { left: 0.1, top: 0.2, right: 0.1, bottom: 0.2 },
  });
  assert.equal(cropped, `${image.url}?rect=100%2C160%2C800%2C480`);
});

test('ignora ritagli non validi', () => {
  assert.equal(initiativeImageUrl({ ...image, crop: { left: 0.6, top: 0, right: 0.6, bottom: 0 } }), image.url);
  assert.equal(initiativeImageUrl({ ...image, crop: { left: 0, top: 0, right: 0, bottom: 0 } }), image.url);
});
