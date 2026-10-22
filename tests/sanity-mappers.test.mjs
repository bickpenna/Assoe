import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  renderRichText,
  safeSanityAssetUrls,
  toArticleSummary,
  toAssociationInfo,
  toEventSummary,
  toRelatedInitiatives,
} from '../src/content/providers/sanityMappers.ts';

const initiative = {
  _id: 'initiative-1',
  name: 'Iniziativa',
  slug: 'iniziativa',
  image: { url: 'https://cdn.sanity.io/image.jpg', width: 800, height: 600, crop: null },
  active: true,
};

test('mappa articoli ed eventi mantenendo solo URL immagine sicuri', () => {
  assert.deepEqual(toArticleSummary({
    _id: 'article-1',
    title: 'Articolo',
    slug: 'articolo',
    summary: null,
    publishedAt: '2026-10-20T12:00:00Z',
    imageUrl: 'https://evil.example/image.jpg',
  }), {
    id: 'article-1',
    title: 'Articolo',
    slug: '2026-10-20-articolo',
    summary: undefined,
    publishedAt: '2026-10-20T12:00:00Z',
    imageUrl: undefined,
  });

  assert.deepEqual(toEventSummary({
    _id: 'event-1',
    title: 'Evento',
    slug: 'evento',
    date: '2026-10-20T12:00:00Z',
    place: null,
    status: 'scheduled',
    imageUrl: 'https://cdn.sanity.io/event.jpg',
  }), {
    id: 'event-1',
    title: 'Evento',
    slug: 'evento',
    date: '2026-10-20T12:00:00Z',
    place: undefined,
    status: 'scheduled',
    imageUrl: 'https://cdn.sanity.io/event.jpg',
  });
});

test('scarta iniziative correlate inattive, nulle o corrotte', () => {
  assert.deepEqual(toRelatedInitiatives([
    initiative,
    { ...initiative, _id: 'inactive', active: false },
    { ...initiative, _id: 'invalid', active: true, slug: 'Slug non valido' },
    null,
  ]), [{
    id: 'initiative-1',
    name: 'Iniziativa',
    slug: 'iniziativa',
    imageUrl: 'https://cdn.sanity.io/image.jpg',
  }]);
  assert.deepEqual(toRelatedInitiatives(null), []);
});

test('normalizza galleria, rich text e impostazioni associative incomplete', () => {
  assert.deepEqual(safeSanityAssetUrls([
    'https://cdn.sanity.io/one.jpg',
    'https://evil.example/two.jpg',
    null,
  ]), ['https://cdn.sanity.io/one.jpg']);
  assert.deepEqual(safeSanityAssetUrls(null), []);
  assert.equal(renderRichText(null), undefined);
  assert.equal(renderRichText([]), undefined);
  assert.equal(renderRichText([{ _type: 'block', children: [] }]), '<p></p>');

  assert.deepEqual(toAssociationInfo({
    associationName: 'Asso è…',
    logoUrl: 'https://evil.example/logo.png',
    bankDetails: { iban: 'IT60 X054 2811 1010 0000 0123 456', accountHolder: ' Mario Rossi ', bankName: ' Banca ' },
    contacts: { email: 'bad email', phone: '+39 333 1234567', address: null, postalCode: null, city: null, province: null },
    socialLinks: [{ platform: 'Facebook', url: 'javascript:alert(1)' }, null],
  }), {
    name: 'Asso è…',
    logoUrl: undefined,
    aboutText: undefined,
    aboutImageUrl: undefined,
    taxCode: undefined,
    bankDetails: {
      iban: 'IT60X0542811101000000123456',
      accountHolder: 'Mario Rossi',
      bankName: 'Banca',
    },
    registryInfo: undefined,
    copyright: undefined,
    contacts: {
      email: undefined,
      phone: '+39 333 1234567',
      address: undefined,
      postalCode: undefined,
      city: undefined,
      province: undefined,
    },
    socialLinks: [],
    documents: {
      statuteUrl: undefined,
      regulationUrl: undefined,
      privacyPolicyUrl: undefined,
      cookiePolicyUrl: undefined,
    },
  });

  assert.deepEqual(toAssociationInfo({
    associationName: 'Asso è…',
    logoUrl: 'https://cdn.sanity.io/logo.png',
    aboutText: ' Descrizione ',
    aboutImageUrl: 'https://cdn.sanity.io/about.png',
    taxCode: '123',
    bankDetails: null,
    registryInfo: 'Registro',
    copyright: '© Asso è…',
    contacts: { email: 'info@example.org', phone: '+39 333 1234567', address: 'Via Roma', postalCode: '80100', city: 'Napoli', province: 'NA' },
    socialLinks: [{ platform: 'Facebook', url: 'https://facebook.com/assoe' }],
    statuteUrl: 'https://cdn.sanity.io/statute.pdf',
    regulationUrl: 'https://cdn.sanity.io/regulation.pdf',
    privacyPolicyUrl: 'https://cdn.sanity.io/privacy.pdf',
    cookiePolicyUrl: 'https://cdn.sanity.io/cookie.pdf',
  }), {
    name: 'Asso è…',
    logoUrl: 'https://cdn.sanity.io/logo.png',
    aboutText: 'Descrizione',
    aboutImageUrl: 'https://cdn.sanity.io/about.png',
    taxCode: '123',
    bankDetails: undefined,
    registryInfo: 'Registro',
    copyright: '© Asso è…',
    contacts: { email: 'info@example.org', phone: '+39 333 1234567', address: 'Via Roma', postalCode: '80100', city: 'Napoli', province: 'NA' },
    socialLinks: [{ name: 'Facebook', url: 'https://facebook.com/assoe' }],
    documents: {
      statuteUrl: 'https://cdn.sanity.io/statute.pdf',
      regulationUrl: 'https://cdn.sanity.io/regulation.pdf',
      privacyPolicyUrl: 'https://cdn.sanity.io/privacy.pdf',
      cookiePolicyUrl: 'https://cdn.sanity.io/cookie.pdf',
    },
  });
});
