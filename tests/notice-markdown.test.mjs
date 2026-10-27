import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderNoticeMarkdown } from '../src/utils/noticeMarkdown.ts';

test('mostra la formattazione Markdown degli avvisi', () => {
  const html = renderNoticeMarkdown('**Importante**: _leggi_ [il programma](https://example.org/info).');
  assert.match(html, /<strong>Importante<\/strong>/);
  assert.match(html, /<em>leggi<\/em>/);
  assert.match(html, /href="https:\/\/example\.org\/info"/);
});

test('rimuove script, immagini e collegamenti non sicuri dal Markdown', () => {
  const html = renderNoticeMarkdown('[clicca](javascript:alert(1)) ![foto](https://evil.example/photo.jpg) <script>alert(1)</script>');
  assert.doesNotMatch(html, /javascript:|<script|<img|onerror=/i);
  assert.match(html, /clicca/);
});

test('non crea titoli o altri blocchi estranei all’avviso', () => {
  const html = renderNoticeMarkdown('# Titolo extra\n\n**Importante**\n\n- Primo\n- Secondo\n\n> Citazione');
  assert.doesNotMatch(html, /<h[1-6]\b|<blockquote\b|<img\b/i);
  assert.match(html, /Titolo extra/);
  assert.match(html, /<strong>Importante<\/strong>/);
  assert.match(html, /<ul>/);
  assert.match(html, /Primo/);
});
