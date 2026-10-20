import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { schemaTypes } from './schemaTypes';
import { PERSON_ROLE_GROUPS } from '../shared/personRoles';

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
          .items([
            S.listItem().singleton('siteSettings'),
            S.divider(),
            ...S.documentTypeListItems().map((item) =>
              item.getId() === 'project'
                ? orderableDocumentListDeskItem({ type: 'project', title: 'Iniziative', S, context })
                : item.getId() === 'person'
                  ? S.listItem()
                    .id('people')
                    .title('Persone')
                    .child(
                      S.list()
                        .title('Persone')
                        .items([
                          S.documentTypeListItem('person').title('Tutte le persone'),
                          S.divider(),
                          ...PERSON_ROLE_GROUPS.map(({ role, groupTitle }) =>
                            orderableDocumentListDeskItem({
                              id: `people-${role}`,
                              type: 'person',
                              title: groupTitle,
                              filter: 'role == $role',
                              params: { role },
                              createIntent: false,
                              S,
                              context,
                            }),
                          ),
                        ]),
                    )
                  : item,
            ),
          ]),
    }),
  ],
  document: {
    singletons: ['siteSettings'],
  },
  schema: {
    types: schemaTypes,
  },
});
