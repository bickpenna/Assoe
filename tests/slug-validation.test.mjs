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
