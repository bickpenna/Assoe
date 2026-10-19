/**
 * Normalizza un link a Facebook solo se punta davvero a Facebook e usa HTTPS.
 * Il provider e lo Studio usano questa stessa policy per evitare divergenze.
 */
export function facebookPostUrlOrUndefined(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password) return undefined;
    if (hostname !== 'facebook.com' && !hostname.endsWith('.facebook.com') && hostname !== 'fb.watch') {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

/** Accetta solo URL HTTPS assoluti provenienti dai contenuti pubblici. */
export function httpsUrlOrUndefined(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
