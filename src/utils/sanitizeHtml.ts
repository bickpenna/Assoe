import sanitizeHtml from 'sanitize-html';

const noticeTags = ['a', 'br', 'em', 'li', 'ol', 'p', 'strong', 'ul'];
const richTextTags = [...noticeTags, 'blockquote', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre'];

function sanitizeContentHtml(html: string, allowedTags: string[]): string {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      a: ['href'],
    },
    allowedSchemes: ['https', 'mailto'],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
  });
}

/**
 * Keeps the HTML generated from Portable Text deliberately small and safe.
 * Sanity content is trusted editorial input, but it is still external data at
 * build time and must not be inserted into a page without an allowlist.
 */
export function sanitizeRichTextHtml(html: string): string {
  return sanitizeContentHtml(html, richTextTags);
}

/** Gli avvisi mantengono solo la formattazione breve prevista nell'editor. */
export function sanitizeNoticeHtml(html: string): string {
  return sanitizeContentHtml(html, noticeTags);
}
