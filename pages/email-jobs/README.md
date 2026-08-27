# Vista: Email Jobs

## Estado
- `active`

## Proposito
- Listar los trabajos de notificacion por correo (`EmailJob`) generados al registrar un credito.
- Permitir monitoreo de estado (`PENDING`, `PROCESSING`, `SENT`, `RETRY`, `FAILED`) y ver el error de inmediato cuando un envio falla.
- Filtrar por estado y por texto libre (cliente o destinatario).

## Ruta Y Acceso
- Ruta: `/email-jobs`
- Acceso: `ProtectedRoute` + `AdminRoute` (`app/guards/AdminRoute.jsx`) — solo `state.user.role === "ADMIN"`. Cualquier otra cuenta que entre por URL directa es redirigida a `/credits`.
- Sidebar: layout privado, item "Correos", solo visible para `ADMIN`.

## Fuente De Verdad
- Vista: `EmailJobsPage.jsx`
- Servicio: `email-jobs.service.js`
- Columnas: `email-jobs.columns.js`
- Tabla: `ui/DataTable.jsx`
- Avatar de cliente: `ui/PersonAvatar.jsx`

## Permisos
- Requiere `Authorization: Bearer <token>` **y** rol `ADMIN` — a diferencia de `/credits`, que es igual para todas las cuentas.
- El backend tambien lo exige (`SecurityConfig.hasRole("ADMIN")` sobre `/api/v1/email-jobs/**`): llamar el endpoint directo con el token de una cuenta `USER` devuelve `403`, no solo la UI lo oculta.
- Hoy la unica cuenta `ADMIN` es `900100001` (Carlos Escorcia) — ver `document/security.md`.

## Estados
- Loading en consulta.
- Empty cuando no hay correos para los filtros aplicados.
- Error para fallas de API.
- En mobile, la tabla se presenta como tarjetas con etiquetas por campo y mantiene los controles de ordenamiento disponibles arriba del listado.

## Presentacion De Errores
- Columna "Estado" muestra un `Chip` coloreado (verde `SENT`, ambar `RETRY`, rojo `FAILED`, neutro `PENDING`/`PROCESSING`).
- Cuando el estado es `FAILED` o `RETRY` y hay `lastError`, el mensaje se muestra en rojo debajo del destinatario en la misma fila (con `Tooltip` si esta truncado) — sin clicks ni modal adicional.
- En mobile, el error largo se deja envolver en varias lineas para que sea legible sin depender del hover del `Tooltip`.
- `lastError` es un solo string que el backend sobreescribe en cada intento; no hay historial por intento.

## Avatares
- `ui/PersonAvatar.jsx` muestra fotos locales para Adriana Castellano, Carlos Escorcia y Jennifer Navarro; cualquier otro nombre conserva iniciales con color estable.

## Filtros Y Orden
- `status`: uno de `PENDING`, `PROCESSING`, `SENT`, `RETRY`, `FAILED`, o vacio para todos.
- `search`: coincidencia parcial en cliente o destinatario.
- `sortBy`: `createdAt` (default) o `status`.
- `direction`: `asc` o `desc`.

## Referencias
- `document/module-map.md`
- `document/api.md`
- `credit-backend/docs/api.md` (seccion "Listar Trabajos De Correo")
