# Estrategia de zonas horarias

## Regla de oro
**Todo se guarda en UTC en la base de datos. La conversión ocurre únicamente
en los bordes: input del usuario y render en la UI.**

## Actores y sus TZ

- **Abogado:** tiene una TZ persistida en `User.timezone` (IANA).
- **Cliente:** no es un usuario del sistema; su TZ se guarda en cada
  `Appointment.clientTimezone` al agendar.
- **Servidor:** opera en UTC. No depende de la TZ del host.
- **Base de datos:** columnas `DateTime` almacenan UTC.

## Flujos

### Crear una cita
1. El abogado elige fecha y hora en el calendario (valores locales en su TZ).
2. El frontend convierte esos valores a UTC con luxon:
   ```ts
   DateTime.fromObject(
     { year, month, day, hour, minute },
     { zone: lawyerTimezone }
   ).toUTC().toISO();
   ```
3. Manda el ISO UTC al backend.
4. El backend valida y guarda el ISO UTC tal cual en la DB.

### Listar citas de un día
1. El frontend pide `GET /appointments?from=ISO&to=ISO` donde el rango
   está calculado como "inicio y fin del día en la TZ del abogado",
   convertido a UTC.
2. El backend filtra por UTC.
3. El frontend convierte cada `startAt` a la TZ del abogado con luxon
   para mostrar hora local.

### Mostrar doble horario en citas VIDEO/PHONE
- "Tu horario (Buenos Aires): 11:30" → `startAt` en `lawyerTimezone`.
- "Horario del cliente (London): 15:30" → `startAt` en `clientTimezone`.
- Para citas `IN_PERSON` se oculta el horario del cliente (no aplica).

### Validación de solapamiento
Se hace siempre en UTC en el backend:
```
existing.startAt < new.endAt AND existing.endAt > new.startAt
```
Esto es invariante al TZ: si dos citas se pisan en UTC, se pisan en cualquier
TZ.

## Detección de TZ del cliente
En el formulario de creación de cita, el campo "TZ del cliente" se
pre-completa con:
```ts
Intl.DateTimeFormat().resolvedOptions().timeZone
```
El abogado puede cambiarla si el cliente está en otra TZ.

## Librería
- **luxon** en frontend y backend. Uniforme, robusta con TZ IANA.
- En MUI X Date Pickers se usa `AdapterLuxon`.
- No usar `Date` nativo para operaciones de TZ ni `moment` (deprecado).

## DST (horario de verano)
luxon maneja DST automáticamente a partir del nombre IANA. Ejemplo:
`America/Argentina/Buenos_Aires` sabe que Argentina no tiene DST,
`Europe/London` sabe cuándo cambia BST/GMT.

**Nota:** no usar offsets fijos (`-03:00`, `+01:00`) para citas futuras,
porque pueden volverse inválidos si hay cambio de política horaria.
Siempre usar nombres IANA.

## Casos borde considerados
- Abogado en AR agenda cita a las 8:00. Cliente en UK ve 12:00 (o 13:00
  según DST). La UI lo muestra así sin ambigüedad.
- Si un abogado cambia su TZ (viaja), sus citas existentes no se
  recalculan automáticamente — están en UTC. La UI siempre refleja la
  TZ actual del User, lo que puede mostrarlas en un horario diferente.
  Documentado como comportamiento esperado.
- Citas que cruzan medianoche (ej. 23:30 + 120 min): el sistema las
  permite siempre que el rango caiga dentro del horario laboral.
  Para el challenge asumimos que no ocurre (working hours típicos).