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
