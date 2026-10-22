import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isSanityArticle,
  isSanityArticleDetail,
  isSanityAssociation,
  isSanityEvent,
  isSanityEventDetail,
  isSanityPerson,
  isSanityProject,
  isSanityProjectDetail,
  isSanityRelatedProject,
  toPortableTextBlocks,
} from '../src/content/providers/sanityValidation.ts';

const image = { url: 'https://cdn.sanity.io/image.jpg', width: 800, height: 600, crop: null };
const project = { _id: 'project-1', name: 'Progetto', slug: 'progetto', image };
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
  assert.equal(isSanityProject(project), true);
  assert.equal(isSanityProject({ ...project, image: { ...image, width: 0.5 } }), false);
  assert.equal(isSanityProject({ ...project, slug: 'Progetto' }), false);
  assert.equal(isSanityProject({ ...project, slug: 'progetto non valido' }), false);
  assert.equal(isSanityProject({ ...project, slug: 'a'.repeat(97) }), false);
  assert.equal(isSanityProjectDetail({ ...project, description: [{ _type: 'block' }] }), true);
  assert.equal(isSanityProjectDetail({ ...project, description: [{ _type: '' }] }), false);
  assert.equal(isSanityRelatedProject({ ...project, active: true }), true);
  assert.equal(isSanityRelatedProject({ ...project, active: 'yes' }), false);
});

test('valida articoli ed eventi con date e stati ammessi', () => {
  assert.equal(isSanityArticle(article), true);
  assert.equal(isSanityArticle({ ...article, slug: '2026-10-20-articolo' }), false);
  assert.equal(isSanityArticle({ ...article, slug: 'Articolo' }), false);
  assert.equal(isSanityArticle({ ...article, publishedAt: 'non-una-data' }), false);
  assert.equal(isSanityEvent(event), true);
  assert.equal(isSanityEvent({ ...event, slug: 'Evento' }), false);
  assert.equal(isSanityEvent({ ...event, slug: 'evento non valido' }), false);
  assert.equal(isSanityEvent({ ...event, slug: 'a'.repeat(97) }), false);
  assert.equal(isSanityEvent({ ...event, status: 'unknown' }), false);
  assert.equal(isSanityEvent({ ...event, date: 'non-una-data' }), false);

  const detail = {
    ...article,
    body: [{ _type: 'block' }],
    galleryImageUrls: [null, 'https://cdn.sanity.io/gallery.jpg'],
    facebookPostUrl: null,
    projects: [{ ...project, active: true }],
    event,
  };
  assert.equal(isSanityArticleDetail(detail), true);
  assert.equal(isSanityArticleDetail({ ...detail, galleryImageUrls: [42] }), false);
  assert.equal(isSanityEventDetail({
    ...event,
    description: null,
    galleryImageUrls: [],
    facebookPostUrl: null,
    projects: [null, { ...project, active: true }],
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
