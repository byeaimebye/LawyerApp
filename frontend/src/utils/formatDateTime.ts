import { DateTime } from 'luxon'

/** "lunes, 16 de abril de 2026 · 10:00 – 11:00" in the given IANA timezone */
export function formatDateTimeRange(startAt: string, endAt: string, timezone: string): string {
  const start = DateTime.fromISO(startAt).setZone(timezone)
  const end = DateTime.fromISO(endAt).setZone(timezone)
  return `${start.toLocaleString(DateTime.DATE_HUGE)} · ${start.toFormat('HH:mm')} – ${end.toFormat('HH:mm')}`
}
