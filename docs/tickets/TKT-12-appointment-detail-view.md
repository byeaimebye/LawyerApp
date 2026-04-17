# TKT-12 · Vista de detalle de cita

**Épica:** 3 — Gestión de citas
**Estado:** done
**Depende de:** TKT-08, TKT-11
**Estimación:** M

## Objetivo
Al clickear una cita en el DayPanel, mostrar un modal con todos sus
detalles incluyendo doble horario (abogado y cliente) y botón cancelar.

## Detalles técnicos
- Modal MUI (Dialog).
- Muestra:
  - Tipo (con ícono) y estado.
  - **Tu horario ({lawyerTZ}):** fecha + hora inicio – hora fin.
  - **Horario del cliente ({clientTZ}):** fecha + hora inicio – hora fin. *Solo para VIDEO/PHONE.*
  - Cliente: nombre, email, TZ.
  - Ubicación / link (si aplica).
  - Notas.
- Botón "Cancelar cita" (hook de TKT-11) con confirm dialog.
- Si la cita ya está cancelada: mostrar estado y ocultar botón.

## Criterios de aceptación
- [ ] Clickear una cita abre el modal con todos sus datos.
- [ ] Citas VIDEO/PHONE muestran doble horario correctamente convertido.
- [ ] Citas IN_PERSON no muestran horario del cliente.
- [ ] Botón cancelar funciona y refresca el calendario.
- [ ] Citas cancelled no muestran el botón.

## Archivos a tocar
- `frontend/src/components/AppointmentDetailModal.tsx` (crear)
- `frontend/src/components/AppointmentCard.tsx` (modificar — trigger del modal)
- `frontend/src/utils/formatDateTime.ts` (crear — helpers luxon)

## Notas
- Formato de fechas: usar luxon con `toLocaleString(DateTime.DATETIME_MED)` o similar.
- No implementar edición: solo lectura + cancelar.