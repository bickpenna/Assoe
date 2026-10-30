import type { EventStatus, EventSummary } from '../content/types.ts';
import { todayInRome } from '../../shared/calendar.ts';
import { isValidSanityDateTime } from '../../shared/sanityDateTime.ts';

function eventDay(date: string): string {
  if (!isValidSanityDateTime(date)) throw new RangeError('Data evento non valida.');
  return todayInRome(new Date(date));
}

/** Un evento passa nell'archivio dal giorno successivo nel fuso italiano. */
export function isEventArchived(event: Pick<EventSummary, 'date'>, now = Date.now()): boolean {
  return eventDay(event.date) < todayInRome(new Date(now));
}

/** Gli stati salvati nel CMS non impediscono l'archiviazione automatica. */
export function groupEventsByDate(events: readonly EventSummary[], now = Date.now()) {
  const future: EventSummary[] = [];
  const past: EventSummary[] = [];

  for (const event of events) {
    if (!isEventArchived(event, now)) {
      future.push(event);
    } else {
      past.push(event);
    }
  }

  future.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { future, past };
}

/** Conserva la segnalazione di annullamento anche negli eventi archiviati. */
export function eventDisplayStatus(event: Pick<EventSummary, 'date' | 'status'>, now = Date.now()): EventStatus {
  return isEventArchived(event, now) && event.status !== 'cancelled' ? 'completed' : event.status;
}

export function groupEventsByYear(events: readonly EventSummary[]) {
  const groups = new Map<string, EventSummary[]>();
  for (const event of events) {
    const year = eventDay(event.date).slice(0, 4);
    const group = groups.get(year) ?? [];
    group.push(event);
    groups.set(year, group);
  }
  return [...groups.entries()]
    .sort(([first], [second]) => second.localeCompare(first))
    .map(([year, items]) => ({
      year,
      events: items.sort((first, second) => Date.parse(second.date) - Date.parse(first.date)),
    }));
}

/** Un evento annullato non può diventare il prossimo appuntamento in home. */
export function getNextEvent(events: readonly EventSummary[], now = Date.now()): EventSummary | undefined {
  return groupEventsByDate(events, now).future.find(
    (event) => event.status === 'scheduled' || event.status === 'ongoing',
  );
}
