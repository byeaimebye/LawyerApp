# TKT-21 · README final

**Épica:** 5 — CI/CD y documentación
**Estado:** pending
**Depende de:** TKT-15, TKT-16, TKT-20
**Estimación:** M

## Objetivo
Redactar el README del repo para que cualquier persona pueda entender el
proyecto, correrlo en local y entender las decisiones técnicas.

## Detalles técnicos
El `README.md` de la raíz debe incluir:

1. **Título + descripción breve** del proyecto y el challenge.
2. **Badge de CI** de GitHub Actions.
3. **URL de la app deployada** + **credenciales de demo** (abogados del seed).
4. **Stack técnico** (frontend, backend, DB, deploy).
5. **Setup local paso a paso:**
   - Requisitos (Node 20, npm, Postgres local o Neon).
   - Clonar repo.
   - `.env` en ambos (con referencias a `.env.example`).
   - `npm install` en ambos.
   - Correr migraciones y seed.
   - Levantar backend y frontend.
6. **Scripts disponibles** (dev, build, lint, test).
7. **Modelo de datos:** link a `docs/data-model.md` + ERD simple (opcional).
8. **Estrategia de TZ:** link a `docs/timezone-strategy.md`.
9. **Arquitectura:** descripción breve + diagrama (opcional, mermaid).
10. **Decisiones técnicas y trade-offs:**
    - Por qué Vite, Express, Prisma, JWT.
    - Trade-off del Render free (cold start).
    - Simplificaciones: clientes sin login, working hours en User, soft cancel.
11. **Next steps (lo que quedó fuera):**
    - Integración con Entra ID / Azure AD.
    - Tests exhaustivos y E2E.
    - Rate limiting y refresh tokens.
    - Notificaciones (email/SMS).
    - Gestión de clientes como entidad.
    - Edición/reagendamiento de citas.
    - Tabla WorkingHours con días no laborables.
12. **Estructura del repo** (árbol de carpetas).

## Criterios de aceptación
- [ ] README renderiza correctamente en GitHub.
- [ ] Badge de CI visible y funcional.
- [ ] URL pública y credenciales demo presentes y funcionales.
- [ ] Pasos de setup local probados en una máquina limpia (o mentalmente verificados).
- [ ] Links a docs (data-model, timezone-strategy) funcionan.
- [ ] Links a tickets (opcional) funcionan.

## Archivos a tocar
- `README.md` (crear en raíz)

## Notas
- Este es el "envoltorio" de la entrega. Dedicarle tiempo: es lo primero que ve el evaluador.
- Si es posible, incluir un GIF corto del flujo (grabado con ScreenToGif o similar). Muy valorado.