import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import { DateTime } from 'luxon'
import { AppNavbar } from '../components/AppNavbar'
import { Calendar } from '../components/Calendar'
import { DayPanel } from '../components/DayPanel'
import { CreateAppointmentModal } from '../components/CreateAppointmentModal'
import { AppointmentDetailModal } from '../components/AppointmentDetailModal'
import { FreeSlot } from '../utils/slots'
import { Appointment, Lawyer } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useLawyers } from '../hooks/useLawyers'

export function CalendarPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const timezone = user?.timezone ?? 'UTC'

  const [selectedDay, setSelectedDay] = useState<DateTime>(() =>
    DateTime.now().setZone(timezone).startOf('day'),
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<FreeSlot | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null)

  const { data: lawyers = [], isLoading: lawyersLoading } = useLawyers()

  useEffect(() => {
    if (isSuperAdmin && lawyers.length > 0 && selectedLawyer === null) {
      setSelectedLawyer(lawyers[0])
    }
  }, [isSuperAdmin, lawyers, selectedLawyer])

  function handleSlotClick(slot: FreeSlot) {
    setSelectedSlot(slot)
    setModalOpen(true)
  }

  function handleAppointmentClick(appointment: Appointment) {
    setSelectedAppointment(appointment)
  }

  const lawyerOverride = isSuperAdmin && selectedLawyer
    ? {
        id: selectedLawyer.id,
        timezone: selectedLawyer.timezone,
        workStartHour: selectedLawyer.workStartHour,
        workEndHour: selectedLawyer.workEndHour,
      }
    : undefined

  const activeTimezone = lawyerOverride?.timezone ?? timezone

  return (
    <>
      <AppNavbar />
      <Box sx={{ p: 3 }}>
        {isSuperAdmin && (
          <Box sx={{ mb: 3, maxWidth: 400 }}>
            {lawyersLoading ? (
              <CircularProgress size={24} />
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel>Abogado</InputLabel>
                <Select
                  value={selectedLawyer?.id ?? ''}
                  label="Abogado"
                  onChange={(e) => {
                    const found = lawyers.find((l) => l.id === e.target.value) ?? null
                    setSelectedLawyer(found)
                  }}
                >
                  {lawyers.map((lawyer) => (
                    <MenuItem key={lawyer.id} value={lawyer.id}>
                      {lawyer.name} — {lawyer.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={5} lg={4}>
            <Calendar selectedDay={selectedDay} onDaySelect={setSelectedDay} />
          </Grid>
          <Grid item xs={12} md={7} lg={8}>
            <DayPanel
              day={selectedDay}
              onSlotClick={handleSlotClick}
              onAppointmentClick={handleAppointmentClick}
              lawyerOverride={lawyerOverride}
            />
          </Grid>
        </Grid>
      </Box>

      <CreateAppointmentModal
        open={modalOpen}
        slot={selectedSlot}
        lawyerId={isSuperAdmin ? (selectedLawyer?.id ?? undefined) : undefined}
        onClose={() => setModalOpen(false)}
      />

      <AppointmentDetailModal
        appointment={selectedAppointment}
        lawyerTimezone={activeTimezone}
        onClose={() => setSelectedAppointment(null)}
      />
    </>
  )
}
