# Fontanella — Gestión de citas legales

[![CI](https://github.com/byeaimebye/LawyerApp/actions/workflows/ci.yml/badge.svg)](https://github.com/byeaimebye/LawyerApp/actions/workflows/ci.yml)

Sistema de gestión de citas legales entre abogados y clientes, con soporte multi-país y multi-zona horaria. Challenge técnico para Tech Lead.

**App en producción:** [https://lawyer-app-alpha.vercel.app](https://lawyer-app-alpha.vercel.app/)

---

## Credenciales demo

| Rol        | Email                | Contraseña | Zona horaria           |
|------------|----------------------|------------|------------------------|
| Abogado    | ana@fontanella.com   | demo1234   | América/Buenos Aires   |
| Abogado    | john@fontanella.com  | demo1234   | Europa/Londres         |
| SuperAdmin | admin@fontanella.com | demo1234   | UTC                    |

> El SuperAdmin puede ver y gestionar las citas de cualquier abogado desde un único calendario con selector de abogado.

---

## Stack técnico

| Capa          | Tecnología                                                                  |
|---------------|-----------------------------------------------------------------------------|
| Frontend      | React 18 + Vite + TypeScript + MUI v5 + MUI X Date Pickers (luxon adapter) |
| Backend       | Node 20 + Express 4 + TypeScript + Zod                                      |
| ORM           | Prisma 5                                                                    |
| Base de datos | PostgreSQL (Neon en prod)                                                   |
| Auth          | JWT + bcrypt                                                                |
| Fechas / TZ   | luxon (frontend y backend)                                                  |
| Tests         | Vitest + supertest (integración, backend)                                   |
| Deploy        | Vercel (front) + Render (back) + Neon (db)                                  |
| CI            | GitHub Actions                                                              |

---

## Setup local

### Requisitos

- Node 20+ (`node -v` para verificar)
- npm 10+
- PostgreSQL accesible: cuenta gratuita en [Neon](https://neon.tech) **o** Docker local

### 1. Clonar el repositorio

```bash
git clone https://github.com/byeaimebye/LawyerApp.git
cd LawyerApp
```

### 2. Configurar variables de entorno

**Backend:**

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:

```env
# Cadena de conexión PostgreSQL (Neon o local)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Generar con: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
JWT_SECRET=

# Origen permitido por CORS (dev: dejar así)
CORS_ORIGIN=http://localhost:5173

PORT=3001
```

**Frontend:**

```bash
cp frontend/.env.example frontend/.env
```

En desarrollo no requiere cambios (`VITE_API_URL=http://localhost:3001` es el valor por defecto).

#### Opción A — Neon (sin instalar nada)

1. Crear cuenta gratuita en [neon.tech](https://neon.tech)
2. Crear un proyecto y copiar la cadena de conexión (pooled) en `DATABASE_URL`

#### Opción B — PostgreSQL local con Docker

```bash
docker run --name fontanella-db \
  -e POSTGRES_USER=fontanella \
  -e POSTGRES_PASSWORD=fontanella \
  -e POSTGRES_DB=fontanella \
  -p 5432:5432 \
  -d postgres:16
```

```env
DATABASE_URL=postgresql://fontanella:fontanella@localhost:5432/fontanella
```

### 3. Instalar dependencias

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Migraciones y seed

```bash
cd backend
npx prisma migrate deploy     # aplica todas las migraciones
npx prisma db seed            # crea 2 abogados + 1 superadmin demo
```

### 5. Levantar la app

```bash
# Terminal 1 — backend
cd backend && npm run dev      # http://localhost:3001

# Terminal 2 — frontend
cd frontend && npm run dev     # http://localhost:5173
```

---

## Scripts disponibles

### Backend (`/backend`)

| Script              | Descripción                                      |
|---------------------|--------------------------------------------------|
| `npm run dev`       | Servidor en modo watch (tsx)                     |
| `npm run build`     | Compilar TypeScript → `dist/`                    |
| `npm start`         | Iniciar desde `dist/` (producción)               |
| `npm run lint`      | ESLint                                           |
| `npm test`          | Tests de integración contra la DB real (Vitest)  |
| `npm run test:watch`| Tests en modo watch                              |

### Frontend (`/frontend`)

| Script              | Descripción                                      |
|---------------------|--------------------------------------------------|
| `npm run dev`       | Vite dev server (HMR)                            |
| `npm run build`     | Build de producción (`tsc` + Vite)               |
| `npm run preview`   | Previsualizar el build de producción             |
| `npm run lint`      | ESLint                                           |

---

## Modelo de datos

Ver [`docs/data-model.md`](docs/data-model.md) para descripción completa de entidades, campos, invariantes y el query de solapamiento.

```
User (1) ──────── (N) Appointment
         lawyerId
```

- **`User`** — abogado o superadmin. Tiene timezone IANA (`America/Argentina/Buenos_Aires`, `Europe/London`, etc.) y horario laboral (`workStartHour`, `workEndHour`).
- **`Appointment`** — cita entre abogado y cliente. Almacena `clientTimezone` para mostrar doble horario en citas `VIDEO` / `PHONE`.

---

## Estrategia de zonas horarias

Ver [`docs/timezone-strategy.md`](docs/timezone-strategy.md) para el detalle completo.

**Regla de oro:** todo se guarda en UTC en la DB. La conversión ocurre únicamente en los bordes (input del usuario y render en la UI) usando luxon.

**Flujo resumido:**

1. El abogado elige hora en su zona horaria local (visible en el calendario).
2. El frontend convierte a UTC con luxon antes de enviar al backend.
3. El backend valida en la timezone del abogado y persiste en UTC.
4. El frontend convierte de vuelta a la timezone del abogado al mostrar.

**Caso especial — SuperAdmin:** opera siempre en la timezone del abogado activo. El calendario se reinicia a "hoy" en la zona del abogado seleccionado cada vez que se cambia de abogado, evitando el bug de desfase de día cuando el Admin (UTC) gestiona un abogado en otro huso horario.

---

## Arquitectura

```
┌─────────────────────────────────────┐
│           Vercel (Frontend)         │
│    React + Vite + MUI + luxon       │
│                                     │
│  CalendarPage → Calendar            │
│              → DayPanel             │
│              → CreateAppointment    │
│              → AppointmentDetail    │
└──────────────────┬──────────────────┘
                   │ HTTPS / REST
                   │ JWT en Authorization header
┌──────────────────▼──────────────────┐
│           Render (Backend)          │
│    Express + Prisma + Zod + luxon   │
│                                     │
│  POST   /auth/login                 │
│  GET    /appointments               │
│  POST   /appointments               │
│  PATCH  /appointments/:id/cancel    │
│  GET    /lawyers  (SUPERADMIN only) │
└──────────────────┬──────────────────┘
                   │ TLS (Neon pooler)
┌──────────────────▼──────────────────┐
│         Neon (PostgreSQL)           │
│    User · Appointment               │
└─────────────────────────────────────┘
```

### Flujo de autenticación

1. `POST /auth/login` → devuelve JWT con `{ userId, email, role, timezone }`.
2. El frontend guarda el token en `localStorage` y lo adjunta en `Authorization: Bearer <token>` en cada request.
3. El middleware `authenticate` verifica la firma y expone `req.user` al handler.

---

## Decisiones técnicas y trade-offs

### Por qué Vite
Build instantáneo con HMR real. Para un challenge donde la iteración rápida importa, la configuración de Webpack sería overhead innecesario. El build genera un bundle estático que Vercel sirve desde CDN.

### Por qué Express (sin framework opinado)
La API tiene 5 endpoints, validación con Zod y lógica concentrada en `appointmentsService.ts`. Un framework más pesado (NestJS, Fastify con plugins) hubiera añadido complejidad sin aportar nada en este scope.

### Por qué Prisma
Migraciones declarativas, tipado end-to-end desde el schema y `prisma generate` que funciona en CI sin DB real. Alternativa considerada: Drizzle (más ligero, pero DX más rugosa en TypeScript estricto).

### Por qué JWT stateless
Sin estado en servidor: adecuado para Render free tier (instancias sin shared memory). Trade-off: no hay revocación inmediata de tokens → mitigado con `exp` de 24 h.

### Render free tier — cold start
El backend duerme tras 15 min de inactividad. El primer request tras el sueño puede tardar ~30 s. En producción real se usaría el paid tier o un cron de ping. Limitación conocida y aceptada para el challenge.

### Simplificaciones aceptadas

| Simplificación | Razón |
|----------------|-------|
| Clientes sin login | Sus datos se guardan directamente en `Appointment`; suficiente para el MVP |
| `workStartHour`/`workEndHour` en `User` | Evita la complejidad de una tabla `WorkingHours` separada |
| Cancelación soft (`status=CANCELLED`) | Preserva historial; el hard delete depende del marco legal del cliente |
| JWT sin refresh token | Reduce complejidad; sesiones de 24 h son aceptables para el challenge |
| Tests de integración solo en backend | La lógica crítica (solapamiento, horarios, timezones) vive en el backend; el frontend se cubre con prueba manual |

---

## Próximos pasos (fuera del scope del challenge)

- **Autenticación empresarial** — Integración con Entra ID / Azure AD.
- **Tests exhaustivos y E2E** — Suite completa con Playwright o Cypress.
- **Rate limiting y refresh tokens** — `express-rate-limit` + token rotation.
- **Notificaciones** — Email (SendGrid/Resend) y SMS (Twilio) para confirmaciones y recordatorios.
- **Clientes como entidad** — Tabla `Client` con historial y búsqueda.
- **Reagendamiento** — `PATCH /appointments/:id/reschedule` con validación de solapamiento.
- **Tabla `WorkingHours`** — Días no laborables, feriados y horarios por día de semana.
- **Roles granulares** — Secretaria que agenda en nombre de múltiples abogados.

---

## Estructura del repositorio

```
LawyerApp/
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI: lint + build (frontend y backend)
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Migraciones Prisma
│   │   ├── schema.prisma           # Modelo de datos
│   │   └── seed.ts                 # 2 abogados + 1 superadmin demo
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── appointments.test.ts           # Tests LAWYER
│   │   │   ├── appointments.superadmin.test.ts # Tests SUPERADMIN + cross-timezone
│   │   │   ├── setup.ts                       # Helpers: cleanDb, seed, tokenFor
│   │   │   └── globalTeardown.ts              # Limpieza post-suite
│   │   ├── lib/                    # prisma.ts, jwt.ts
│   │   ├── middleware/             # authenticate.ts
│   │   ├── routes/                 # appointments.ts, auth.ts, users.ts
│   │   ├── schemas/                # Validación Zod
│   │   ├── services/               # appointmentsService.ts (lógica de negocio)
│   │   ├── app.ts                  # Express app (sin listen — para tests)
│   │   └── index.ts                # Entrypoint (listen)
│   ├── .env.example
│   ├── package.json
│   └── vitest.config.ts
├── docs/
│   ├── data-model.md               # Modelo de datos detallado
│   ├── time-zone-strategy.md       # Estrategia de zonas horarias
│   ├── plan.md                     # Plan de trabajo por épicas
│   └── tickets/                    # TKT-01 → TKT-21
├── frontend/
│   ├── src/
│   │   ├── components/             # Calendar, DayPanel, Modals, Navbar…
│   │   ├── contexts/               # AuthContext
│   │   ├── hooks/                  # useAppointments, useLawyers
│   │   ├── lib/                    # api.ts (axios + tipos)
│   │   ├── pages/                  # CalendarPage, LoginPage
│   │   └── utils/                  # slots.ts (generación de slots libres)
│   ├── .env.example
│   └── package.json
└── README.md
```
