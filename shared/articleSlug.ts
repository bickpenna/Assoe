import { slugError } from './slug.ts';

export const ARTICLE_SLUG_MAX_LENGTH = 48;

/** Un messaggio per lo Studio, oppure undefined se la parte breve dell'URL è valida. */
export function articleSlugError(slug: string | undefined): string | undefined {
  return slugError(slug, { maxLength: ARTICLE_SLUG_MAX_LENGTH, disallowDatePrefix: true });
}

const urlDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Rome',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Compone l’URL pubblico dell’articolo con la data italiana di pubblicazione. */
export function articlePublicSlug(slug: string, publishedAt: string): string {
  const parts = Object.fromEntries(
    urlDateFormatter.formatToParts(new Date(publishedAt)).map(({ type, value }) => [type, value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}-${slug}`;
}
