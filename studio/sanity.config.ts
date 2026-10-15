import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'assoe-volontariato',
  title: 'Asso è… Volontariato',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [structureTool()],
  document: {
    singletons: ['siteSettings'],
  },
  schema: {
    types: schemaTypes,
  },
});
