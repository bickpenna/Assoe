/** Numero massimo di avvisi mostrati nella homepage e ammessi nello Studio. */
export const MAX_HOME_NOTICES = 3;
export const MAX_HOME_NOTICE_TEXT_LENGTH = 500;
export const MAX_HOME_NOTICE_LINK_LABEL_LENGTH = 80;

export function hasVisibleText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export { isCalendarDate, todayInRome } from './calendar.ts';

/** La data di scadenza è inclusa: l'avviso scompare il giorno successivo in Italia. */
export function isHomeNoticeExpired(expiresOn: string | undefined, today: string): boolean {
  return expiresOn !== undefined && expiresOn < today;
}
