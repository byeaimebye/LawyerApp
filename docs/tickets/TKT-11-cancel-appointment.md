# TKT-11 · Cancelar cita

**Épica:** 3 — Gestión de citas
**Estado:** pending
**Depende de:** TKT-09
**Estimación:** S

## Objetivo
Permitir cancelar una cita (soft cancel, no delete) vía endpoint y
botón en la UI.

## Detalles técnicos
- Backend: `PATCH /appointments/:id/cancel`.
  - Protegido con `requireAuth`.
  - Verifica que la cita pertenezca al abogado logueado → si no, 403.
  - Si `status = CANCELLED` → 409.
  - Si está en el pasado → 400 (no tiene sentido cancelar algo ya ocurrido).
  - Cambia `status = CANCELLED`, devuelve 200 + cita.
- Frontend: botón "Cancelar cita" en el detalle (TKT-12) o en el AppointmentCard.
  - Confirm dialog MUI antes de ejecutar.
  - Invalida la query de citas al éxito.

## Criterios de aceptación
- [ ] Endpoint cancela cita propia correctamente.
- [ ] Cita cancelada libera el slot (validado por TKT-09 al intentar solapar).
- [ ] Endpoint responde 403 al intentar cancelar cita ajena.
- [ ] UI pide confirmación antes de cancelar.
- [ ] Al cancelar, el calendario y el DayPanel se refrescan.

## Archivos a tocar
- `backend/src/routes/appointments.ts` (modificar)
- `backend/src/services/appointmentsService.ts` (modificar — `cancel`)
- `frontend/src/hooks/useCancelAppointment.ts` (crear)
- `frontend/src/lib/api.ts` (modificar)
- `frontend/src/components/AppointmentDetailModal.tsx` (modificar — ver TKT-12)

## Notas
- Soft cancel en lugar de delete para preservar historial.
- No implementar reagendamiento: el flujo es cancelar + crear nueva.