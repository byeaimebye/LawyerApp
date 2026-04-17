# TKT-19 · SUPERADMIN: vista de calendario con lawyer picker

**Épica:** 6 — SUPERADMIN
**Estado:** pending
**Depende de:** TKT-18
**Estimación:** M

## Objetivo
Permitir que el SUPERADMIN vea el calendario de cualquier abogado
usando un selector simple en la CalendarPage, y que pueda crear
y cancelar citas en nombre del abogado seleccionado.

## Detalles técnicos

### api.ts
- Agregar interfaz `Lawyer { id, name, email, timezone, workStartHour, workEndHour }`.
- Agregar función `getLawyers(): Promise<Lawyer[]>` que llama a `GET /lawyers`.
- Actualizar `getAppointments` para aceptar `lawyerId?: string` y pasarlo como
  query param cuando se provea.
- Actualizar `CreateAppointmentPayload` para incluir `lawyerId?: string`.

### useLawyers.ts (nuevo hook)
- `useQuery` sobre `getLawyers()`, queryKey `['lawyers']`.
- Solo se usa cuando `user.role === 'SUPERADMIN'`.

### useAppointments.ts
- Aceptar segundo parámetro opcional `lawyerId?: string`.
- Incluirlo en `queryKey` y pasarlo a `getAppointments`.

### DayPanel.tsx
- Aceptar prop opcional `lawyerOverride?: { id: string, timezone: string, workStartHour: number, workEndHour: number }`.
- Si presente, usarlo en lugar de los valores de `useAuth()`.
- Pasar `lawyerOverride.id` a `useAppointments` como lawyerId.

### CalendarPage.tsx
- Si `user.role === 'SUPERADMIN'`:
  - Llamar a `useLawyers()`.
  - Mostrar un MUI `Select` encima del calendario con la lista de abogados.
  - Estado `selectedLawyer: Lawyer | null` (default: primer abogado de la lista).
  - Pasar `selectedLawyer` como `lawyerOverride` a `DayPanel`.
  - Pasar `selectedLawyer?.id` como `lawyerId` a `CreateAppointmentModal`.
- Si `user.role === 'LAWYER'`: comportamiento actual sin cambios.

### CreateAppointmentModal.tsx
- Aceptar prop opcional `lawyerId?: string`.
- Pasarlo en el payload de `createAppointment` cuando esté definido.

## Criterios de aceptación
- [ ] SUPERADMIN ve un selector de abogado encima del calendario.
- [ ] Al cambiar el abogado seleccionado, el calendario muestra sus citas.
- [ ] La TZ del calendario corresponde a la del abogado seleccionado.
- [ ] SUPERADMIN puede crear citas para el abogado seleccionado.
- [ ] SUPERADMIN puede cancelar cualquier cita desde el modal de detalle.
- [ ] La vista del LAWYER no cambió en absoluto.

## Archivos a tocar
- `frontend/src/lib/api.ts`
- `frontend/src/hooks/useLawyers.ts` (crear)
- `frontend/src/hooks/useAppointments.ts`
- `frontend/src/components/DayPanel.tsx`
- `frontend/src/pages/CalendarPage.tsx`
- `frontend/src/components/CreateAppointmentModal.tsx`

## Notas
- El Select de abogados solo renderiza si `user.role === 'SUPERADMIN'`.
- Mientras carga la lista de abogados, mostrar un CircularProgress o
  deshabilitar el Select.
- No mostrar al SUPERADMIN en la lista del picker (el endpoint ya lo filtra).
