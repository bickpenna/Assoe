import type { HomeNotice } from '../content/types.ts';

/** Mantiene distinti i link degli avvisi anche per chi usa un lettore di schermo. */
export function noticeActionLabels({ title, linkLabel }: Pick<HomeNotice, 'title' | 'linkLabel'>) {
  const linkText = linkLabel ?? 'Approfondisci';
  const documentText = 'Leggi il PDF';

  return {
    linkText,
    linkAccessibleName: `${linkText}: ${title}`,
    documentText,
    documentAccessibleName: `${documentText}: ${title}`,
  };
}
