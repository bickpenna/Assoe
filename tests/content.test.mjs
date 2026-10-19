import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requireBySlug, staticPathsFromSlugs } from '../src/utils/content.ts';
import { httpsUrlOrUndefined } from '../shared/url.ts';

test('genera i percorsi statici dai soli slug', () => {
  assert.deepEqual(
    staticPathsFromSlugs([{ slug: 'uno' }, { slug: 'due' }]),
    [
      { params: { slug: 'uno' } },
      { params: { slug: 'due' } },
    ],
  );
});

test('requireBySlug restituisce il contenuto o fallisce con un errore esplicito', async () => {
  assert.equal(
    await requireBySlug('uno', async (slug) => ({ slug }), 'Articolo').then((item) => item.slug),
    'uno',
  );

  await assert.rejects(
    requireBySlug('mancante', async () => null, 'Articolo'),
    /Articolo non trovato durante la build: mancante/,
  );
});

test('i link social accettano solo HTTPS assoluti', () => {
  assert.equal(httpsUrlOrUndefined('https://www.example.org/profilo'), 'https://www.example.org/profilo');
  assert.equal(httpsUrlOrUndefined('http://www.example.org/profilo'), undefined);
  assert.equal(httpsUrlOrUndefined('javascript:alert(1)'), undefined);
});
