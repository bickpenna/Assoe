import { createDemoRepository } from './providers/demo';
import { createSanityRepository } from './providers/sanity';
import type { ContentRepository } from './types';

const contentSource = import.meta.env.CONTENT_SOURCE || 'sanity';
const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;

if (contentSource !== 'demo' && contentSource !== 'sanity') {
  throw new Error(`CONTENT_SOURCE non valido: ${contentSource}`);
}

if (contentSource === 'sanity' && !projectId) {
  throw new Error('PUBLIC_SANITY_PROJECT_ID non configurato nel file .env');
}

/** Punto unico in cui scegliere e configurare il fornitore dei contenuti. */
export const contentRepository: ContentRepository = contentSource === 'demo'
  ? createDemoRepository()
  : createSanityRepository({
      projectId,
      dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
    });

export const isDemoContent = contentSource === 'demo';
