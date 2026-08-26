# Security

## Sesion
- El login guarda `token`, `tokenType`, `expiresAt` y `user` en `localStorage` (antes `sessionStorage`; se cambio porque el boton "Ver detalle completo" del correo abre una pestaña nueva sin acceso al `sessionStorage` de la pestaña donde el operador ya inicio sesion, y quedaba pidiendo login de nuevo).
- Logout elimina la sesion local.
- Un `401` del backend dispara `credit-auth-expired` y limpia la sesion.
- Tradeoff aceptado: `localStorage` persiste entre reinicios del navegador y esta accesible desde cualquier pestaña del mismo origen (mayor superficie si hay XSS) a cambio de que los links externos (correo) puedan reusar la sesion activa. El JWT igual expira por `JWT_EXPIRATION_MINUTES` en el backend.

## Rutas
- `/login`: publica.
- `/credits`: protegida por `ProtectedRoute`.

## Reglas
- No guardar passwords ni secretos en frontend.
- No llamar Firebase, Firestore ni Mailgun desde web.
- No confiar en validacion frontend como control de seguridad; backend valida todo.

## Mejora Futura: Cookie httpOnly
Dado que este es un dominio de creditos, el nivel correcto de verdad es que el JWT viva en una cookie `httpOnly` (JS nunca puede leerla, inmune a robo por XSS) en vez de `localStorage`/`sessionStorage` (ambas leibles por cualquier script en la pagina). No se implemento en esta prueba tecnica porque requiere tocar login/CORS (`credentials: true`, origen exacto) y agregar proteccion CSRF en el backend, y cambiar eso a mitad de sesion sin poder validarlo con calma es mas riesgoso que el beneficio inmediato. Decision explicita del usuario: `localStorage` por ahora, cookie httpOnly como mejora pendiente.

