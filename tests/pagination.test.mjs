import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paginationItems } from '../src/utils/pagination.ts';

test('mostra tutte le pagine quando non ci sono buchi', () => {
  assert.deepEqual(paginationItems(2, 4), [1, 2, 3, 4]);
});

test('inserisce un ellissi tra pagine lontane', () => {
  assert.deepEqual(paginationItems(8, 20), [1, null, 6, 7, 8, 9, 10, null, 20]);
});

test('rifiuta parametri di paginazione non validi', () => {
  assert.deepEqual(paginationItems(0, 3), []);
  assert.deepEqual(paginationItems(4, 3), []);
  assert.deepEqual(paginationItems(1.5, 3), []);
});
