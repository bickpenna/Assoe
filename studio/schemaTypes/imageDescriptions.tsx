import { MAX_GALLERY_IMAGES } from '../../shared/imageSize';

const SQUOOSH_URL = 'https://squoosh.app/';

export function imageDescription(context?: string) {
  return (
    <span>
      {context && <>{context} </>}
      Prima di caricare, riduci l’immagine a circa 2000 px sul lato lungo e salvala in JPG o WebP.
      {' '}Puoi usare <a href={SQUOOSH_URL} target="_blank" rel="noopener noreferrer">Squoosh ↗</a>.
      {' '}Massimo 5 MB per immagine.
    </span>
  );
}

export function galleryDescription() {
  return imageDescription(`Per caricare più foto insieme usa “Seleziona più foto” nella galleria. Massimo ${MAX_GALLERY_IMAGES} foto in totale.`);
}
