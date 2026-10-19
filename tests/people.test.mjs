import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getBoardMembers } from '../src/utils/people.ts';

const person = (id, role) => ({ id, firstName: id, lastName: 'Test', role });

test('mostra il direttivo in ordine di ruolo senza includere gli altri associati', () => {
  const people = [
    person('volontario', 'volunteer'),
    person('consigliere-1', 'boardMember'),
    person('presidente', 'president'),
    person('segretario', 'secretary'),
    person('vicepresidente', 'vicePresident'),
    person('consigliere-2', 'boardMember'),
    person('servizio-civile', 'civilServiceVolunteer'),
  ];

  assert.deepEqual(getBoardMembers(people).map(({ id }) => id), [
    'presidente', 'vicepresidente', 'segretario', 'consigliere-1', 'consigliere-2',
  ]);
  assert.equal(people[0].id, 'volontario');
});

test('gestisce elenchi vuoti o senza persone del direttivo', () => {
  assert.deepEqual(getBoardMembers([]), []);
  assert.deepEqual(getBoardMembers([person('volontario', 'volunteer')]), []);
});

test('ignora ruoli sconosciuti provenienti da dati non validi', () => {
  assert.deepEqual(getBoardMembers([person('sconosciuto', 'other')]), []);
});
