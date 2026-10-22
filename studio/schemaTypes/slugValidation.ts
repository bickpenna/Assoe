import type { SlugValidationContext, ValidationContext } from 'sanity';
import { articlePublicSlug } from '../../shared/articleSlug.ts';

interface SlugCandidate {
  publishedAt?: unknown;
}

function currentSlug(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || !('current' in value)) return undefined;

  const current = value.current;
  return typeof current === 'string' ? current : undefined;
}

async function findSlugCandidates(
  slug: string,
  documentType: string,
  documentId: string,
  getClient: ValidationContext['getClient'],
): Promise<SlugCandidate[]> {
  const canonicalId = documentId.replace(/^drafts\./, '');

  return getClient({ apiVersion: '2026-03-01' }).fetch<SlugCandidate[]>(
    '*[_type == $type && slug.current == $slug && !(_id in $excludedIds)] { publishedAt }',
    {
      type: documentType,
      slug,
      excludedIds: [canonicalId, `drafts.${canonicalId}`],
    },
  );
}

function publicArticleSlugOrUndefined(slug: string, publishedAt: unknown): string | undefined {
  if (typeof publishedAt !== 'string') return undefined;

  try {
    return articlePublicSlug(slug, publishedAt);
  } catch {
    return undefined;
  }
}

/** Sanity usa questa funzione per il messaggio predefinito "Slug is already in use". */
export async function isArticleSlugUnique(
  slug: string,
  { document, getClient }: SlugValidationContext,
): Promise<boolean> {
  const documentId = document?._id;
  const documentType = document?._type;
  if (!slug || !documentId || documentType !== 'article') return true;

  const publicSlug = publicArticleSlugOrUndefined(slug, document?.['publishedAt']);
  if (!publicSlug) return true;

  const candidates = await findSlugCandidates(slug, documentType, documentId, getClient);
  return !candidates.some((candidate) => publicArticleSlugOrUndefined(slug, candidate.publishedAt) === publicSlug);
}

/** Impedisce che due documenti dello stesso tipo usino lo stesso slug. */
export async function validateUniqueSlug(
  value: unknown,
  { document, getClient }: ValidationContext,
): Promise<true | string> {
  const slug = currentSlug(value);
  const documentId = document?._id;
  const documentType = document?._type;
  if (!slug || !documentId || !documentType) return true;

  const candidates = await findSlugCandidates(slug, documentType, documentId, getClient);

  if (documentType !== 'article') {
    return candidates.length > 0
      ? 'Questo slug è già usato da un altro documento dello stesso tipo.'
      : true;
  }

  const publicSlug = publicArticleSlugOrUndefined(slug, document?.['publishedAt']);
  if (!publicSlug) return true;

  const duplicatePublicUrl = candidates.some(
    (candidate) => publicArticleSlugOrUndefined(slug, candidate.publishedAt) === publicSlug,
  );

  return duplicatePublicUrl
    ? 'Questo slug e questa data generano già lo stesso URL pubblico di un altro articolo.'
    : true;
}
