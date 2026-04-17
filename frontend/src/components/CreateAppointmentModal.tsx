import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  Snackbar,
  Alert,
  FormHelperText,
  Stack,
} from '@mui/material'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCreateAppointment } from '../hooks/useCreateAppointment'
import { TimezoneSelect } from './TimezoneSelect'
import { FreeSlot, APPOINTMENT_DURATION_MINUTES } from '../utils/slots'
import type { AxiosError } from 'axios'

interface FormState {
  type: 'IN_PERSON' | 'VIDEO' | 'PHONE'
  clientName: string
  clientEmail: string
  clientTimezone: string
  locationOrLink: string
  notes: string
}

interface FormErrors {
  clientName?: string
  clientEmail?: string
  clientTimezone?: string
}

interface CreateAppointmentModalProps {
  open: boolean
  slot: FreeSlot | null
  onClose: () => void
  lawyerId?: string
}

const TYPE_LABELS: Record<string, string> = {
  IN_PERSON: 'Presencial',
  VIDEO: 'Videollamada',
  PHONE: 'Telefónica',
}

function getBackendErrorMessage(err: unknown): string {
  const axiosErr = err as AxiosError<{ error?: string; code?: string }>
  const code = axiosErr.response?.data?.code
  const message = axiosErr.response?.data?.error

  if (code === 'OVERLAP') return 'Slot no disponible, ya existe una cita en ese horario.'
  if (code === 'OUTSIDE_WORKING_HOURS') return 'Cita fuera del horario laboral.'
  if (code === 'PAST_DATE') return 'No se pueden crear citas en el pasado.'
  return message ?? 'Error al crear la cita. Intentá de nuevo.'
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const EMPTY_FORM: FormState = {
  type: 'IN_PERSON',
  clientName: '',
  clientEmail: '',
  clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  locationOrLink: '',
  notes: '',
}

export function CreateAppointmentModal({ open, slot, onClose, lawyerId }: CreateAppointmentModalProps) {
  const { user } = useAuth()
  const lawyerTimezone = user?.timezone ?? 'UTC'

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  })

  const mutation = useCreateAppointment()

  function handleClose() {
    setForm(EMPTY_FORM)
    setErrors({})
    onClose()
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.clientName.trim()) newErrors.clientName = 'El nombre es requerido.'
    if (!form.clientEmail.trim()) {
      newErrors.clientEmail = 'El email es requerido.'
    } else if (!validateEmail(form.clientEmail)) {
      newErrors.clientEmail = 'Email inválido.'
    }
    if (!form.clientTimezone) newErrors.clientTimezone = 'La zona horaria es requerida.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!slot || !validate()) return

    try {
      await mutation.mutateAsync({
        ...(lawyerId ? { lawyerId } : {}),
        startAt: slot.start.toUTC().toISO()!,
        durationMinutes: 45,
        type: form.type,
        clientName: form.clientName.trim(),
        clientEmail: form.clientEmail.trim(),
        clientTimezone: form.clientTimezone,
        locationOrLink: form.locationOrLink.trim() || undefined,
        notes: form.notes.trim() || undefined,
      })
      handleClose()
    } catch (err) {
      setSnackbar({ open: true, message: getBackendErrorMessage(err) })
    }
  }

  // Live preview — duration is always 45 min
  const previewStart = slot?.start ?? DateTime.now().setZone(lawyerTimezone)
  const previewEnd = previewStart.plus({ minutes: APPOINTMENT_DURATION_MINUTES })
  const clientStart = form.clientTimezone ? previewStart.setZone(form.clientTimezone) : null
  const clientEnd = form.clientTimezone ? previewEnd.setZone(form.clientTimezone) : null
  const showClientPreview = form.type === 'VIDEO' || form.type === 'PHONE'
  const showLocationField = form.type === 'IN_PERSON' || form.type === 'VIDEO'

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva cita</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* Start time display — fixed 45-min duration */}
            <Box sx={{ bgcolor: 'grey.100', borderRadius: 1, px: 2, py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Horario seleccionado · {APPOINTMENT_DURATION_MINUTES} min
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {previewStart.toFormat('HH:mm')} – {previewEnd.toFormat('HH:mm')}{' '}
                <Typography component="span" variant="body2" color="text.secondary">
                  ({lawyerTimezone})
                </Typography>
              </Typography>
              {showClientPreview && clientStart && clientEnd && (
                <Typography variant="body2" color="text.secondary">
                  Cliente ({form.clientTimezone || '—'}): {clientStart.toFormat('HH:mm')} –{' '}
                  {clientEnd.toFormat('HH:mm')}
                </Typography>
              )}
            </Box>

            {/* Type */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: 'block' }}
              >
                Tipo de cita
              </Typography>
              <ToggleButtonGroup
                value={form.type}
                exclusive
                onChange={(_, val) => {
                  if (val) setForm((f) => ({ ...f, type: val }))
                }}
                size="small"
                fullWidth
              >
                {(['IN_PERSON', 'VIDEO', 'PHONE'] as const).map((t) => (
                  <ToggleButton key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Client name */}
            <TextField
              label="Nombre del cliente"
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              error={!!errors.clientName}
              helperText={errors.clientName}
              fullWidth
              size="small"
            />

            {/* Client email */}
            <TextField
              label="Email del cliente"
              type="email"
              value={form.clientEmail}
              onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
              error={!!errors.clientEmail}
              helperText={errors.clientEmail}
              fullWidth
              size="small"
            />

            {/* Client timezone */}
            <Box>
              <TimezoneSelect
                value={form.clientTimezone}
                onChange={(tz) => setForm((f) => ({ ...f, clientTimezone: tz }))}
                error={!!errors.clientTimezone}
              />
              {errors.clientTimezone && (
                <FormHelperText error>{errors.clientTimezone}</FormHelperText>
              )}
            </Box>

            {/* Location / link (conditional) */}
            {showLocationField && (
              <TextField
                label={form.type === 'IN_PERSON' ? 'Dirección' : 'Link de videollamada'}
                value={form.locationOrLink}
                onChange={(e) => setForm((f) => ({ ...f, locationOrLink: e.target.value }))}
                fullWidth
                size="small"
              />
            )}

            {/* Notes */}
            <TextField
              label="Notas (opcional)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : 'Confirmar cita'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
