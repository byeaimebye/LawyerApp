import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { useState } from 'react'
import { Appointment } from '../lib/api'
import { useCancelAppointment } from '../hooks/useCancelAppointment'
import { formatDateTimeRange } from '../utils/formatDateTime'

const TYPE_ICON: Record<Appointment['type'], React.ReactElement> = {
  VIDEO: <VideoCallIcon fontSize="small" />,
  PHONE: <PhoneIcon fontSize="small" />,
  IN_PERSON: <LocationOnIcon fontSize="small" />,
}

const TYPE_LABEL: Record<Appointment['type'], string> = {
  VIDEO: 'Video',
  PHONE: 'Teléfono',
  IN_PERSON: 'Presencial',
}

interface AppointmentDetailModalProps {
  appointment: Appointment | null
  lawyerTimezone: string
  onClose: () => void
}

export function AppointmentDetailModal({
  appointment,
  lawyerTimezone,
  onClose,
}: AppointmentDetailModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const mutation = useCancelAppointment()

  const isRemote = appointment?.type === 'VIDEO' || appointment?.type === 'PHONE'
  const isCancelled = appointment?.status === 'CANCELLED'
  const isPast = appointment ? appointment.startAt <= new Date().toISOString() : false

  async function handleConfirmCancel() {
    if (!appointment) return
    await mutation.mutateAsync(appointment.id)
    setConfirmOpen(false)
    onClose()
  }

  return (
    <>
      <Dialog open={!!appointment} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {appointment && TYPE_ICON[appointment.type]}
            Detalle de cita
            {appointment && (
              <Chip
                label={isCancelled ? 'Cancelada' : TYPE_LABEL[appointment.type]}
                size="small"
                variant="outlined"
                color={isCancelled ? 'default' : 'primary'}
                sx={{ ml: 'auto' }}
              />
            )}
          </Box>
        </DialogTitle>

        {appointment && (
          <>
            <DialogContent dividers>
              {/* Horario del abogado */}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tu horario ({lawyerTimezone})
              </Typography>
              <Typography variant="body1" mb={2}>
                {formatDateTimeRange(appointment.startAt, appointment.endAt, lawyerTimezone)}
              </Typography>

              {/* Horario del cliente — solo VIDEO / PHONE */}
              {isRemote && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Horario del cliente ({appointment.clientTimezone})
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    {formatDateTimeRange(
                      appointment.startAt,
                      appointment.endAt,
                      appointment.clientTimezone,
                    )}
                  </Typography>
                </>
              )}

              <Divider sx={{ my: 1 }} />

              {/* Datos del cliente */}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom mt={1.5}>
                Cliente
              </Typography>
              <Typography variant="body2">{appointment.clientName}</Typography>
              <Typography variant="body2">{appointment.clientEmail}</Typography>
              <Typography variant="body2" color="text.secondary">
                {appointment.clientTimezone}
              </Typography>

              {/* Ubicación / link */}
              {appointment.locationOrLink && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {appointment.type === 'IN_PERSON' ? 'Ubicación' : 'Link'}
                  </Typography>
                  <Typography variant="body2">{appointment.locationOrLink}</Typography>
                </>
              )}

              {/* Notas */}
              {appointment.notes && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Notas
                  </Typography>
                  <Typography variant="body2">{appointment.notes}</Typography>
                </>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose}>Cerrar</Button>
              {!isCancelled && !isPast && (
                <Button color="error" variant="outlined" onClick={() => setConfirmOpen(true)}>
                  Cancelar cita
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirm cancel dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>¿Cancelar esta cita?</DialogTitle>
        <DialogContent>
          {appointment && (
            <>
              <Typography variant="body2">
                {appointment.clientName} ·{' '}
                {formatDateTimeRange(appointment.startAt, appointment.endAt, lawyerTimezone)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Esta acción no se puede deshacer.
              </Typography>
            </>
          )}
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
