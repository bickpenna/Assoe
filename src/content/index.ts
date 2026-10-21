import { createSanityRepository } from './providers/sanity';
import type { ContentRepository } from './types';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;

if (!projectId) {
  throw new Error('PUBLIC_SANITY_PROJECT_ID non configurato nel file .env');
}

/** Punto unico in cui configurare il fornitore dei contenuti. */
export const contentRepository: ContentRepository = createSanityRepository({
  projectId,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
});
