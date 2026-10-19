import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectImageUrl } from '../src/content/providers/sanityImage.ts';

const image = {
  url: 'https://cdn.sanity.io/images/project/production/photo.jpg',
  width: 1000,
  height: 800,
  crop: null,
};

test('mantiene l’immagine originale se non è ritagliata in Sanity', () => {
  assert.equal(projectImageUrl(image), image.url);
  assert.equal(projectImageUrl(null), undefined);
});

test('rispetta il ritaglio scelto in Sanity', () => {
  const cropped = projectImageUrl({
    ...image,
    crop: { left: 0.1, top: 0.2, right: 0.1, bottom: 0.2 },
  });
  assert.equal(cropped, `${image.url}?rect=100%2C160%2C800%2C480`);
});

test('ignora ritagli non validi', () => {
  assert.equal(projectImageUrl({ ...image, crop: { left: 0.6, top: 0, right: 0.6, bottom: 0 } }), image.url);
  assert.equal(projectImageUrl({ ...image, crop: { left: 0, top: 0, right: 0, bottom: 0 } }), image.url);
});
