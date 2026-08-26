# Security

## Sesion
- El login guarda `token`, `tokenType`, `expiresAt` y `user` en `localStorage`, para que links externos (ej. el botón "Ver detalle completo" del correo, que abre una pestaña nueva) reutilicen la sesión activa en vez de pedir login de nuevo.
- Logout elimina la sesión local.
- Un `401` del backend dispara `credit-auth-expired` y limpia la sesión.
- El JWT expira por `JWT_EXPIRATION_MINUTES` en el backend independientemente del storage.

## Rutas
- `/login`: pública.
- `/credits`, `/credits/:id`, `/email-jobs`: protegidas por `ProtectedRoute`. Al redirigir a `/login` se guarda la ruta original para volver ahí después de autenticar.

## Reglas
- No guardar passwords ni secretos en frontend.
- No llamar Firebase, Firestore ni Mailgun desde web.
- No confiar en validación frontend como control de seguridad; backend valida todo.

## Mejora Futura
El JWT en `localStorage` es legible por cualquier script en la página; una cookie `httpOnly` lo dejaría inaccesible a JavaScript y sería el siguiente paso natural de endurecimiento. Requiere que el login emita `Set-Cookie`, CORS con `credentials: true` y protección CSRF en el backend.
