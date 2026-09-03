# Security

## Sesion
- El login guarda `token`, `tokenType`, `expiresAt` y `user` en `localStorage`, para que links externos (ej. el botón "Ver detalle completo" del correo, que abre una pestaña nueva) reutilicen la sesión activa en vez de pedir login de nuevo.
- Logout elimina la sesión local.
- Un `401` del backend dispara `credit-auth-expired` y limpia la sesión.
- El JWT expira por `JWT_EXPIRATION_MINUTES` en el backend independientemente del storage.

## Rutas
- `/login`: pública.
- `/credits`, `/credits/:id`: protegidas por `ProtectedRoute`. Al redirigir a `/login` se guarda la ruta original para volver ahí después de autenticar.
- `/email-jobs`, `/clients`, `/users`, `/dashboard`: protegidas por `ProtectedRoute` **y** `AdminRoute` (`app/guards/AdminRoute.jsx`) — solo `state.user.role === "ADMIN"`. Cualquier otra cuenta autenticada que entre por URL directa es redirigida a `/credits`, sin mensaje de error (no es un intento de acceso hostil esperado, solo navegación fuera de su alcance).

## Roles
- `state.user.role` viene del backend (`AppUser.role`, viaja en el JWT) — `"ADMIN"` o `"USER"`. Hoy solo la cuenta `900100001` (Carlos Escorcia) es `ADMIN`; el resto (incluyendo cuentas creadas desde `/users`, salvo que un admin elija `ADMIN` explícitamente) son `USER`.
- El rol solo restringe Dashboard, Correos, Clientes y Usuarios (oculto en `DashboardLayout`, bloqueado por `AdminRoute`). Crear/editar/eliminar créditos es igual para todas las cuentas — no hay distinción de rol ahí.
- `/dashboard` no llama ningún endpoint nuevo: agrega en el cliente los mismos datos que ya devuelven `GET /api/v1/credits` y `GET /api/v1/email-jobs`, protegidos solo por `AdminRoute` en el frontend igual que el resto de esas dos rutas cuando se navegan directamente. No hay dato adicional expuesto que esos dos endpoints no expongan ya.
- El frontend oculta/redirige por rol, pero **no es el control real**: `/api/v1/email-jobs/**` y `/api/v1/users` (`POST`) exigen `ADMIN` en el backend (`SecurityConfig.hasRole("ADMIN")`, 403 JSON si no) — llamar cualquiera de las dos APIs directo con un token de cuenta `USER` falla igual. `/api/v1/clients` no exige rol en el backend a propósito: lo usa el autocomplete del formulario de créditos, que usan todas las cuentas.
- No existe `POST /api/v1/auth/register`. No hay auto-registro público. El copiloto nunca debe sugerir ese path.

## Crear Usuarios De Prueba (`/users`)
- `POST /api/v1/users` es el único alta de cuentas: admin-only, con Bearer JWT. Devuelve `{ document, fullName, role }` sin token, así que no pisa la sesión del admin.
- `/api/v1/users` sigue el mismo patrón que `/api/v1/email-jobs/**`: `SecurityConfig.hasRole("ADMIN")` antes de llegar al controller.
- El body acepta `role` (opcional, default `"USER"`). Solo un admin autenticado puede mandarlo.
- `pages/users/users.service.js` usa `request()` con auth por defecto. Sin endpoint de listado, la vista solo recuerda lo creado en la sesión de navegador actual.

## Copiloto (Lesson Dock)
- Vive en el shell autenticado (`DashboardLayout`), no tiene ruta propia ni endpoint de chat.
- Reutiliza el JWT de `localStorage` vía `api/client.js`. Un `401` en estimate/list limpia la sesión igual que el resto del panel.
- La marca de “primera lección vista” está en `localStorage` (`credit-web-lesson-beats`): no es un secreto, solo recuerda que el dock ya enseñó y debe quedar colapsado.
- Navega a rutas admin solo si `state.user.role === "ADMIN"`; si no, explica el límite y no redirige.

## Reglas
- No guardar passwords ni secretos en frontend.
- No llamar Firebase, Firestore ni Mailgun desde web.
- No confiar en validación frontend como control de seguridad; backend valida todo.

## Mejora Futura
El JWT en `localStorage` es legible por cualquier script en la página; una cookie `httpOnly` lo dejaría inaccesible a JavaScript y sería el siguiente paso natural de endurecimiento. Requiere que el login emita `Set-Cookie`, CORS con `credentials: true` y protección CSRF en el backend.
