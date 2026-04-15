import { Card, CardActionArea, CardContent, Typography, Chip, Box } from '@mui/material'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { DateTime } from 'luxon'
import { Appointment } from '../lib/api'

const TYPE_ICON = {
  VIDEO: <VideoCallIcon fontSize="small" />,
  PHONE: <PhoneIcon fontSize="small" />,
  IN_PERSON: <LocationOnIcon fontSize="small" />,
}

const TYPE_LABEL = {
  VIDEO: 'Video',
  PHONE: 'Teléfono',
  IN_PERSON: 'Presencial',
}

interface AppointmentCardProps {
  appointment: Appointment
  timezone: string
  onClick: (appointment: Appointment) => void
}

export function AppointmentCard({ appointment, timezone, onClick }: AppointmentCardProps) {
  const start = DateTime.fromISO(appointment.startAt).setZone(timezone)
  const end = DateTime.fromISO(appointment.endAt).setZone(timezone)

  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardActionArea onClick={() => onClick(appointment)}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {start.toFormat('HH:mm')} – {end.toFormat('HH:mm')}
            </Typography>
            <Chip
              icon={TYPE_ICON[appointment.type]}
              label={TYPE_LABEL[appointment.type]}
              size="small"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {appointment.clientName}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
