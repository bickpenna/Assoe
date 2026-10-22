import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertUniqueSlugs, requireBySlug, staticPathsFromSlugs } from '../src/utils/content.ts';
import {
  emailAddressOrUndefined,
  httpsUrlOrUndefined,
  phoneNumberOrUndefined,
  sanityAssetUrlOrUndefined,
  telephoneHrefOrUndefined,
} from '../shared/url.ts';

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

test('rifiuta slug duplicati durante la build', () => {
  assertUniqueSlugs([{ slug: 'uno' }, { slug: 'due' }], 'Le iniziative');
  assert.throws(
    () => assertUniqueSlugs([{ slug: 'uno' }, { slug: 'uno' }, { slug: 'due' }, { slug: 'due' }], 'Gli eventi'),
    /Gli eventi hanno slug duplicati: uno, due/,
  );
});

test('i link social accettano solo HTTPS assoluti', () => {
  assert.equal(httpsUrlOrUndefined('https://www.example.org/profilo'), 'https://www.example.org/profilo');
  assert.equal(httpsUrlOrUndefined('http://www.example.org/profilo'), undefined);
  assert.equal(httpsUrlOrUndefined('javascript:alert(1)'), undefined);
  assert.equal(httpsUrlOrUndefined('https://user:pass@example.org/profilo'), undefined);
  assert.equal(httpsUrlOrUndefined('not a URL'), undefined);
});

test('gli asset Sanity accettano solo il CDN HTTPS previsto', () => {
  assert.equal(
    sanityAssetUrlOrUndefined('https://cdn.sanity.io/files/project/production/document.pdf'),
    'https://cdn.sanity.io/files/project/production/document.pdf',
  );
  assert.equal(sanityAssetUrlOrUndefined('https://example.org/document.pdf'), undefined);
  assert.equal(sanityAssetUrlOrUndefined('http://cdn.sanity.io/document.pdf'), undefined);
  assert.equal(sanityAssetUrlOrUndefined('javascript:alert(1)'), undefined);
  assert.equal(sanityAssetUrlOrUndefined('https://user:pass@cdn.sanity.io/document.pdf'), undefined);
});

test('normalizza contatti destinati a mailto e tel', () => {
  assert.equal(emailAddressOrUndefined('  info@example.org '), 'info@example.org');
  assert.equal(emailAddressOrUndefined('javascript:alert(1)'), undefined);
  assert.equal(emailAddressOrUndefined('info@example.org\n" onmouseover="alert(1)'), undefined);
  assert.equal(phoneNumberOrUndefined('+39 081 123 4567'), '+39 081 123 4567');
  assert.equal(phoneNumberOrUndefined('javascript:alert(1)'), undefined);
  assert.equal(telephoneHrefOrUndefined('+39 081 123 4567'), 'tel:+390811234567');
  assert.equal(telephoneHrefOrUndefined('123'), undefined);
});
