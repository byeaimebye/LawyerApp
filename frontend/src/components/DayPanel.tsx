import { Box, Typography, Divider, CircularProgress, Alert } from '@mui/material'
import { DateTime } from 'luxon'
import { useAuth } from '../contexts/AuthContext'
import { useAppointments } from '../hooks/useAppointments'
import { computeFreeSlots, FreeSlot } from '../utils/slots'
import { AppointmentCard } from './AppointmentCard'
import { FreeSlotButton } from './FreeSlotButton'
import { Appointment } from '../lib/api'

interface LawyerOverride {
  id: string
  timezone: string
  workStartHour: number
  workEndHour: number
}

interface DayPanelProps {
  day: DateTime
  onSlotClick: (slot: FreeSlot) => void
  onAppointmentClick: (appointment: Appointment) => void
  lawyerOverride?: LawyerOverride
}

export function DayPanel({ day, onSlotClick, onAppointmentClick, lawyerOverride }: DayPanelProps) {
  const { user } = useAuth()
  const timezone = lawyerOverride?.timezone ?? user?.timezone ?? 'UTC'
  const workStartHour = lawyerOverride?.workStartHour ?? user?.workStartHour ?? 8
  const workEndHour = lawyerOverride?.workEndHour ?? user?.workEndHour ?? 18

  const today = DateTime.now().setZone(timezone).startOf('day')
  // Normalize day to the active timezone before comparing — avoids false isPast
  // when day carries a different zone (e.g. SUPERADMIN's UTC vs lawyer's BA timezone)
  const isPast = day.setZone(timezone).startOf('day') < today

  const { data: appointments = [], isLoading } = useAppointments(day, lawyerOverride?.id)

  const dayAppointments = appointments
    .filter((a) => {
      const aptDay = DateTime.fromISO(a.startAt).setZone(timezone).toISODate()
      return aptDay === day.toISODate()
    })
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  const freeSlots = isPast
    ? []
    : computeFreeSlots(day, timezone, workStartHour, workEndHour, dayAppointments)

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  return (
    <Box sx={{ minWidth: 280 }}>
      <Typography variant="h6" gutterBottom>
        {day.setZone(timezone).toLocaleString(DateTime.DATE_HUGE)}
      </Typography>

      {isPast && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Día pasado — solo visualización. No se pueden crear nuevas citas.
        </Alert>
      )}

      {dayAppointments.length === 0 && freeSlots.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {isPast ? 'Sin citas registradas.' : 'Sin actividad en este día.'}
        </Typography>
      )}

      {dayAppointments.length > 0 && (
        <>
          <Typography variant="overline" color="text.secondary">
            Citas agendadas
          </Typography>
          {dayAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              timezone={timezone}
              onClick={onAppointmentClick}
            />
          ))}
          {!isPast && freeSlots.length > 0 && <Divider sx={{ my: 2 }} />}
        </>
      )}

      {!isPast && freeSlots.length > 0 && (
        <>
          <Typography variant="overline" color="text.secondary">
            Horarios disponibles
          </Typography>
          <Box mt={1}>
            {freeSlots.map((slot) => (
              <FreeSlotButton key={slot.start.toISO()} slot={slot} onClick={onSlotClick} />
            ))}
          </Box>
        </>
      )}

      {!isPast && dayAppointments.length > 0 && freeSlots.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Agenda completa para este día.
        </Typography>
      )}
    </Box>
  )
}
