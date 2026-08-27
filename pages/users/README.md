# Vista: Users

## Estado
- `active`

## Proposito
- Le da al `ADMIN` una forma de crear cuentas de prueba desde la UI — tipicamente `USER` (comerciales), pero tambien `ADMIN` si de verdad hace falta otro admin.
- No hay editar/eliminar/listar cuentas existentes desde esta vista — el backend no expone esos endpoints hoy. Solo "crear" y "ver lo que se creo en esta sesion de navegador".

## Ruta Y Acceso
- Ruta: `/users`.
- Acceso: `ProtectedRoute` + `AdminRoute` (`app/guards/AdminRoute.jsx`) — solo cuentas con `state.user.role === "ADMIN"`. Cualquier otra cuenta que entre por URL directa es redirigida a `/credits`.
- Sidebar: solo visible para `ADMIN` (`app/layouts/DashboardLayout.jsx`).

## Fuente De Verdad
- Vista: `UsersPage.jsx`.
- Servicio: `createUser()` en `users.service.js`.

## Como Funciona (y por que)
- `createUser()` llama `POST /api/v1/users` — un endpoint dedicado y nuevo en credit-backend (`UserController`/`UserService`), **no** el `POST /api/v1/auth/register` publico que ya existia para auto-registro (ese sigue exactamente igual que siempre: publico, sin token, `role: "USER"` fijo — esta vista no lo toca).
- `/api/v1/users` esta protegido en `SecurityConfig` con `hasRole("ADMIN")`, el mismo patron que ya se usaba para `/api/v1/email-jobs/**` — Spring Security exige un Bearer token valido de una cuenta `ADMIN` antes de que el request llegue siquiera al controller. No hay logica condicional de "si viene token de admin, si no..." en el backend: o el caller es admin autenticado, o el request nunca entra.
- `users.service.js` no hace nada especial para mandar el token — `request()` de `api/client.js` lo agrega automaticamente como siempre (comportamiento default, sin `auth: false`). Como esta vista solo es alcanzable siendo `ADMIN` (`AdminRoute`), ese token siempre es el del admin logueado.
- **Por que no hay riesgo de pisar la sesion del admin**: a diferencia de `/api/v1/auth/register` (que devuelve un `LoginResponse` completo — token + user — porque esta pensado para auto-registro, "crear cuenta = quedar logueado"), `/api/v1/users` devuelve solo `{ document, fullName, role }` (`UserResponse` en el backend), sin token. No emite sesion para la cuenta creada porque no es un login, es una accion administrativa sobre la cuenta de otra persona. No hay nada con forma de sesion que pasar por `AuthContext.login()` por accidente — el problema que existia en un diseño anterior de esta misma tarea (llamar `/register` con el token del admin y tener que evitar activamente que la respuesta pisara la sesion) no aplica aca.
- Sin endpoint de "listar usuarios", no hay forma de mostrar un directorio real despues de recargar la pagina. La vista guarda las cuentas creadas en estado de React (memoria del navegador, se pierde al refrescar) y muestra la contraseña en texto plano una sola vez, justo despues de crearla — es la unica oportunidad de verla, porque el backend solo guarda el hash.
- El selector de rol en el formulario tiene `USER` como default (el caso de uso pedido: comerciales de prueba); `ADMIN` esta disponible pero es una eleccion explicita, no la default.

## Estados
- Error inline si falla la creacion (ej. `409` "La cédula ya está registrada").
- Lista de "cuentas creadas en esta sesión" solo aparece si se creo al menos una.

## Referencias
- `document/module-map.md`
- `document/security.md` (roles/permisos, seccion de `/api/v1/users` vs. `/api/v1/auth/register`)
