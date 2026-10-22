const sanityDateTimePattern = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:\.(?<milliseconds>\d{1,3}))?Z$/;

/** Verifica il formato ISO UTC e impedisce a Date di normalizzare date inesistenti. */
export function isValidSanityDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  const match = sanityDateTimePattern.exec(value);
  if (!match?.groups) return false;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;

  return parsed.getUTCFullYear() === Number(match.groups.year)
    && parsed.getUTCMonth() + 1 === Number(match.groups.month)
    && parsed.getUTCDate() === Number(match.groups.day)
    && parsed.getUTCHours() === Number(match.groups.hour)
    && parsed.getUTCMinutes() === Number(match.groups.minute)
    && parsed.getUTCSeconds() === Number(match.groups.second);
}
