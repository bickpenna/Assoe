import type { EventStatus, PersonRole } from '@/content/types';

const eventStatusLabels: Record<EventStatus, string> = {
  scheduled: 'Programmato',
  ongoing: 'In corso',
  completed: 'Concluso',
  cancelled: 'Annullato',
};

const personRoleLabels: Record<PersonRole, string> = {
  president: 'Presidente',
  vicePresident: 'Vicepresidente',
  secretary: 'Segretario',
  boardMember: 'Consigliere',
  volunteer: 'Volontario',
  civilServiceVolunteer: 'Volontario del servizio civile',
};

/** Ordine di presentazione e titoli delle sezioni nella raccolta delle persone. */
export const personRoleGroups: ReadonlyArray<{ role: PersonRole; title: string }> = [
  { role: 'president', title: 'Presidenza' },
  { role: 'vicePresident', title: 'Vicepresidenza' },
  { role: 'secretary', title: 'Segreteria' },
  { role: 'boardMember', title: 'Consiglio direttivo' },
  { role: 'volunteer', title: 'Volontari' },
  { role: 'civilServiceVolunteer', title: 'Servizio civile' },
];

export function eventStatusLabel(status: EventStatus): string {
  return eventStatusLabels[status];
}

export function personRoleLabel(role: PersonRole): string {
  return personRoleLabels[role];
}
