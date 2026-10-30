import type { ListItem, ListItemBuilder, StructureBuilder } from 'sanity/structure';
import { INITIATIVE_AREAS } from '../../shared/initiativeAreas.ts';

export const initiativeTemplates = INITIATIVE_AREAS.map(({ value, title }) => ({
  id: `initiative-${value}`,
  title,
  schemaType: 'initiative',
  value: { area: value, active: true },
}));

export const initiativePanes = [
  {
    id: 'initiatives-all',
    title: 'Tutte le iniziative',
    filter: '_type == $type',
    params: { type: 'initiative' },
    templateIds: initiativeTemplates.map(({ id }) => id),
  },
  ...INITIATIVE_AREAS.map(({ value, title }) => ({
    id: `initiatives-${value}`,
    title,
    filter: '_type == $type && area == $area',
    params: { type: 'initiative', area: value },
    templateIds: [`initiative-${value}`],
  })),
];

/** Gli elenchi nativi mantengono la ricerca; il riordino resta in una vista dedicata. */
export function createInitiativesStructure(S: StructureBuilder, ordering: ListItem): ListItemBuilder {
  return S.listItem()
    .id('initiatives')
    .title('Iniziative')
    .schemaType('initiative')
    .child(
      S.list()
        .id('initiative-areas')
        .title('Iniziative')
        .items([
          ...initiativePanes.map(({ id, title, filter, params, templateIds }) =>
            S.listItem()
              .id(id)
              .title(title)
              .schemaType('initiative')
              .child(
                S.documentTypeList('initiative')
                  .id(id)
                  .title(title)
                  .apiVersion('2026-03-01')
                  .filter(filter)
                  .params(params)
                  .defaultOrdering([{ field: 'name', direction: 'asc' }])
                  .initialValueTemplates(templateIds.map((templateId) => S.initialValueTemplateItem(templateId))),
              ),
          ),
          S.divider(),
          ordering,
        ]),
    );
}
