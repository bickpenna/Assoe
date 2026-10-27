import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sanitizeRichTextHtml } from '../src/utils/sanitizeHtml.ts';

test('mantiene il contenuto formattato consentito', () => {
  assert.equal(
    sanitizeRichTextHtml('<p>Un <strong>testo</strong> <a href="https://example.org">utile</a>.</p>'),
    '<p>Un <strong>testo</strong> <a href="https://example.org">utile</a>.</p>',
  );
});

test('la restrizione degli avvisi non cambia i titoli del rich text degli articoli', () => {
  assert.equal(sanitizeRichTextHtml('<h2>Un titolo</h2>'), '<h2>Un titolo</h2>');
});

test('rimuove script, attributi e protocolli non sicuri', () => {
  const html = sanitizeRichTextHtml(
    '<p onclick="alert(1)">Test</p><script>alert(1)</script><a href="javascript:alert(1)">link</a>',
  );

  assert.equal(html, '<p>Test</p><a>link</a>');
});

test('permette link relativi e mailto senza consentire protocol-relative URL', () => {
  assert.equal(
    sanitizeRichTextHtml('<a href="/contatti/">Contatti</a><a href="mailto:test@example.org">Email</a><a href="//evil.example">No</a>'),
    '<a href="/contatti/">Contatti</a><a href="mailto:test@example.org">Email</a><a>No</a>',
  );
});
