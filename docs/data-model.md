# Modelo de datos

## Entidades

### User
Representa a un abogado o a un administrador del sistema.

| Campo          | Tipo          | Notas                                                    |
|----------------|---------------|----------------------------------------------------------|
| id             | UUID (PK)     |                                                          |
| email          | String UNIQUE |                                                          |
| passwordHash   | String        | bcrypt                                                   |
| name           | String        |                                                          |
| role           | Enum          | `LAWYER` \| `SUPERADMIN`                                 |
| timezone       | String        | IANA, ej. `America/Argentina/Buenos_Aires`               |
| workStartHour  | Int           | 0–23, ej. 8 (SUPERADMIN: 0)                              |
| workEndHour    | Int           | 0–23, ej. 18 (SUPERADMIN: 24)                            |
| createdAt      | DateTime      |                                                          |

**Roles:**
- `LAWYER`: abogado. Gestiona sus propias citas. El calendario opera en su timezone.
- `SUPERADMIN`: administrador. Puede ver y gestionar citas de cualquier abogado. Requiere seleccionar un abogado antes de operar; siempre opera en la timezone del abogado activo, nunca en la propia.

### Appointment
Representa una cita. El cliente NO es un usuario del sistema — se
guardan sus datos directamente acá.

| Campo            | Tipo           | Notas                                            |
|------------------|----------------|--------------------------------------------------|
| id               | UUID (PK)      |                                                  |
| lawyerId         | UUID (FK→User) |                                                  |
| clientName       | String         |                                                  |
| clientEmail      | String         |                                                  |
| clientTimezone   | String         | IANA                                             |
| type             | Enum           | `IN_PERSON` \| `VIDEO` \| `PHONE`                |
| startAt          | DateTime       | **UTC**                                          |
| endAt            | DateTime       | **UTC**                                          |
| durationMinutes  | Int            | 30 \| 60 \| 120                                  |
| status           | Enum           | `SCHEDULED` \| `CANCELLED`, default SCHEDULED    |
| locationOrLink   | String?        | Dirección (presencial) o link (video)            |
| notes            | String?        |                                                  |
| createdAt        | DateTime       |                                                  |

**Índice:** `(lawyerId, startAt, endAt)` — acelera la consulta de
solapamiento y el listado por rango.

## Relaciones

```
User (1) ──────── (N) Appointment
       lawyerId
```

Un abogado tiene muchas citas. Una cita pertenece a un único abogado.

## Invariantes / reglas de negocio

1. `endAt = startAt + durationMinutes`.
2. `durationMinutes ∈ {30, 60, 120}`.
3. Ninguna cita `SCHEDULED` de un mismo abogado se solapa en el tiempo.
4. `startAt` y `endAt` caen dentro de `[workStartHour, workEndHour]` del abogado (en su TZ).
5. No se permite crear citas en el pasado.

## Query de solapamiento (core del TKT-09)

```sql
SELECT 1
FROM "Appointment"
WHERE "lawyerId" = :lawyerId
  AND "status" = 'SCHEDULED'
  AND "startAt" < :newEndAt
  AND "endAt" > :newStartAt
LIMIT 1;
```

Si devuelve un registro → conflicto → 409.

## Schema Prisma (preview)

```prisma
model User {
  id             String        @id @default(uuid())
  email          String        @unique
  passwordHash   String
  name           String
  role           Role          @default(LAWYER)
  timezone       String
  workStartHour  Int           @default(8)
  workEndHour    Int           @default(18)
  createdAt      DateTime      @default(now())
  appointments   Appointment[]
}

model Appointment {
  id              String            @id @default(uuid())
  lawyerId        String
  lawyer          User              @relation(fields: [lawyerId], references: [id])
  clientName      String
  clientEmail     String
  clientTimezone  String
  type            AppointmentType
  startAt         DateTime
  endAt           DateTime
  durationMinutes Int
  status          AppointmentStatus @default(SCHEDULED)
  locationOrLink  String?
  notes           String?
  createdAt       DateTime          @default(now())

  @@index([lawyerId, startAt, endAt])
}

enum Role             { LAWYER SUPERADMIN }
enum AppointmentType  { IN_PERSON VIDEO PHONE }
enum AppointmentStatus { SCHEDULED CANCELLED }
```