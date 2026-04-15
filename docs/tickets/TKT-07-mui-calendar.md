# TKT-07 · Calendario MUI

**Épica:** 2 — Calendario
**Estado:** pending
**Depende de:** TKT-05, TKT-06
**Estimación:** M

## Objetivo
Renderizar el calendario MUI X con marcadores en los días que tienen
citas del abogado logueado.

## Detalles técnicos
- Usar `<DateCalendar />` de `@mui/x-date-pickers`.
- `LocalizationProvider` con `AdapterLuxon`.
- Timezone del adapter configurada con la TZ del abogado (`user.timezone`).
- Fetch de citas del mes visible con react-query: `GET /appointments?from=...&to=...`.
- Custom `slots.day` que renderiza un `<Badge />` con un dot en días con citas.
- Cambio de mes dispara nueva request (usar `onMonthChange`).
- Estado seleccionado: día clickeado → guardar en `useState`, pasar a TKT-08.

## Criterios de aceptación
- [ ] Calendario se renderiza con la fecha actual.
- [ ] Días con citas muestran un indicador visual.
- [ ] Al cambiar de mes, se recargan las citas.
- [ ] Al clickear un día, se dispara un callback con la fecha seleccionada.
- [ ] Las fechas se manejan en la TZ del abogado (no UTC ni local del browser).

## Archivos a tocar
- `frontend/src/pages/CalendarPage.tsx` (modificar — reemplazar placeholder)
- `frontend/src/components/Calendar.tsx` (crear — wrapper de DateCalendar)
- `frontend/src/components/DayWithBadge.tsx` (crear — slot custom)
- `frontend/src/hooks/useAppointments.ts` (crear — react-query hook)
- `frontend/src/lib/api.ts` (modificar — agregar `getAppointments`)

## Notas
- No implementar todavía la vista de detalle del día (va en TKT-08).
- No soportar múltiples vistas (semana/día): solo el DateCalendar.