import { useState, useCallback, useMemo } from 'react'
import { DateCalendar, LocalizationProvider, PickersDayProps } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { DateTime } from 'luxon'
import { DayWithBadge } from './DayWithBadge'
import { useAppointments } from '../hooks/useAppointments'
import { useAuth } from '../contexts/AuthContext'

interface CalendarProps {
  selectedDay: DateTime
  onDaySelect: (day: DateTime) => void
  timezoneOverride?: string
  lawyerIdOverride?: string
}

export function Calendar({ selectedDay, onDaySelect, timezoneOverride, lawyerIdOverride }: CalendarProps) {
  const { user } = useAuth()
  const timezone = timezoneOverride ?? user?.timezone ?? 'UTC'

  const [currentMonth, setCurrentMonth] = useState(() => DateTime.now().setZone(timezone))

  // For SUPERADMIN, don't query until a lawyer is selected (lawyerIdOverride required)
  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const appointmentsEnabled = !isSuperAdmin || !!lawyerIdOverride

  const { data: appointments = [] } = useAppointments(currentMonth, lawyerIdOverride, appointmentsEnabled)

  const daysWithAppointments = useMemo(() => {
    const set = new Set<string>()
    for (const apt of appointments) {
      const day = DateTime.fromISO(apt.startAt).setZone(timezone).toISODate()
      if (day) set.add(day)
    }
    return set
  }, [appointments, timezone])

  const handleMonthChange = useCallback(
    (month: DateTime) => setCurrentMonth(month.setZone(timezone)),
    [timezone],
  )

  const handleDaySelect = useCallback(
    (day: DateTime | null) => {
      if (!day) return
      onDaySelect(day)
    },
    [onDaySelect],
  )

  function renderDay(props: PickersDayProps<DateTime>) {
    return (
      <DayWithBadge
        {...props}
        daysWithAppointments={daysWithAppointments}
        timezone={timezone}
      />
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="es">
      <DateCalendar
        value={selectedDay}
        onChange={handleDaySelect}
        onMonthChange={handleMonthChange}
        timezone={timezone}
        slots={{ day: renderDay }}
      />
    </LocalizationProvider>
  )
}
