# Plan general del proyecto

## Objetivo
Entregar una app funcional de gestión de citas legales para el challenge
técnico de Tech Lead Full Stack de Fontanella SRL.

## Decisiones técnicas clave

### Stack
- **Frontend:** React + Vite + TypeScript + MUI + MUI X Date Pickers.
  Vite elegido por velocidad de setup vs Next.js. MUI porque el requerimiento
  pide explícitamente el Calendar de Material UI.
- **Backend:** Express + TypeScript + Prisma. Alineado con el JD
  (Node + Express). Prisma acelera muchísimo el modelado y migraciones.
- **DB:** Postgres en Neon. Free tier serverless, ideal para challenges.
- **Auth:** JWT con bcrypt. Simple, demostrable. Entra ID queda como
  next step documentado (reduce riesgo de no terminar).

### Monorepo simple
Dos carpetas (`/frontend`, `/backend`), cada una con su `package.json`.
Sin herramientas de monorepo (nx, turborepo) para no sumar complejidad.

### Zonas horarias
Estrategia UTC-first. Ver `timezone-strategy.md`.

### Deploy
- **Frontend → Vercel:** integración nativa con GitHub, preview deploys.
- **Backend → Render:** free tier, auto-deploy desde GitHub.
- **DB → Neon:** auto-deploy.
- **CI → GitHub Actions:** lint + build en cada PR.

### Trade-off conscientes
- Render free duerme a los 15 min: primer request tras inactividad tarda
  ~30s. Se documenta y se hace warm-up antes de la demo.
- Sin Entra ID: mencionado como next step en README.
- Clientes sin login: modelados como campos de Appointment.
- Sin tabla WorkingHours: horario laboral en dos campos del User.

## Épicas

### Épica 0 — Setup
TKT-01, TKT-02.

### Épica 1 — Autenticación
TKT-03, TKT-04, TKT-05.

### Épica 2 — Calendario (visualización)
TKT-06, TKT-07, TKT-08.

### Épica 3 — Gestión de citas
TKT-09, TKT-10, TKT-11, TKT-12.

### Épica 4 — Deploy
TKT-13, TKT-14, TKT-15.

### Épica 5 — CI/CD y documentación
TKT-16, TKT-17, TKT-21.

### Épica 6 — SUPERADMIN
TKT-18, TKT-19, TKT-20.

**TKT-18:** Autorización SUPERADMIN en backend.
- `GET /lawyers` (solo SUPERADMIN).
- `GET /appointments` requiere `lawyerId` como query param para SUPERADMIN.
- `POST /appointments` requiere `lawyerId` en body para SUPERADMIN.
- `PATCH /appointments/:id/cancel` sin restricción de ownership para SUPERADMIN.

**TKT-19:** Calendario SUPERADMIN en frontend.
- Selector de abogado (dropdown) antes del calendario.
- Calendario y DayPanel operan en la timezone del abogado seleccionado.
- Al cambiar de abogado, `selectedDay` se resetea a hoy en la nueva timezone (evita bug de desfase).

**TKT-20:** Tests de integración backend.
- Vitest + supertest contra la DB real (Neon).
- `fileParallelism: false` para aislar suites sobre DB compartida.
- `cleanDb()` scoped a `@test.com` — no destruye datos de seed de producción.
- Casos cross-timezone: round-trip UTC↔BA, rechazo near-midnight, aceptación near-end-of-day.

## Orden de ejecución
Lineal: TKT-01 → TKT-21. Cada ticket se puede mergear a main de forma
independiente (excepto dependencias explícitas documentadas en cada uno).

## Criterios de "done" del challenge
- App deployada en URL pública, accesible con credenciales demo.
- README con setup local en <10 min.
- CI verde.
- Login funcional con 2 abogados pre-cargados (distintas TZ) + 1 SUPERADMIN.
- Calendario muestra citas y slots libres en la timezone correcta.
- Creación, cancelación y detalle de citas operativos.
- Doble horario visible en citas VIDEO/PHONE.
- SUPERADMIN puede gestionar citas de cualquier abogado con timezone correcta.
- Tests de integración cubren lógica crítica de solapamiento y cross-timezone.