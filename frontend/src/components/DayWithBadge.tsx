import { Badge } from '@mui/material'
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers'
import { DateTime } from 'luxon'

interface DayWithBadgeProps extends PickersDayProps<DateTime> {
  daysWithAppointments: Set<string>
}

export function DayWithBadge({ daysWithAppointments, day, ...props }: DayWithBadgeProps) {
  const key = day.toISODate() ?? ''
  const hasAppointment = daysWithAppointments.has(key)

  return (
    <Badge
      key={key}
      overlap="circular"
      variant="dot"
      color="primary"
      invisible={!hasAppointment}
    >
      <PickersDay day={day} {...props} />
    </Badge>
  )
}
