import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validIbanOrUndefined } from '../shared/iban.ts';

test('normalizza un IBAN valido senza alterare le cifre', () => {
  assert.equal(validIbanOrUndefined('gb82 west 1234 5698 7654 32'), 'GB82WEST12345698765432');
  assert.equal(validIbanOrUndefined('IT60 X054 2811 1010 0000 0123 456'), 'IT60X0542811101000000123456');
});

test('rifiuta IBAN vuoti, incompleti, malformati o con checksum errato', () => {
  for (const value of [undefined, null, '', 'IT60', 'IT60X0542811101000000123457', 'GB82-WEST-1234', '1234WEST12345698765432']) {
    assert.equal(validIbanOrUndefined(value), undefined);
  }
});
