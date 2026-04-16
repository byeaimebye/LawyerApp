import { useState } from 'react'
import { Box, Grid } from '@mui/material'
import { DateTime } from 'luxon'
import { AppNavbar } from '../components/AppNavbar'
import { Calendar } from '../components/Calendar'
import { DayPanel } from '../components/DayPanel'
import { CreateAppointmentModal } from '../components/CreateAppointmentModal'
import { AppointmentDetailModal } from '../components/AppointmentDetailModal'
import { FreeSlot } from '../utils/slots'
import { Appointment } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export function CalendarPage() {
  const { user } = useAuth()
  const timezone = user?.timezone ?? 'UTC'

  const [selectedDay, setSelectedDay] = useState<DateTime>(() =>
    DateTime.now().setZone(timezone).startOf('day'),
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<FreeSlot | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  function handleSlotClick(slot: FreeSlot) {
    setSelectedSlot(slot)
    setModalOpen(true)
  }

  function handleAppointmentClick(appointment: Appointment) {
    setSelectedAppointment(appointment)
  }

  return (
    <>
      <AppNavbar />
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5} lg={4}>
            <Calendar selectedDay={selectedDay} onDaySelect={setSelectedDay} />
          </Grid>
          <Grid item xs={12} md={7} lg={8}>
            <DayPanel
              day={selectedDay}
              onSlotClick={handleSlotClick}
              onAppointmentClick={handleAppointmentClick}
            />
          </Grid>
        </Grid>
      </Box>

      <CreateAppointmentModal
        open={modalOpen}
        slot={selectedSlot}
        onClose={() => setModalOpen(false)}
      />

      <AppointmentDetailModal
        appointment={selectedAppointment}
        lawyerTimezone={timezone}
        onClose={() => setSelectedAppointment(null)}
      />
    </>
  )
}
