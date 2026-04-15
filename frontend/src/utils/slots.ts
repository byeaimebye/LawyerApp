import { DateTime } from 'luxon'
import { Appointment } from '../lib/api'

export const APPOINTMENT_DURATION_MINUTES = 45

export interface FreeSlot {
  start: DateTime
  end: DateTime
}

export function computeFreeSlots(
  day: DateTime,
  timezone: string,
  workStartHour: number,
  workEndHour: number,
  appointments: Appointment[],
): FreeSlot[] {
  const dayInTz = day.setZone(timezone).startOf('day')
  const workStart = dayInTz.set({ hour: workStartHour, minute: 0, second: 0, millisecond: 0 })
  const workEnd = dayInTz.set({ hour: workEndHour, minute: 0, second: 0, millisecond: 0 })
  const now = DateTime.now()

  // Build 45-min candidate slots within working hours, skipping slots that
  // have already started (the backend also rejects past startAt values)
  const candidates: FreeSlot[] = []
  let cursor = workStart
  while (cursor < workEnd) {
    const slotEnd = cursor.plus({ minutes: APPOINTMENT_DURATION_MINUTES })
    if (slotEnd <= workEnd && cursor > now) {
      candidates.push({ start: cursor, end: slotEnd })
    }
    cursor = slotEnd
  }

  // Build occupied intervals from scheduled appointments
  const occupied = appointments
    .filter((a) => a.status === 'SCHEDULED')
    .map((a) => ({
      start: DateTime.fromISO(a.startAt).setZone(timezone),
      end: DateTime.fromISO(a.endAt).setZone(timezone),
    }))

  // A slot is free only if it has zero overlap with every occupied interval.
  // Using direct ms comparison avoids any edge-case behaviour from Interval.overlaps().
  // Two ranges overlap when: start < other.end AND end > other.start
  return candidates.filter((slot) =>
    occupied.every((occ) => slot.start >= occ.end || slot.end <= occ.start),
  )
}
