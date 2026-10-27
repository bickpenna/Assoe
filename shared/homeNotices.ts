/** Numero massimo di avvisi mostrati nella homepage e ammessi nello Studio. */
export const MAX_HOME_NOTICES = 3;
export const MAX_HOME_NOTICE_TEXT_LENGTH = 500;
export const MAX_HOME_NOTICE_LINK_LABEL_LENGTH = 80;

export function hasVisibleText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

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

/** La data di scadenza è inclusa: l'avviso scompare il giorno successivo in Italia. */
export function isHomeNoticeExpired(expiresOn: string | undefined, today: string): boolean {
  return expiresOn !== undefined && expiresOn < today;
}
