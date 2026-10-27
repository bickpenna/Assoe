import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isSanityArticle,
  isSanityArticleDetail,
  isSanityAssociation,
  isSanityEvent,
  isSanityEventDetail,
  isSanityHomeNotice,
  isSanityPerson,
  isSanityInitiative,
  isSanityInitiativeDetail,
  isSanityRelatedInitiative,
  toPortableTextBlocks,
} from '../src/content/providers/sanityValidation.ts';

const image = { url: 'https://cdn.sanity.io/image.jpg', width: 800, height: 600, crop: null };
const initiative = { _id: 'initiative-1', name: 'Iniziativa', slug: 'iniziativa', image };
const article = {
  _id: 'article-1',
  title: 'Articolo',
  slug: 'articolo',
  summary: null,
  publishedAt: '2026-10-20T12:00:00Z',
  imageUrl: null,
};
const event = {
  _id: 'event-1',
  title: 'Evento',
  slug: 'evento',
  date: '2026-10-20T12:00:00Z',
  place: null,
  status: 'scheduled',
  imageUrl: null,
};

test('valida i record Sanity principali e rifiuta dati incompleti', () => {
  assert.equal(isSanityInitiative(initiative), true);
  assert.equal(isSanityInitiative({ ...initiative, image: { ...image, width: 0.5 } }), false);
  assert.equal(isSanityInitiative({ ...initiative, slug: 'Iniziativa' }), false);
  assert.equal(isSanityInitiative({ ...initiative, slug: 'iniziativa non valida' }), false);
  assert.equal(isSanityInitiative({ ...initiative, slug: 'a'.repeat(97) }), false);
  assert.equal(isSanityInitiativeDetail({ ...initiative, description: [{ _type: 'block' }] }), true);
  assert.equal(isSanityInitiativeDetail({ ...initiative, description: [{ _type: '' }] }), false);
  assert.equal(isSanityRelatedInitiative({ ...initiative, active: true }), true);
  assert.equal(isSanityRelatedInitiative({ ...initiative, active: 'yes' }), false);
});

test('valida articoli ed eventi con date e stati ammessi', () => {
  assert.equal(isSanityArticle(article), true);
  assert.equal(isSanityArticle({ ...article, slug: '2026-10-20-articolo' }), false);
  assert.equal(isSanityArticle({ ...article, slug: 'Articolo' }), false);
  assert.equal(isSanityArticle({ ...article, publishedAt: 'non-una-data' }), false);
  assert.equal(isSanityArticle({ ...article, publishedAt: '2026-02-31T12:00:00Z' }), false);
  assert.equal(isSanityEvent(event), true);
  assert.equal(isSanityEvent({ ...event, slug: 'Evento' }), false);
  assert.equal(isSanityEvent({ ...event, slug: 'evento non valido' }), false);
  assert.equal(isSanityEvent({ ...event, slug: 'a'.repeat(97) }), false);
  assert.equal(isSanityEvent({ ...event, status: 'unknown' }), false);
  assert.equal(isSanityEvent({ ...event, date: 'non-una-data' }), false);
  assert.equal(isSanityEvent({ ...event, date: '2026-02-31T12:00:00Z' }), false);

  const detail = {
    ...article,
    body: [{ _type: 'block' }],
    galleryImageUrls: [null, 'https://cdn.sanity.io/gallery.jpg'],
    facebookPostUrl: null,
    initiatives: [{ ...initiative, active: true }],
    event,
  };
  assert.equal(isSanityArticleDetail(detail), true);
  assert.equal(isSanityArticleDetail({ ...detail, galleryImageUrls: [42] }), false);
  assert.equal(isSanityEventDetail({
    ...event,
    description: null,
    galleryImageUrls: [],
    facebookPostUrl: null,
    initiatives: [null, { ...initiative, active: true }],
  }), true);
});

test('valida persone, impostazioni associative e rich text', () => {
  assert.equal(isSanityPerson({ _id: 'person-1', firstName: 'Mario', lastName: 'Rossi', role: 'president', photoUrl: null }), true);
  assert.equal(isSanityPerson({ _id: 'person-1', firstName: 'Mario', lastName: 'Rossi', role: 'unknown', photoUrl: null }), false);

  assert.equal(isSanityAssociation({
    associationName: 'Asso è…',
    contacts: { email: null, phone: null, address: null, postalCode: null, city: null, province: null },
    socialLinks: [{ platform: 'Facebook', url: 'https://facebook.com/assoe' }],
  }), true);
  assert.equal(isSanityAssociation({ associationName: 'Asso è…', socialLinks: [{ platform: 'Facebook', url: 42 }] }), false);
  assert.equal(isSanityAssociation({ associationName: 'Asso è…', bankDetails: { iban: 42 } }), false);
  assert.equal(isSanityAssociation({ associationName: 'Asso è…', contacts: { email: 42 } }), false);

  assert.deepEqual(toPortableTextBlocks([{ _type: 'block' }]), [{ _type: 'block' }]);
  assert.equal(toPortableTextBlocks(null), null);
  assert.equal(toPortableTextBlocks([{ _type: '' }]), null);
});

test('accetta solo avvisi con chiave, titolo e testo non vuoti', () => {
  const notice = { _key: 'notice-1', title: 'Orari aggiornati', text: 'La sede apre alle 15.' };
  assert.equal(isSanityHomeNotice(notice), true);
  assert.equal(isSanityHomeNotice({ ...notice, text: 'a'.repeat(500) }), true);
  assert.equal(isSanityHomeNotice({ ...notice, text: 'a'.repeat(501) }), false);
  assert.equal(isSanityHomeNotice({ ...notice, documentUrl: 42 }), false);
  assert.equal(isSanityHomeNotice({ ...notice, linkUrl: 42 }), false);
  assert.equal(isSanityHomeNotice({ ...notice, linkLabel: 'Bando completo' }), true);
  assert.equal(isSanityHomeNotice({ ...notice, linkLabel: null }), true);
  assert.equal(isSanityHomeNotice({ ...notice, linkLabel: 'a'.repeat(80) }), true);
  assert.equal(isSanityHomeNotice({ ...notice, linkLabel: 'a'.repeat(81) }), true);
  assert.equal(isSanityHomeNotice({ ...notice, linkLabel: 42 }), true);
  assert.equal(isSanityHomeNotice({ ...notice, expiresOn: '2026-10-27' }), true);
  assert.equal(isSanityHomeNotice({ ...notice, expiresOn: null }), true);
  assert.equal(isSanityHomeNotice({ ...notice, expiresOn: '2026-02-30' }), false);
  assert.equal(isSanityHomeNotice({ ...notice, expiresOn: 42 }), false);
  assert.equal(isSanityHomeNotice({ ...notice, _key: '' }), false);
  assert.equal(isSanityHomeNotice({ ...notice, title: '   ' }), false);
  assert.equal(isSanityHomeNotice({ ...notice, text: null }), false);
  assert.equal(isSanityHomeNotice(null), false);
});
