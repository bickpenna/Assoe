import type { EventSummary } from '../content/types.ts';
import { ARCHIVE_PAGE_SIZE } from '../config/pagination.ts';
import { groupEventsByDate, groupEventsByYear } from './events.ts';

/** Genera archivio completo, archivi annuali e relative pagine, senza eventi duplicati. */
export function eventArchivePages(events: readonly EventSummary[], now = Date.now()) {
  const { past } = groupEventsByDate(events, now);
  const yearly = groupEventsByYear(past);
  const years = yearly.map(({ year }) => year);
  const collections: Array<{ year?: string; events: EventSummary[] }> = [{ events: past }, ...yearly];
  return collections.flatMap(({ year, events: items }) => {
    const basePath = year ? `/eventi/archivio/${year}/` : '/eventi/archivio/';
    return Array.from({ length: Math.max(1, Math.ceil(items.length / ARCHIVE_PAGE_SIZE)) }, (_, index) => ({
      route: [year, index > 0 ? `pagina/${index + 1}` : undefined].filter(Boolean).join('/') || undefined,
      year,
      years,
      basePath,
      currentPage: index + 1,
      totalItems: items.length,
      events: items.slice(index * ARCHIVE_PAGE_SIZE, (index + 1) * ARCHIVE_PAGE_SIZE),
    }));
  });
}
