# Vista: Email Jobs

## Estado
- `active`

## Proposito
- Listar los trabajos de notificacion por correo (`EmailJob`) generados al registrar un credito.
- Permitir monitoreo de estado (`PENDING`, `PROCESSING`, `SENT`, `RETRY`, `FAILED`) y ver el error de inmediato cuando un envio falla.
- Filtrar por estado y por texto libre (cliente o destinatario).

## Ruta Y Acceso
- Ruta: `/email-jobs`
- Acceso: `ProtectedRoute`.
- Sidebar: layout privado, item "Correos".

## Fuente De Verdad
- Vista: `EmailJobsPage.jsx`
- Servicio: `email-jobs.service.js`
- Columnas: `email-jobs.columns.js`
- Tabla: `ui/DataTable.jsx`
- Avatar de cliente: `ui/PersonAvatar.jsx`

## Permisos
- Requiere `Authorization: Bearer <token>`.
- No hay distincion de rol; cualquier usuario autenticado puede consultarla, igual que `/credits`.

## Estados
- Loading en consulta.
- Empty cuando no hay correos para los filtros aplicados.
- Error para fallas de API.

## Presentacion De Errores
- Columna "Estado" muestra un `Chip` coloreado (verde `SENT`, ambar `RETRY`, rojo `FAILED`, neutro `PENDING`/`PROCESSING`).
- Cuando el estado es `FAILED` o `RETRY` y hay `lastError`, el mensaje se muestra en rojo debajo del destinatario en la misma fila (con `Tooltip` si esta truncado) — sin clicks ni modal adicional.
- `lastError` es un solo string que el backend sobreescribe en cada intento; no hay historial por intento.

## Filtros Y Orden
- `status`: uno de `PENDING`, `PROCESSING`, `SENT`, `RETRY`, `FAILED`, o vacio para todos.
- `search`: coincidencia parcial en cliente o destinatario.
- `sortBy`: `createdAt` (default) o `status`.
- `direction`: `asc` o `desc`.

## Referencias
- `document/module-map.md`
- `document/api.md`
- `credit-backend/docs/api.md` (seccion "Listar Trabajos De Correo")
