export function assertUniqueSlugs(
  items: ReadonlyArray<{ slug: string }>,
  contentType: string,
): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const { slug } of items) {
    if (seen.has(slug)) duplicates.add(slug);
    seen.add(slug);
  }

  if (duplicates.size > 0) {
    throw new Error(`${contentType} hanno slug duplicati: ${[...duplicates].join(', ')}`);
  }
}

export function staticPathsFromSlugs(items: ReadonlyArray<{ slug: string }>) {
  return items.map(({ slug }) => ({ params: { slug } }));
}

export async function requireBySlug<T>(
  slug: string | undefined,
  getter: (slug: string) => Promise<T | null>,
  contentType: string,
): Promise<T> {
  const content = slug ? await getter(slug) : null;

  if (!content) {
    throw new Error(`${contentType} non trovato durante la build: ${slug ?? '(slug mancante)'}`);
  }

  return content;
}
