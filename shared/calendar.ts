/** Date di calendario e giorno corrente nel fuso italiano, condivisi dai contenuti. */
const romeDateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Europe/Rome',
});

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function todayInRome(now: Date = new Date()): string {
  const parts = Object.fromEntries(romeDateFormatter.formatToParts(now).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
