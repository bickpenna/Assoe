/** Accetta solo link HTTPS a Facebook, anche se il contenuto arriva da un altro CMS. */
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
