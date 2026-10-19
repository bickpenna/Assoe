import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'assoe-volontariato',
  title: 'Asso è… Volontariato',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Contenuti')
          .items(
            S.documentTypeListItems().map((item) =>
              item.getId() === 'project'
                ? orderableDocumentListDeskItem({ type: 'project', title: 'Progetti', S, context })
                : item,
            ),
          ),
    }),
  ],
  document: {
    singletons: ['siteSettings'],
  },
  schema: {
    types: schemaTypes,
  },
});
