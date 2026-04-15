# TKT-10 · Modal de creación de cita

**Épica:** 3 — Gestión de citas
**Estado:** pending
**Depende de:** TKT-08, TKT-09
**Estimación:** L

## Objetivo
Permitir al abogado crear una cita desde un slot libre mediante un modal
MUI, con preview en vivo del horario del cliente.

## Detalles técnicos
- Modal MUI (Dialog) abierto al clickear un slot libre (viene con la hora pre-seleccionada).
- Campos:
  - **Hora de inicio** (no editable si viene del slot, o editable con TimePicker).
  - **Duración** (Select: 30 / 60 / 120 minutos).
  - **Tipo** (ToggleButtonGroup: Presencial / Videollamada / Telefónica).
  - **Nombre del cliente** (TextField).
  - **Email del cliente** (TextField, validado).
  - **Zona horaria del cliente** (Autocomplete con lista IANA, pre-completado con `Intl.DateTimeFormat().resolvedOptions().timeZone`).
  - **Ubicación / link** (TextField condicional: visible solo para IN_PERSON o VIDEO).
  - **Notas** (TextField multiline, opcional).
- **Preview en vivo** mostrando:
  - "Tu horario ({lawyerTZ}): HH:mm"
  - "Horario del cliente ({clientTZ}): HH:mm" (solo para VIDEO/PHONE)
- Submit llama `POST /appointments` con el ISO UTC de `startAt`.
- Manejar errores de backend (409 solapamiento, 422 horario, etc.) con Snackbar.
- Al éxito: cerrar modal + invalidar query de citas (react-query) para refrescar.

## Criterios de aceptación
- [ ] Desde un slot libre se abre el modal con la hora pre-seleccionada.
- [ ] La validación client-side bloquea submit si faltan campos requeridos.
- [ ] El preview de doble horario se actualiza en vivo al cambiar TZ del cliente.
- [ ] Error 409 del backend muestra mensaje "Slot no disponible".
- [ ] Éxito cierra modal y refresca el calendario/DayPanel.
- [ ] Campos condicionales (location/link) se muestran/ocultan según el tipo.

## Archivos a tocar
- `frontend/src/components/CreateAppointmentModal.tsx` (crear)
- `frontend/src/components/TimezoneSelect.tsx` (crear — Autocomplete IANA)
- `frontend/src/hooks/useCreateAppointment.ts` (crear — react-query mutation)
- `frontend/src/lib/api.ts` (modificar — agregar `createAppointment`)
- `frontend/src/components/DayPanel.tsx` (modificar — trigger del modal)

## Notas
- Lista de IANA timezones: usar `Intl.supportedValuesOf('timeZone')` (moderno, sin libs extra).
- No permitir editar la fecha, solo la hora: el día viene fijo desde el DayPanel.