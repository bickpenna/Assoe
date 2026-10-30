export const CONTENT_SLUG_MAX_LENGTH = 96;
export const EVENT_RESERVED_SLUGS = ['archivio'] as const;

interface SlugValidationOptions {
  maxLength?: number;
  disallowDatePrefix?: boolean;
  reserved?: readonly string[];
}

/** Restituisce un messaggio per lo slug oppure undefined quando il formato è valido. */
export function slugError(
  slug: string | undefined,
  { maxLength = CONTENT_SLUG_MAX_LENGTH, disallowDatePrefix = false, reserved = [] }: SlugValidationOptions = {},
): string | undefined {
  if (!slug) return undefined; // La presenza è controllata dalla validazione required.
  if (reserved.includes(slug)) return 'Questa parte dell’URL è riservata al sito. Scegli un altro slug.';
  if (slug.length > maxLength) {
    return `Usa al massimo ${maxLength} caratteri per questa parte dell’URL.`;
  }
  if (disallowDatePrefix && /^\d{4}-\d{2}-\d{2}(?:-|$)/.test(slug)) {
    return 'Non inserire la data: viene aggiunta automaticamente.';
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Usa solo lettere minuscole, numeri e trattini tra le parole.';
  }
  return undefined;
}

export function isValidSlug(
  value: unknown,
  options?: SlugValidationOptions,
): value is string {
  return typeof value === 'string' && value.length > 0 && slugError(value, options) === undefined;
}
