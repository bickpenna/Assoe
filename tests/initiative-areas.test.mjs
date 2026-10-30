import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluate, parse } from 'groq-js';
import { INITIATIVE_AREAS, initiativeAreaError, initiativeAreaLabel, isInitiativeArea } from '../shared/initiativeAreas.ts';
import { createInitiativesStructure, initiativePanes, initiativeTemplates } from '../studio/structure/initiatives.ts';

const initiative = (id, area, extra = {}) => ({
  _id: id, _type: 'initiative', name: id, slug: { current: id }, active: true,
  ...(area === undefined ? {} : { area }), ...extra,
});
const documents = [
  initiative('premio', 'social'), initiative('natale', 'social'),
  initiative('convenzioni', 'volunteering'), initiative('banco', 'volunteering'),
  initiative('nascosta', 'social', { active: false }),
  initiative('precedente'), initiative('vuota', null), initiative('sconosciuta', 'unknown'),
  initiative('tipo-errato', 42), initiative('spazi', ' '),
  { _id: 'articolo', _type: 'article', area: 'social' },
];

async function members(paneId, dataset = documents) {
  const pane = initiativePanes.find(({ id }) => id === paneId);
  assert.ok(pane, `Elenco non trovato: ${paneId}`);
  const result = await evaluate(parse(`*[${pane.filter}]._id`), { dataset, params: pane.params });
  return result.get();
}

test('gli ambiti sono espliciti e accettano solo i due valori previsti', () => {
  assert.deepEqual(INITIATIVE_AREAS.map(({ value }) => value), ['social', 'volunteering']);
  for (const { value, title } of INITIATIVE_AREAS) {
    assert.equal(isInitiativeArea(value), true);
    assert.equal(initiativeAreaError(value), undefined);
    assert.equal(initiativeAreaLabel(value), title);
  }
  for (const value of [undefined, null, '', ' ', 'Social', 'unknown', 42, {}, []]) {
    assert.equal(isInitiativeArea(value), false);
    assert.match(initiativeAreaError(value), /Scegli/);
    assert.equal(initiativeAreaLabel(value), 'Ambito obbligatorio');
  }
});

test('le liste per ambito selezionano soltanto le iniziative corrette, comprese quelle disattivate', async () => {
  assert.deepEqual(await members('initiatives-social'), ['premio', 'natale', 'nascosta']);
  assert.deepEqual(await members('initiatives-volunteering'), ['convenzioni', 'banco']);
  assert.deepEqual(await members('initiatives-social', []), []);
  assert.deepEqual(await members('initiatives-volunteering', []), []);
});

test('esistono solo due ambiti e i valori mancanti o invalidi non costituiscono una terza scelta', async () => {
  assert.equal(initiativePanes.length, 3);
  assert.deepEqual(await members('initiatives-all'), documents.filter(({ _type }) => _type === 'initiative').map(({ _id }) => _id));
  for (const record of documents.filter(({ _type }) => _type === 'initiative')) {
    const lists = await Promise.all(['initiatives-social', 'initiatives-volunteering'].map((id) => members(id, [record])));
    const valid = isInitiativeArea(record.area);
    assert.equal(lists.filter((ids) => ids.includes(record._id)).length, valid ? 1 : 0, record._id);
    if (!valid) assert.match(initiativeAreaError(record.area), /Scegli/);
  }
});

test('cambiare solo ambito sposta la stessa iniziativa nel nuovo elenco', async () => {
  const original = initiative('premio', 'social', {
    orderRank: '0|abc:', description: [{ _type: 'block' }], image: { asset: { _ref: 'image-1' } },
  });
  const moved = { ...original, area: 'volunteering' };
  assert.deepEqual(await members('initiatives-social', [original]), ['premio']);
  assert.deepEqual(await members('initiatives-social', [moved]), []);
  assert.deepEqual(await members('initiatives-volunteering', [moved]), ['premio']);
  assert.deepEqual(Object.keys(original).filter((key) => original[key] !== moved[key]), ['area']);
  // Articoli ed eventi continuano a riferirsi allo stesso ID, senza ricreare il documento.
  const related = { _type: 'article', initiatives: [{ _ref: original._id }] };
  const result = await evaluate(parse('*[_type == "article" && references($id)]._type'), {
    dataset: [related, moved], params: { id: moved._id },
  });
  assert.deepEqual(await result.get(), ['article']);
});

test('la creazione da un ambito precompila la scelta senza creare un nuovo tipo di documento', () => {
  assert.equal(initiativeTemplates.length, 2);
  for (const template of initiativeTemplates) {
    assert.equal(template.schemaType, 'initiative');
    assert.equal(isInitiativeArea(template.value.area), true);
    assert.equal(template.value.active, true);
    assert.deepEqual(Object.keys(template.value).sort(), ['active', 'area']);
    const pane = initiativePanes.find(({ params }) => params.area === template.value.area);
    assert.deepEqual(pane.templateIds, [template.id]);
  }
  assert.deepEqual(initiativePanes.find(({ id }) => id === 'initiatives-all').templateIds, initiativeTemplates.map(({ id }) => id));
  for (const pane of initiativePanes) {
    assert.ok(pane.templateIds.length > 0);
    for (const id of pane.templateIds) {
      const template = initiativeTemplates.find((template) => template.id === id);
      assert.ok(template, `Template non trovato: ${id}`);
      assert.equal(isInitiativeArea(template.value.area), true);
    }
  }
});

function structureBuilder() {
  function builder(kind, initial = {}) {
    const spec = { kind, ...initial };
    const node = { spec };
    for (const method of ['id', 'title', 'schemaType', 'child', 'items', 'apiVersion', 'filter', 'params', 'defaultOrdering', 'initialValueTemplates']) {
      node[method] = (value) => { spec[method] = value; return node; };
    }
    return node;
  }
  return {
    listItem: () => builder('listItem'), list: () => builder('list'),
    documentTypeList: (schemaType) => builder('documentTypeList', { schemaType }),
    initialValueTemplateItem: (id) => ({ templateId: id }), divider: () => ({ kind: 'divider' }),
  };
}

test('un solo contenitore offre liste native ricercabili e una vista di riordino separata', () => {
  const ordering = { id: 'orderable-initiative', title: 'Ordina iniziative' };
  const root = createInitiativesStructure(structureBuilder(), ordering).spec;
  assert.equal(root.title, 'Iniziative');
  assert.equal(root.schemaType, 'initiative');
  const children = root.child.spec.items;
  assert.deepEqual(children.filter((item) => item.spec).map((item) => item.spec.title), [
    'Tutte le iniziative', 'Iniziative sociali', 'Volontariato',
  ]);
  assert.equal(children.at(-1), ordering);
  for (const item of children.filter((item) => item.spec)) {
    const list = item.spec.child.spec;
    const pane = initiativePanes.find(({ id }) => id === item.spec.id);
    assert.equal(list.kind, 'documentTypeList');
    assert.equal(list.schemaType, 'initiative');
    assert.equal(list.filter, pane.filter);
    assert.deepEqual(list.params, pane.params);
    assert.deepEqual(list.defaultOrdering, [{ field: 'name', direction: 'asc' }]);
    assert.deepEqual(list.initialValueTemplates.map(({ templateId }) => templateId), pane.templateIds);
  }
});
