import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ARTICLE_SLUG_MAX_LENGTH, articleSlugError } from '../shared/articleSlug.ts';
import { CONTENT_SLUG_MAX_LENGTH, isValidSlug, slugError } from '../shared/slug.ts';
import { isValidSanityDateTime } from '../shared/sanityDateTime.ts';
import { articlePublicSlug } from '../src/utils/articleSlug.ts';

test('aggiunge automaticamente la data italiana alla parte breve di ogni articolo', () => {
  assert.equal(
    articlePublicSlug('benedizione-nuova-sede', '2026-10-22T12:00:00Z'),
    '2026-10-22-benedizione-nuova-sede',
  );
  assert.equal(
    articlePublicSlug('incontro', '2026-10-22T23:30:00Z'),
    '2026-10-23-incontro',
  );
  assert.equal(
    articlePublicSlug('limite-fuso', '2026-10-22T21:59:59Z'),
    '2026-10-22-limite-fuso',
  );
  assert.equal(
    articlePublicSlug('limite-fuso', '2026-10-22T22:00:00Z'),
    '2026-10-23-limite-fuso',
  );
});

test('rifiuta date invalide quando deve comporre l’URL', () => {
  assert.throws(() => articlePublicSlug('articolo', 'data-non-valida'), RangeError);
  assert.throws(() => articlePublicSlug('articolo', '2026-02-31T12:00:00Z'), RangeError);
});

test('accetta solo datetime Sanity reali in UTC', () => {
  assert.equal(isValidSanityDateTime('2026-02-28T23:59:59Z'), true);
  assert.equal(isValidSanityDateTime('2024-02-29T12:00:00Z'), true);
  assert.equal(isValidSanityDateTime('2026-02-31T12:00:00Z'), false);
  assert.equal(isValidSanityDateTime('2025-02-29T12:00:00Z'), false);
  assert.equal(isValidSanityDateTime('2026-02-28T12:00:00+01:00'), false);
  assert.equal(isValidSanityDateTime('2026-02-28'), false);
});

test('lo Studio guida la scrittura della parte breve e non permette date duplicate', () => {
  assert.equal(articleSlugError(undefined), undefined);
  assert.equal(articleSlugError(''), undefined);
  assert.equal(articleSlugError('nuova-sede'), undefined);
  assert.equal(articleSlugError('a'.repeat(ARTICLE_SLUG_MAX_LENGTH)), undefined);
  assert.match(articleSlugError('a'.repeat(ARTICLE_SLUG_MAX_LENGTH + 1)), /massimo/);
  assert.match(articleSlugError('2026-10-22-nuova-sede'), /Non inserire la data/);
  assert.match(articleSlugError('Nuova sede!'), /lettere minuscole/);
});

test('condivide formato e lunghezza degli slug tra contenuti', () => {
  assert.equal(isValidSlug('nuova-iniziativa'), true);
  assert.equal(isValidSlug(`a-${'b'.repeat(CONTENT_SLUG_MAX_LENGTH)}`), false);
  assert.equal(isValidSlug('Nuova iniziativa'), false);
  assert.equal(isValidSlug(''), false);
  assert.equal(isValidSlug(null), false);
  assert.match(slugError('a'.repeat(CONTENT_SLUG_MAX_LENGTH + 1)), /massimo/);
  assert.equal(slugError(undefined), undefined);
});
