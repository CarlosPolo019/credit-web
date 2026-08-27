# Security

## Sesion
- El login guarda `token`, `tokenType`, `expiresAt` y `user` en `localStorage`, para que links externos (ej. el botón "Ver detalle completo" del correo, que abre una pestaña nueva) reutilicen la sesión activa en vez de pedir login de nuevo.
- Logout elimina la sesión local.
- Un `401` del backend dispara `credit-auth-expired` y limpia la sesión.
- El JWT expira por `JWT_EXPIRATION_MINUTES` en el backend independientemente del storage.

## Rutas
- `/login`: pública.
- `/credits`, `/credits/:id`: protegidas por `ProtectedRoute`. Al redirigir a `/login` se guarda la ruta original para volver ahí después de autenticar.
- `/email-jobs`, `/clients`: protegidas por `ProtectedRoute` **y** `AdminRoute` (`app/guards/AdminRoute.jsx`) — solo `state.user.role === "ADMIN"`. Cualquier otra cuenta autenticada que entre por URL directa es redirigida a `/credits`, sin mensaje de error (no es un intento de acceso hostil esperado, solo navegación fuera de su alcance).

## Roles
- `state.user.role` viene del backend (`AppUser.role`, viaja en el JWT) — `"ADMIN"` o `"USER"`. Hoy solo la cuenta `900100001` (Carlos Escorcia) es `ADMIN`; el resto (incluyendo cuentas nuevas por `/register`) son `USER`.
- El rol solo restringe Correos y Clientes (oculto en `DashboardLayout`, bloqueado por `AdminRoute`). Crear/editar/eliminar créditos es igual para todas las cuentas — no hay distinción de rol ahí.
- El frontend oculta/redirige por rol, pero **no es el control real**: `/api/v1/email-jobs/**` también exige `ADMIN` en el backend (`SecurityConfig.hasRole("ADMIN")`, 403 JSON si no) — llamar la API directo con un token de cuenta `USER` falla igual. `/api/v1/clients` no exige rol en el backend a propósito: lo usa el autocomplete del formulario de créditos, que usan todas las cuentas.

## Reglas
- No guardar passwords ni secretos en frontend.
- No llamar Firebase, Firestore ni Mailgun desde web.
- No confiar en validación frontend como control de seguridad; backend valida todo.

## Mejora Futura
El JWT en `localStorage` es legible por cualquier script en la página; una cookie `httpOnly` lo dejaría inaccesible a JavaScript y sería el siguiente paso natural de endurecimiento. Requiere que el login emita `Set-Cookie`, CORS con `credentials: true` y protección CSRF en el backend.
