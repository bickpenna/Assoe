import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isArticleSlugUnique, validateUniqueSlug } from '../studio/schemaTypes/slugValidation.ts';

function context(document, candidates) {
  return {
    document,
    getClient: () => ({ fetch: async () => candidates }),
  };
}

test('permette agli articoli di riutilizzare lo slug con una data diversa', async () => {
  const articleContext = context(
    { _id: 'article-2', _type: 'article', publishedAt: '2026-10-22T12:00:00Z' },
    [{ publishedAt: '2026-10-21T12:00:00Z' }],
  );

  assert.equal(await isArticleSlugUnique('raccolta-fondi', articleContext), true);
  assert.equal(
    await validateUniqueSlug(
      { current: 'raccolta-fondi' },
      articleContext,
    ),
    true,
  );
});

test('blocca agli articoli lo stesso URL pubblico e blocca sempre i duplicati degli altri tipi', async () => {
  const articleContext = context(
    { _id: 'article-2', _type: 'article', publishedAt: '2026-10-22T12:00:00Z' },
    [{ publishedAt: '2026-10-22T12:00:00Z' }],
  );

  assert.equal(await isArticleSlugUnique('raccolta-fondi', articleContext), false);
  assert.match(
    await validateUniqueSlug(
      { current: 'raccolta-fondi' },
      articleContext,
    ),
    /stesso URL pubblico/,
  );
  assert.match(
    await validateUniqueSlug(
      { current: 'premio' },
      context({ _id: 'event-2', _type: 'event' }, [{}]),
    ),
    /stesso tipo/,
  );
});

test('non interroga il CMS finché mancano slug, ID, tipo o data valida dell’articolo', async () => {
  const getClient = () => { assert.fail('nessuna richiesta prevista'); };
  const validDocument = { _id: 'article-1', _type: 'article', publishedAt: '2026-10-22T12:00:00Z' };
  for (const document of [undefined, { _type: 'article' }, { _id: 'id' }]) {
    assert.equal(await isArticleSlugUnique('articolo', { document, getClient }), true);
    assert.equal(await validateUniqueSlug({ current: 'articolo' }, { document, getClient }), true);
  }
  for (const value of [undefined, null, {}, { current: 42 }, { current: '' }]) {
    assert.equal(await validateUniqueSlug(value, { document: validDocument, getClient }), true);
  }
  assert.equal(await isArticleSlugUnique('', { document: validDocument, getClient }), true);
  assert.equal(await isArticleSlugUnique('evento', { document: { _id: 'id', _type: 'event' }, getClient }), true);
  for (const publishedAt of [undefined, 42, 'non-una-data']) {
    assert.equal(await isArticleSlugUnique('articolo', { document: { ...validDocument, publishedAt }, getClient }), true);
    assert.equal(await validateUniqueSlug({ current: 'articolo' }, context({ ...validDocument, publishedAt }, [])), true);
  }
});

test('ignora candidati con date corrotte ed esclude sia bozza sia documento pubblicato', async () => {
  const ctx = context({ _id: 'drafts.article-1', _type: 'article', publishedAt: '2026-10-22T12:00:00Z' }, []);
  let request;
  ctx.getClient = ({ apiVersion }) => {
    assert.equal(apiVersion, '2026-03-01');
    return { fetch: async (_query, params) => {
      request = params;
      return [{}, { publishedAt: 'non-una-data' }, { publishedAt: '2026-10-21T12:00:00Z' }];
    } };
  };
  assert.equal(await isArticleSlugUnique('articolo', ctx), true);
  assert.equal(await validateUniqueSlug({ current: 'articolo' }, ctx), true);
  assert.deepEqual(request, { type: 'article', slug: 'articolo', excludedIds: ['article-1', 'drafts.article-1'] });
  assert.equal(await validateUniqueSlug({ current: 'evento' }, context({ _id: 'event-1', _type: 'event' }, [])), true);
});
