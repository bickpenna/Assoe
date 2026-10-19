import sanitizeHtml from 'sanitize-html';

/**
 * Keeps the HTML generated from Portable Text deliberately small and safe.
 * Sanity content is trusted editorial input, but it is still external data at
 * build time and must not be inserted into a page without an allowlist.
 */
export function sanitizeRichTextHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'a',
      'blockquote',
      'br',
      'code',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'li',
      'ol',
      'p',
      'pre',
      'strong',
      'ul',
    ],
    allowedAttributes: {
      a: ['href'],
    },
    allowedSchemes: ['https', 'mailto'],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
  });
}
