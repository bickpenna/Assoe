import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MAX_EDITORIAL_IMAGE_BYTES, gallerySelectionError, MAX_GALLERY_IMAGES } from '../shared/imageSize.ts';

const photo = (name, size = 1000, type = 'image/jpeg') => ({ name, size, type });

test('permette di scegliere più foto fino a sei in totale', () => {
  assert.equal(MAX_GALLERY_IMAGES, 6);
  assert.equal(gallerySelectionError(0, Array.from({ length: 6 }, (_, i) => photo(`${i}.jpg`))), undefined);
  assert.equal(gallerySelectionError(2, [photo('a.jpg'), photo('b.jpg'), photo('c.jpg'), photo('d.jpg')]), undefined);
});

test('blocca selezioni vuote o che superano i posti disponibili', () => {
  assert.match(gallerySelectionError(0, []), /almeno una foto/);
  assert.match(gallerySelectionError(6, [photo('a.jpg')]), /massimo 6/);
  assert.match(gallerySelectionError(2, Array.from({ length: 5 }, (_, i) => photo(`${i}.jpg`))), /massimo 6/);
});

test('blocca formati non previsti e file oltre 5 MB prima dell’upload', () => {
  assert.equal(gallerySelectionError(0, [photo('a.webp', MAX_EDITORIAL_IMAGE_BYTES, 'image/webp')]), undefined);
  assert.equal(gallerySelectionError(0, [photo('a.png', 1000, 'image/png')]), undefined);
  assert.match(gallerySelectionError(0, [photo('a.heic', 1000, 'image/heic')]), /JPG, PNG o WebP/);
  assert.match(gallerySelectionError(0, [photo('a.jpg', MAX_EDITORIAL_IMAGE_BYTES + 1)]), /supera 5 MB/);
});
