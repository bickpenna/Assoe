import { marked } from 'marked';
import { sanitizeNoticeHtml } from './sanitizeHtml.ts';

/** Il Markdown del CMS non entra mai nell'HTML senza passare dall'allowlist. */
export function renderNoticeMarkdown(markdown: string): string {
  return sanitizeNoticeHtml(marked.parse(markdown, { async: false, gfm: true }));
}
