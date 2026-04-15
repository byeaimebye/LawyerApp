# Fontanella — Gestión de citas legales

Sistema de gestión de citas para abogados con soporte multi-zona horaria.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + MUI v5 + React Query |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL (Neon en producción) |
| Auth | JWT + bcrypt |
| Fechas / TZ | Luxon (front y back) |

---

## Requisitos previos

- **Node.js** v18 o superior (`node -v` para verificar)
- **npm** v9 o superior
- Una base de datos PostgreSQL accesible (ver opciones abajo)

---

## Configuración inicial

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd LawyerApp
```

### 2. Configurar variables de entorno

**Backend:**

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:

```env
DATABASE_URL=<cadena de conexión PostgreSQL>
JWT_SECRET=<string secreto, mínimo 32 caracteres>
CORS_ORIGIN=http://localhost:5173
PORT=3001
```

**Frontend:**

```bash
cp frontend/.env.example frontend/.env
```

El archivo por defecto ya apunta al backend local, no requiere cambios para desarrollo:

```env
VITE_API_URL=http://localhost:3001
```

### 3. Opciones de base de datos

#### Opción A — Neon (recomendada, sin instalar nada)

1. Crear cuenta gratuita en [neon.tech](https://neon.tech)
2. Crear un proyecto nuevo
3. Copiar la cadena de conexión (pooled) en `DATABASE_URL`

#### Opción B — PostgreSQL local con Docker

```bash
docker run --name fontanella-db \
  -e POSTGRES_USER=fontanella \
  -e POSTGRES_PASSWORD=fontanella \
  -e POSTGRES_DB=fontanella \
  -p 5432:5432 \
  -d postgres:16
```

`DATABASE_URL` para esta opción:

```
DATABASE_URL=postgresql://fontanella:fontanella@localhost:5432/fontanella
```

---

## Instalación de dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## Migraciones y seed

Desde la carpeta `backend/`:

```bash
# Aplicar el schema a la base de datos
npx prisma migrate deploy

# (Alternativa en desarrollo — crea migraciones nuevas si el schema cambió)
npx prisma migrate dev

# Cargar datos de prueba
npx prisma db seed
```

El seed crea dos abogados de prueba:

| Nombre | Email | Contraseña | Timezone | Horario |
|---|---|---|---|---|
| Ana García | ana@fontanella.com | demo1234 | America/Argentina/Buenos_Aires | 08:00–18:00 |
| John Smith | john@fontanella.com | demo1234 | Europe/London | 09:00–17:00 |

---

## Levantar el proyecto

Abrir **dos terminales**:

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
# Servidor en http://localhost:3001
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
# App en http://localhost:5173
```

Abrir el navegador en `http://localhost:5173` e iniciar sesión con cualquiera de los usuarios del seed.

---

## Estructura del proyecto

```
LawyerApp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos de datos
│   │   └── seed.ts             # Datos de prueba
│   └── src/
│       ├── lib/                # prisma client, jwt
│       ├── middleware/         # requireAuth
│       ├── routes/             # auth, appointments
│       ├── schemas/            # validación zod
│       ├── services/           # lógica de negocio
│       └── utils/              # workingHours, overlap
└── frontend/
    └── src/
        ├── components/         # AppointmentCard, Calendar, DayPanel, modales
        ├── contexts/           # AuthContext
        ├── hooks/              # useAppointments, useCreateAppointment, useCancelAppointment
        ├── lib/                # axios instance + funciones de API
        ├── pages/              # LoginPage, CalendarPage
        └── utils/              # slots (lógica de disponibilidad)
```

---

## Endpoints disponibles

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/login` | No | Login, devuelve JWT |
| GET | `/appointments` | Sí | Listar citas por rango de fecha |
| POST | `/appointments` | Sí | Crear cita (45 min fijos) |
| PATCH | `/appointments/:id/cancel` | Sí | Cancelar cita (soft delete) |

### Reglas de negocio clave

- Las citas tienen duración fija de **45 minutos**.
- No se pueden crear citas en el pasado ni fuera del horario laboral del abogado.
- El backend valida solapamiento en UTC antes de insertar.
- Cancelación es soft (cambia `status` a `CANCELLED`, no elimina el registro).

---

## Scripts útiles

```bash
# Backend
npm run dev          # Servidor con hot-reload (tsx watch)
npm run build        # Compilar TypeScript
npm run lint         # ESLint
npx prisma db seed   # Cargar datos de prueba
npx prisma studio    # GUI para explorar la base de datos

# Frontend
npm run dev          # Vite dev server
npm run build        # Build de producción
npm run lint         # ESLint
```

---

## Variables de entorno — referencia completa

### backend/.env

| Variable | Requerida | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Sí | Secret para firmar tokens JWT |
| `CORS_ORIGIN` | No | Origen permitido (default: `http://localhost:5173`) |
| `PORT` | No | Puerto del servidor (default: `3001`) |

### frontend/.env

| Variable | Requerida | Descripción |
|---|---|---|
| `VITE_API_URL` | No | URL base del backend (default: `http://localhost:3001`) |

---

## Próximos pasos (fuera del scope del MVP)

- Detalle de cita (TKT-12)
- Deploy: Neon + Render + Vercel (TKT-13/14/15)
- CI con GitHub Actions (TKT-16)
- OAuth / Entra ID para autenticación empresarial
- Notificaciones por email al agendar/cancelar
- Reagendamiento de citas
