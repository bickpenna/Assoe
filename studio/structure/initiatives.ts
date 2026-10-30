import type { ListItem, ListItemBuilder, StructureBuilder } from 'sanity/structure';
import type { OrderableListConfig } from '@sanity/orderable-document-list';
import { INITIATIVE_AREAS } from '../../shared/initiativeAreas.ts';

export const initiativeTemplates = INITIATIVE_AREAS.map(({ value, title }) => ({
  id: `initiative-${value}`,
  title,
  schemaType: 'initiative',
  value: { area: value, active: true },
}));

export const initiativePanes = INITIATIVE_AREAS.map(({ value, title }) => ({
  id: `initiatives-${value}`,
  title,
  filter: '_type == $type && area == $area',
  params: { type: 'initiative', area: value },
  templateIds: [`initiative-${value}`],
}));

/** Ricerca e riordino usano lo stesso filtro, separatamente per ciascun ambito. */
export function createInitiativesStructure(
  S: StructureBuilder,
  createOrdering: (options: Omit<OrderableListConfig, 'S' | 'context'>) => ListItem,
): ListItemBuilder {
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
                S.list()
                  .id(`${id}-tools`)
                  .title(title)
                  .items([
                    S.listItem()
                      .id(`${id}-search`)
                      .title('Elenco e ricerca')
                      .schemaType('initiative')
                      .child(
                        S.documentTypeList('initiative')
                          .id(`${id}-search`)
                          .title(title)
                          .apiVersion('2026-03-01')
                          .filter(filter)
                          .params(params)
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'name', direction: 'asc' }])
                          .initialValueTemplates(templateIds.map((templateId) => S.initialValueTemplateItem(templateId))),
                      ),
                    createOrdering({
                      id: `${id}-order`,
                      type: 'initiative',
                      title: `Ordina ${title.toLocaleLowerCase('it-IT')}`,
                      filter,
                      params,
                      createIntent: false,
                    }),
                  ]),
              ),
          ),
        ]),
    );
}
