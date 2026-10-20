import type { EventStatus } from '@/content/types';
export { personRoleLabel } from '../../shared/personRoles.ts';

const eventStatusLabels: Record<EventStatus, string> = {
  scheduled: 'Programmato',
  ongoing: 'In corso',
  completed: 'Concluso',
  cancelled: 'Annullato',
};

export function eventStatusLabel(status: EventStatus): string {
  return eventStatusLabels[status];
}
