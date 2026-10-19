import type { EventSummary } from '@/content/types';

/** L'archivio segue la data; gli eventi in corso restano tra quelli da seguire. */
export function groupEventsByDate(events: EventSummary[], now = Date.now()) {
  const future: EventSummary[] = [];
  const past: EventSummary[] = [];

  for (const event of events) {
    if (event.status === 'ongoing' || new Date(event.date).getTime() >= now) {
      future.push(event);
    } else {
      past.push(event);
    }
  }

  future.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { future, past };
}

/** Un evento annullato non può diventare il prossimo appuntamento in home. */
export function getNextEvent(events: EventSummary[], now = Date.now()): EventSummary | undefined {
  return groupEventsByDate(events, now).future.find(
    (event) => event.status === 'scheduled' || event.status === 'ongoing',
  );
}
