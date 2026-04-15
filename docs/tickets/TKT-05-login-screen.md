# TKT-05 · Pantalla de login (frontend)

**Épica:** 1 — Autenticación
**Estado:** pending
**Depende de:** TKT-03
**Estimación:** M

## Objetivo
Implementar la pantalla de login, guardar el JWT y proteger las rutas
privadas.

## Detalles técnicos
- Setup de React Router con rutas: `/login`, `/calendar` (protegida).
- Componente `LoginPage` con form MUI (email, password, botón submit).
- Llama `POST /auth/login` vía axios.
- Guarda `token` y `user` en `localStorage` bajo claves `fontanella_token` y `fontanella_user`.
- `AuthContext` que expone `user`, `token`, `login()`, `logout()`.
- `ProtectedRoute` que redirige a `/login` si no hay token.
- Axios interceptor que agrega `Authorization: Bearer <token>` a todas las requests.
- Interceptor de response que si recibe 401 ejecuta logout + redirect.
- Navbar con nombre del abogado y botón "Cerrar sesión".

## Criterios de aceptación
- [ ] Login con credenciales del seed redirige a `/calendar`.
- [ ] Credenciales inválidas muestran mensaje de error MUI (Snackbar o Alert).
- [ ] Acceder a `/calendar` sin token redirige a `/login`.
- [ ] Botón "Cerrar sesión" borra token y redirige a `/login`.
- [ ] Recargar la página mantiene la sesión mientras el token no expiró.

## Archivos a tocar
- `frontend/src/App.tsx` (modificar — setup de router)
- `frontend/src/pages/LoginPage.tsx` (crear)
- `frontend/src/pages/CalendarPage.tsx` (crear — placeholder, se llena en TKT-07)
- `frontend/src/contexts/AuthContext.tsx` (crear)
- `frontend/src/components/ProtectedRoute.tsx` (crear)
- `frontend/src/components/AppNavbar.tsx` (crear)
- `frontend/src/lib/api.ts` (crear — instancia de axios con interceptores)

## Notas
- No implementar "recordarme" ni recuperación de password.
- UI limpia pero sin obsesionarse — es un challenge.