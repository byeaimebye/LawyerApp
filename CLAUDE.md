# Proyecto: Fontanella — Gestión de citas legales

## Contexto
Challenge técnico para Tech Lead. Sistema de gestión de citas legales
entre abogados y clientes, con soporte multi-país y multi-zona horaria.
Prioridad: entregar MVP funcional, deployable y defendible en entrevista.
NO sobre-arquitecturar.

## Stack
- Frontend: React + Vite + MUI + MUI X Date Pickers (luxon adapter)
- Backend: Node + Express + Prisma + TypeScript
- DB: Postgres (Neon en prod, local con Docker opcional)
- Auth: JWT + bcrypt
- TZ: luxon en front y back
- Deploy: Vercel (front) + Render (back) + Neon (db)

## Estructura
- /frontend → app React
- /backend → API Express
- Monorepo simple, cada app con su package.json

## Reglas de código
- TypeScript estricto en ambos lados
- Nada de `any`
- Fechas siempre en UTC en DB, conversión a TZ local solo en bordes (UI e input)
- Validación de solapamiento de citas en backend, no solo en front
- Variables de entorno, nunca hardcodear URLs ni secrets
- Errores del backend devuelven JSON { error: string, code?: string }

## Modelo de datos
[
User

id            UUID  PK
email         String UNIQUE
passwordHash  String
name          String
role          Enum('LAWYER')        // dejamos el enum por extensibilidad
timezone      String                 // IANA, ej: "America/Argentina/Buenos_Aires"
workStartHour Int                    // ej: 8
workEndHour   Int                    // ej: 18
createdAt     DateTime

Appointment

id              UUID  PK
lawyerId        UUID  FK → User.id
clientName      String
clientEmail     String
clientTimezone  String                 // IANA, se pide al agendar
type            Enum('IN_PERSON','VIDEO','PHONE')
startAt         DateTime (UTC)
endAt           DateTime (UTC)
durationMinutes Int                   // 30 | 60 | 120
status          Enum('SCHEDULED','CANCELLED')  default SCHEDULED
locationOrLink  String?               // dirección o link de video
notes           String?
createdAt       DateTime

INDEX (lawyerId, startAt, endAt)
]

## Estrategia TZ
[pegás la sección de TZ del plan]

## Convenciones
- Commits: conventional commits (feat:, fix:, chore:, docs:)
- Branches: feat/TKT-XX-descripcion
- PRs: referencian el ticket en el título
- No mergear sin CI verde

## Lo que NO hacemos en este challenge
- Entra ID / OAuth (queda como next step en README)
- Clientes como entidad (son campos en Appointment)
- Tabla WorkingHours (campos en User)
- Tests exhaustivos (solo lógica crítica de solapamiento)
- Notificaciones / emails
- Reagendar (solo crear y cancelar)