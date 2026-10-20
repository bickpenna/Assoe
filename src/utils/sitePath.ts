/** Aggiunge il percorso base solo ai link interni del sito. */
export function sitePath(path: string, base = import.meta.env.BASE_URL): string {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(`Percorso interno non valido: ${path}`);
  }

  const prefix = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`;
  return `${prefix}${path}`;
}
