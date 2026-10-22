import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ARTICLE_SLUG_MAX_LENGTH, articleSlugError } from '../shared/articleSlug.ts';
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
});

test('rifiuta date invalide quando deve comporre l’URL', () => {
  assert.throws(() => articlePublicSlug('articolo', 'data-non-valida'), RangeError);
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
