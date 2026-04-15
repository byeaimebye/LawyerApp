import { useState } from 'react'
import { Box, Grid } from '@mui/material'
import { DateTime } from 'luxon'
import { AppNavbar } from '../components/AppNavbar'
import { Calendar } from '../components/Calendar'
import { DayPanel } from '../components/DayPanel'
import { FreeSlot } from '../utils/slots'
import { Appointment } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export function CalendarPage() {
  const { user } = useAuth()
  const timezone = user?.timezone ?? 'UTC'

  const [selectedDay, setSelectedDay] = useState<DateTime>(() =>
    DateTime.now().setZone(timezone).startOf('day'),
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSlotClick(_slot: FreeSlot) {
    // TKT-10: open create appointment modal
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleAppointmentClick(_appointment: Appointment) {
    // TKT-12: open appointment detail
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
    </>
  )
}
