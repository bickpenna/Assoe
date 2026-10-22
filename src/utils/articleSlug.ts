const urlDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Rome',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Compone la data di pubblicazione e la parte breve inserita nello Studio. */
export function articlePublicSlug(slug: string, publishedAt: string): string {
  const parts = Object.fromEntries(
    urlDateFormatter.formatToParts(new Date(publishedAt)).map(({ type, value }) => [type, value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}-${slug}`;
}
