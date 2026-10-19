import type { PersonRole, PersonSummary } from '@/content/types';

const boardRoles: readonly PersonRole[] = ['president', 'vicePresident', 'secretary', 'boardMember'];

/** Direttivo in ordine di ruolo, mantenendo l'ordine originale tra persone con lo stesso ruolo. */
export function getBoardMembers(people: readonly PersonSummary[]): PersonSummary[] {
  return boardRoles.flatMap((role) => people.filter((person) => person.role === role));
}
