import { DateTime, Interval } from 'luxon'
import { Appointment } from '../lib/api'

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
  const workStart = day.setZone(timezone).startOf('day').set({ hour: workStartHour })
  const workEnd = day.setZone(timezone).startOf('day').set({ hour: workEndHour })

  // Build 30-min candidate slots within working hours
  const candidates: FreeSlot[] = []
  let cursor = workStart
  while (cursor < workEnd) {
    const slotEnd = cursor.plus({ minutes: 30 })
    if (slotEnd <= workEnd) {
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

  // A candidate slot is free if it doesn't overlap any occupied interval
  return candidates.filter((slot) =>
    occupied.every((occ) => {
      const slotInterval = Interval.fromDateTimes(slot.start, slot.end)
      const occInterval = Interval.fromDateTimes(occ.start, occ.end)
      return !slotInterval.overlaps(occInterval)
    }),
  )
}
