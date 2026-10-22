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
    const url = new URL(value.trim());
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Accetta solo asset HTTPS pubblicati dal CDN Sanity configurato. */
export function sanityAssetUrlOrUndefined(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:'
      && url.hostname.toLowerCase() === 'cdn.sanity.io'
      && !url.username
      && !url.password
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

/** Normalizza un indirizzo email prima di usarlo in un link mailto. */
export function emailAddressOrUndefined(value: string | null | undefined): string | undefined {
  const email = value?.trim();
  if (!email || email.length > 254 || /[\s"<>()[\],;:]/.test(email)) return undefined;

  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex !== email.lastIndexOf('@') || atIndex === email.length - 1) return undefined;

  return email;
}

/** Mantiene solo numeri di telefono con un formato adatto a un link tel. */
export function phoneNumberOrUndefined(value: string | null | undefined): string | undefined {
  const phone = value?.trim();
  if (!phone || !/^[+0-9().\s-]+$/.test(phone)) return undefined;

  const normalized = phone.replace(/[^+\d]/g, '');
  return /^\+?\d{6,15}$/.test(normalized) ? phone : undefined;
}

export function telephoneHrefOrUndefined(value: string | null | undefined): string | undefined {
  const phone = phoneNumberOrUndefined(value);
  if (!phone) return undefined;

  return `tel:${phone.replace(/[^+\d]/g, '')}`;
}
