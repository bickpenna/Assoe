/** Divide un testo semplice in paragrafi, senza interpretarlo come HTML. */
export function toParagraphs(value: string | undefined): string[] {
  return value?.trim().split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean) ?? [];
}
