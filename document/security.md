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
- `state.user.role` viene del backend (`AppUser.role`, viaja en el JWT) — `"ADMIN"` o `"USER"`. Hoy solo la cuenta `900100001` (Carlos Escorcia) es `ADMIN`; el resto (incluyendo cuentas nuevas por auto-registro o por `/users`, salvo que un admin elija `ADMIN` explícitamente) son `USER`.
- El rol solo restringe Dashboard, Correos, Clientes y Usuarios (oculto en `DashboardLayout`, bloqueado por `AdminRoute`). Crear/editar/eliminar créditos es igual para todas las cuentas — no hay distinción de rol ahí.
- `/dashboard` no llama ningún endpoint nuevo: agrega en el cliente los mismos datos que ya devuelven `GET /api/v1/credits` y `GET /api/v1/email-jobs`, protegidos solo por `AdminRoute` en el frontend igual que el resto de esas dos rutas cuando se navegan directamente. No hay dato adicional expuesto que esos dos endpoints no expongan ya.
- El frontend oculta/redirige por rol, pero **no es el control real**: `/api/v1/email-jobs/**` y `/api/v1/users` (`POST`) exigen `ADMIN` en el backend (`SecurityConfig.hasRole("ADMIN")`, 403 JSON si no) — llamar cualquiera de las dos APIs directo con un token de cuenta `USER` falla igual. `/api/v1/clients` no exige rol en el backend a propósito: lo usa el autocomplete del formulario de créditos, que usan todas las cuentas. `/api/v1/auth/register` sigue siendo público (`permitAll`) y sin cambios — no está relacionado con `/users`.

## Crear Usuarios De Prueba (`/users`)
- `POST /api/v1/users` (`UserController`/`UserService` en credit-backend) es un endpoint **separado y nuevo**, no una variante de `/api/v1/auth/register`. `/api/v1/auth/register` no se tocó: sigue público, sin token, siempre crea `role: "USER"`, exactamente igual que antes de esta funcionalidad.
- `/api/v1/users` sigue el mismo patrón que ya existía para rutas admin-only: `SecurityConfig` lo protege con `.requestMatchers(HttpMethod.POST, "/api/v1/users").hasRole("ADMIN")`, igual que `/api/v1/email-jobs/**`. Spring Security exige un Bearer token válido de una cuenta `ADMIN` **antes** de que el request llegue al controller — no hay una rama "si viene token de admin, honrar `role`; si no, ignorarlo" dentro del código de negocio (esa fue una versión anterior descartada de este mismo diseño); simplemente, si no sos admin autenticado, el request nunca entra. `UserService.create` no vuelve a comprobar el rol del caller porque para cuando se ejecuta, Spring Security ya lo garantizó.
- El body acepta `role` (opcional, default `"USER"` en `UserService` si no viene) — como el endpoint entero ya es admin-only, no hay riesgo de que alguien se auto-otorgue `ADMIN`: solo un admin ya autenticado puede llegar a mandar ese campo.
- `pages/users/users.service.js` no hace nada especial para el token — `request()` de `api/client.js` lo agrega automáticamente (comportamiento default, sin `auth: false`); como `/users` (la vista) solo es alcanzable siendo `ADMIN` (`AdminRoute`), ese token siempre es el del admin logueado.
- **Por qué no hay riesgo de pisar la sesión del admin**: a diferencia de `/api/v1/auth/register` (que devuelve `LoginResponse` — token + user — porque está pensado para auto-registro, "crear cuenta = quedar logueado"), `/api/v1/users` devuelve solo `{ document, fullName, role }` (`UserResponse`), sin token. No emite sesión para la cuenta creada porque esto no es un login, es una acción administrativa sobre la cuenta de otra persona. No existe ninguna respuesta con forma de sesión que pudiera terminar, por accidente, en `AuthContext.login()`/`auth.storage.js`.
- Sin endpoint de listado, `/users` (la vista) no puede mostrar un directorio persistente — solo lo creado en la sesión de navegador actual, y la contraseña se muestra en texto plano una única vez (el backend solo guarda el hash).

## Reglas
- No guardar passwords ni secretos en frontend.
- No llamar Firebase, Firestore ni Mailgun desde web.
- No confiar en validación frontend como control de seguridad; backend valida todo.

## Mejora Futura
El JWT en `localStorage` es legible por cualquier script en la página; una cookie `httpOnly` lo dejaría inaccesible a JavaScript y sería el siguiente paso natural de endurecimiento. Requiere que el login emita `Set-Cookie`, CORS con `credentials: true` y protección CSRF en el backend.
