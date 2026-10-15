const italianDateFormatter = new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'long',
  timeZone: 'Europe/Rome',
});

export function formatDate(isoDate: string): string {
  return italianDateFormatter.format(new Date(isoDate));
}
