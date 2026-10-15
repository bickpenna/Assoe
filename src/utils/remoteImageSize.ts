import { inferRemoteSize } from 'astro:assets';

const sizes = new Map<string, ReturnType<typeof inferRemoteSize>>();

/** Riusa la lettura delle dimensioni quando la stessa immagine appare in più pagine. */
export function getRemoteImageSize(url: string): ReturnType<typeof inferRemoteSize> {
  let size = sizes.get(url);
  if (!size) {
    size = inferRemoteSize(url);
    sizes.set(url, size);
  }
  return size;
}
