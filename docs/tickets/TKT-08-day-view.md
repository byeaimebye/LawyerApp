# TKT-08 · Vista de día seleccionado

**Épica:** 2 — Calendario
**Estado:** done
**Depende de:** TKT-07
**Estimación:** M

## Objetivo
Al seleccionar un día en el calendario, mostrar en un panel lateral o
debajo del calendario: citas ya agendadas y slots libres dentro del
horario laboral.

## Detalles técnicos
- Panel lateral (Drawer MUI) o sección debajo del calendario (Grid responsivo).
- Para el día seleccionado, calcular los slots libres en frontend:
  - Desde `workStartHour` hasta `workEndHour` del user.
  - Cada slot de 30 min como granularidad mínima.
  - Restar los rangos ocupados por citas existentes (status SCHEDULED).
- Cada cita agendada se muestra como Card con:
  - Hora (en TZ del abogado) · Cliente · Tipo · Icono por tipo.
  - Click abre el detalle (TKT-12).
- Cada slot libre es un botón "Agendar turno" → abre modal (TKT-10).
- Si el día no tiene horario laboral o ya está todo ocupado: mensaje claro.

## Criterios de aceptación
- [ ] Clickear un día muestra el panel con sus citas y slots libres.
- [ ] Los rangos ocupados no aparecen como libres.
- [ ] Un día completamente libre muestra todos los slots dentro del horario laboral.
- [ ] La conversión de fechas respeta la TZ del abogado.
- [ ] Las citas ocultan las cancelled.

## Archivos a tocar
- `frontend/src/components/DayPanel.tsx` (crear)
- `frontend/src/components/AppointmentCard.tsx` (crear)
- `frontend/src/components/FreeSlotButton.tsx` (crear)
- `frontend/src/utils/slots.ts` (crear — función `computeFreeSlots`)
- `frontend/src/pages/CalendarPage.tsx` (modificar — integrar DayPanel)

## Notas
- Lógica de `computeFreeSlots` es pura y testeable (candidata a tests).
- No implementar todavía el modal de creación ni el detalle (van en TKT-10 y TKT-12).