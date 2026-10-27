import assert from 'node:assert/strict';
import { test } from 'node:test';
import { noticeActionLabels } from '../src/utils/noticeActions.ts';

test('i link generici indicano a quale avviso appartengono', () => {
  assert.deepEqual(noticeActionLabels({ title: 'Nuovi orari' }), {
    linkText: 'Approfondisci',
    linkAccessibleName: 'Approfondisci: Nuovi orari',
    documentText: 'Leggi il PDF',
    documentAccessibleName: 'Leggi il PDF: Nuovi orari',
  });
});

test('il testo personalizzato resta visibile e contestualizzato', () => {
  const labels = noticeActionLabels({ title: 'Servizio civile', linkLabel: 'Leggi il bando' });
  assert.equal(labels.linkText, 'Leggi il bando');
  assert.equal(labels.linkAccessibleName, 'Leggi il bando: Servizio civile');
});
