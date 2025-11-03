import { format, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

// Convert UTC string to local formatted string
export function formatLocalTime(utcString) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = utcToZonedTime(utcString, timezone);
  return format(zonedDate, "yyyy-MM-dd HH:mm (zzz)");
}

// Convert local Date object to UTC
export function localToUTC(localDate) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return zonedTimeToUtc(localDate, timezone);
}
