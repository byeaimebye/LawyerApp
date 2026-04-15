import { Box, Typography } from '@mui/material'
import { AppNavbar } from '../components/AppNavbar'

export function CalendarPage() {
  return (
    <>
      <AppNavbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Calendario</Typography>
        <Typography variant="body2" color="text.secondary">
          Próximamente — TKT-07
        </Typography>
      </Box>
    </>
  )
}
