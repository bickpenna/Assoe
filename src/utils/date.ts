const italianDateFormatter = new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'long',
  timeZone: 'Europe/Rome',
});

const italianDateTimeFormatter = new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Europe/Rome',
});

export function formatDate(isoDate: string): string {
  return italianDateFormatter.format(new Date(isoDate));
}

export function formatDateTime(isoDate: string): string {
  return italianDateTimeFormatter.format(new Date(isoDate));
}
