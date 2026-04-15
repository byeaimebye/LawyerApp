import { Badge } from '@mui/material'
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers'
import { DateTime } from 'luxon'

interface DayWithBadgeProps extends PickersDayProps<DateTime> {
  daysWithAppointments: Set<string>
  timezone: string
}

export function DayWithBadge({
  daysWithAppointments,
  day,
  timezone,
  ...props
}: DayWithBadgeProps) {
  const key = day.toISODate() ?? ''
  const hasAppointment = daysWithAppointments.has(key)

  const today = DateTime.now().setZone(timezone).startOf('day')
  const isPast = day.startOf('day') < today

  return (
    <Badge
      key={key}
      overlap="circular"
      variant="dot"
      color="primary"
      invisible={!hasAppointment}
    >
      <PickersDay
        day={day}
        {...props}
        sx={
          isPast
            ? {
                color: 'text.disabled',
                opacity: 0.45,
                '&.Mui-selected': { opacity: 0.45 },
              }
            : undefined
        }
      />
    </Badge>
  )
}
