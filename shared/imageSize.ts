export const MAX_EDITORIAL_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 6;

type GalleryFile = { name: string; size: number; type: string };

const allowedGalleryTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Controlla la selezione prima di inviare qualsiasi file a Sanity. */
export function gallerySelectionError(existingCount: number, files: readonly GalleryFile[]): string | undefined {
  if (files.length === 0) return 'Seleziona almeno una foto.';
  if (existingCount + files.length > MAX_GALLERY_IMAGES) {
    return `La galleria può contenere al massimo ${MAX_GALLERY_IMAGES} foto in totale. Elimina quelle in eccesso e riprova.`;
  }

  for (const file of files) {
    if (!allowedGalleryTypes.has(file.type)) {
      return `${file.name}: usa una foto JPG, PNG o WebP.`;
    }
    if (file.size > MAX_EDITORIAL_IMAGE_BYTES) {
      return `${file.name}: supera 5 MB. Riducila con Squoosh prima di caricarla.`;
    }
  }
}

/** Messaggio per lo Studio, o true se la dimensione dell'asset è accettabile. */
export function editorialImageSizeResult(size: unknown): true | string {
  if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) {
    return 'Impossibile verificare la dimensione dell’immagine. Riprova a selezionarla.';
  }
  return size <= MAX_EDITORIAL_IMAGE_BYTES
    ? true
    : 'L’immagine supera 5 MB. Riducila sul tuo dispositivo prima di ricaricarla.';
}
