import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { FreeSlot } from '../utils/slots'

interface FreeSlotButtonProps {
  slot: FreeSlot
  onClick: (slot: FreeSlot) => void
}

export function FreeSlotButton({ slot, onClick }: FreeSlotButtonProps) {
  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<AddIcon />}
      onClick={() => onClick(slot)}
      fullWidth
      sx={{ mb: 1, justifyContent: 'flex-start' }}
    >
      {slot.start.toFormat('HH:mm')} – {slot.end.toFormat('HH:mm')} · Agendar turno
    </Button>
  )
}
