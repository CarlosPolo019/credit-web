# Vista: Clients

## Estado
- `active`

## Proposito
- Directorio de solo lectura: cedula + nombre completo de todos los clientes.
- No hay crear/editar/eliminar cliente desde esta vista — los clientes se derivan automaticamente al registrar/editar creditos (`ClientService.upsert` en el backend).

## Ruta Y Acceso
- Ruta: `/clients`.
- Acceso: `ProtectedRoute` + `AdminRoute` (`app/guards/AdminRoute.jsx`) — solo cuentas con `state.user.role === "ADMIN"` (hoy, unicamente Carlos Escorcia). Cualquier otra cuenta que entre por URL directa es redirigida a `/credits`.
- Sidebar: solo visible para `ADMIN` (`app/layouts/DashboardLayout.jsx`).
- El endpoint que consume (`GET /api/v1/clients`) NO exige rol en el backend — lo usa tambien el autocomplete de cedula del formulario de creditos, que usan todas las cuentas. El permiso de admin es solo de esta vista/ruta, no del dato.

## Fuente De Verdad
- Vista: `ClientsPage.jsx`.
- Columnas: `clients.columns.js`.
- Servicio: `listClients()` en `../credits/credits.service.js` (compartido con el autocomplete del formulario de creditos, mismo endpoint).
- Tabla: `ui/DataTable.jsx` (sin `onSortChange` — no hay ordenamiento clicable en esta vista, solo el filtro de texto local).

## Estados
- Loading al cargar.
- Empty cuando no hay clientes: un retrato SVG + una frase (`ui/EmptyState.jsx`).
- Error para fallas de API.
- Filtro de texto (cedula o nombre) es 100% en el cliente — el dataset es chico, no hay filtros server-side.
- Paginado en el cliente, 6 por pagina (`DataTable` `totalCount`/`page`/`pageCount`/`onPageChange`, mismo patron que `CreditsPage`). Escribir en el filtro vuelve a la pagina 1.

## Referencias
- `document/module-map.md`
- `document/security.md` (roles/permisos)
