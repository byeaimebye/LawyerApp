import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { DateTime } from 'luxon'
import { AppNavbar } from '../components/AppNavbar'
import { Calendar } from '../components/Calendar'

export function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<DateTime | null>(null)

  return (
    <>
      <AppNavbar />
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Calendar onDaySelect={setSelectedDay} />
        {selectedDay && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            Día seleccionado: {selectedDay.toLocaleString(DateTime.DATE_FULL)}
          </Typography>
        )}
      </Box>
    </>
  )
}
