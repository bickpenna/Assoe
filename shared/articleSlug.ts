export const ARTICLE_SLUG_MAX_LENGTH = 48;

/** Un messaggio per lo Studio, oppure undefined se la parte breve dell'URL è valida. */
export function articleSlugError(slug: string | undefined): string | undefined {
  if (!slug) return undefined; // La presenza è controllata dalla validazione required.
  if (slug.length > ARTICLE_SLUG_MAX_LENGTH) {
    return `Usa al massimo ${ARTICLE_SLUG_MAX_LENGTH} caratteri per questa parte dell’URL.`;
  }
  if (/^\d{4}-\d{2}-\d{2}(?:-|$)/.test(slug)) {
    return 'Non inserire la data: viene aggiunta automaticamente.';
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Usa solo lettere minuscole, numeri e trattini tra le parole.';
  }
  return undefined;
}
