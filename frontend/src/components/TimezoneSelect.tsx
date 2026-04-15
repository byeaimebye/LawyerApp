import { Autocomplete, TextField } from '@mui/material'

const TIMEZONES: string[] = Intl.supportedValuesOf('timeZone')

interface TimezoneSelectProps {
  value: string
  onChange: (tz: string) => void
  error?: boolean
  helperText?: string
}

export function TimezoneSelect({ value, onChange, error, helperText }: TimezoneSelectProps) {
  return (
    <Autocomplete
      options={TIMEZONES}
      value={value || null}
      onChange={(_, newValue) => onChange(newValue ?? '')}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Zona horaria del cliente"
          error={error}
          helperText={helperText}
        />
      )}
    />
  )
}
