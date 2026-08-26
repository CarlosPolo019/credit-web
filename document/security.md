# Security

## Sesion
- El login guarda `token`, `tokenType`, `expiresAt` y `user` en `sessionStorage`.
- Logout elimina la sesion local.
- Un `401` del backend dispara `credit-auth-expired` y limpia la sesion.

## Rutas
- `/login`: publica.
- `/credits`: protegida por `ProtectedRoute`.

## Reglas
- No guardar passwords ni secretos en frontend.
- No almacenar JWT en `localStorage`.
- No llamar Firebase, Firestore ni Mailgun desde web.
- No confiar en validacion frontend como control de seguridad; backend valida todo.

