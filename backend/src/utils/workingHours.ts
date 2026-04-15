import { DateTime } from 'luxon'

export function isWithinWorkingHours({
  startAt,
  endAt,
  timezone,
  workStartHour,
  workEndHour,
}: {
  startAt: Date
  endAt: Date
  timezone: string
  workStartHour: number
  workEndHour: number
}): boolean {
  const start = DateTime.fromJSDate(startAt, { zone: 'utc' }).setZone(timezone)
  const end = DateTime.fromJSDate(endAt, { zone: 'utc' }).setZone(timezone)

  // Must fall on the same calendar day in the lawyer's timezone
  if (start.toISODate() !== end.toISODate()) return false

  const startDecimal = start.hour + start.minute / 60
  const endDecimal = end.hour + end.minute / 60

  return startDecimal >= workStartHour && endDecimal <= workEndHour
}
