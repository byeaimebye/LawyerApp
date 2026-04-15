import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { Appointment } from '../lib/api'
import { useCancelAppointment } from '../hooks/useCancelAppointment'

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
  const isCancelled = appointment.status === 'CANCELLED'
  const isPast = appointment.startAt <= new Date().toISOString()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const mutation = useCancelAppointment()

  async function handleConfirmCancel() {
    await mutation.mutateAsync(appointment.id)
    setConfirmOpen(false)
  }

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 1, opacity: isCancelled ? 0.55 : 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
          <CardActionArea onClick={() => onClick(appointment)} sx={{ flex: 1 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {start.toFormat('HH:mm')} – {end.toFormat('HH:mm')}
                </Typography>
                <Chip
                  icon={TYPE_ICON[appointment.type]}
                  label={isCancelled ? 'Cancelada' : TYPE_LABEL[appointment.type]}
                  size="small"
                  variant="outlined"
                  color={isCancelled ? 'default' : 'default'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {appointment.clientName}
              </Typography>
            </CardContent>
          </CardActionArea>

          {!isCancelled && !isPast && (
            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
              <IconButton
                size="small"
                color="error"
                onClick={() => setConfirmOpen(true)}
                aria-label="Cancelar cita"
              >
                <CancelOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Cancelar esta cita?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {start.toFormat('HH:mm')} – {end.toFormat('HH:mm')} · {appointment.clientName}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={mutation.isPending}>
            Volver
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmCancel}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Cancelando…' : 'Sí, cancelar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
