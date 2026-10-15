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

export function eventStatusLabel(status: EventStatus): string {
  return eventStatusLabels[status];
}

export function personRoleLabel(role: PersonRole): string {
  return personRoleLabels[role];
}
