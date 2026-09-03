# Vista: Credits

## Estado
- `active`

## Proposito
- Registrar creditos.
- Consultar creditos activos.
- Filtrar por cliente, documento y comercial.
- Ordenar por fecha o monto.
- Ver el detalle de un credito, editarlo, eliminarlo y exportarlo a PDF.

## Ruta Y Acceso
- Rutas: `/credits` (listado) y `/credits/:id` (detalle).
- Acceso: `ProtectedRoute`.
- Sidebar: layout privado.
- Cada fila de la tabla navega a `/credits/:id` pasando el credito en `location.state` para pintar el detalle sin repetir `GET /credits/{id}`.
- La accion "Editar" navega a `/credits/:id?edit=1` con el mismo `location.state` y abre el formulario desde el detalle. Si se entra directo por URL, refresh o enlace de correo, el detalle hace el `GET /credits/{id}` como fallback.
- El copiloto puede abrir el formulario con `/credits?nuevo=1` y aplicar filtros via query (`clientName`, `clientDocument`, `salesperson`, `sortBy`, `direction`).
- El correo de "nuevo credito registrado" tambien enlaza a `/credits/:id`.

## Fuente De Verdad
- Vista listado: `CreditsPage.jsx`
- Vista detalle: `CreditDetailPage.jsx`
- Formulario (crear y editar): `CreditForm.jsx`
- Confirmacion: `CreditConfirmDialog.jsx`
- Exportacion PDF: descarga `GET /api/v1/credits/{id}/pdf` (generado en `credit-backend`, mismo endpoint que usa `credit-mobile`)
- Servicio: `credits.service.js`
- Columnas: `credits.columns.js`
- Tabla: `ui/DataTable.jsx`

## Permisos
- Requiere `Authorization: Bearer <token>`.
- El backend decide fecha oficial, validaciones finales y visibilidad de activos.

## Estados
- Loading en consulta.
- Empty cuando no hay registros: un retrato SVG + una frase (`ui/EmptyState.jsx`).
- Error para fallas de API (se muestra en la pagina y, si el modal de registro esta abierto, tambien dentro del modal).
- Success al registrar credito.
- En mobile, el listado reutiliza la misma fuente de datos pero presenta cada fila como tarjeta con etiquetas por campo y controles de ordenamiento visibles arriba de las tarjetas.
- Paginacion: `CreditsPage.jsx` trae todos los creditos que matchean los filtros y pagina en el cliente (el backend no tiene `page`/`size` todavia) — 10 por pagina en escritorio, 5 en mobile (mismo breakpoint de 800px que cambia la tabla a tarjetas). El pie de `DataTable` muestra el total real (no el de la pagina actual) y el control de paginacion de MUI cuando hay mas de una pagina. Cambiar de filtro u orden vuelve a la pagina 1.

## Confirmacion De Registro
- Al enviar el formulario no se crea el credito directamente: se valida localmente, se pide la cuota/total estimados a `POST /api/v1/credits/estimate` (mismo calculo que usa el backend para `CreditResponse` y el PDF — no hay formula duplicada en el frontend), y se abre `CreditConfirmDialog.jsx` con un resumen (cliente, cedula, comercial, valor, tasa, plazo, cuota/total).
- El calculo es solo informativo para el operador; `POST /credits/estimate` no guarda nada.
- El operador puede "Revisar datos" (vuelve al formulario sin perder lo escrito) o "Confirmar y registrar" (dispara el `POST /api/v1/credits` real).

## Autocomplete De Cliente (Solo Al Crear)
- El campo "Cedula o ID" en modo `create` es un MUI `Autocomplete` (`freeSolo`) sobre `listClients()` (`GET /api/v1/clients`, traido una vez al abrir el formulario) — filtra localmente por cedula mientras se tipea, sin ida y vuelta al backend por tecla.
- Si la cedula matchea un cliente existente: los 4 campos de nombre se autocompletan y quedan deshabilitados (solo lectura, sin edicion desde este flujo). Si se borra o cambia la cedula despues, vuelve a modo "no encontrado".
- Si no matchea ningun cliente: los campos de nombre quedan vacios y editables, igual que el comportamiento anterior.
- En modo `edit` no hay autocomplete — el cliente del credito ya esta identificado, los campos son editables directo como siempre.
- El backend sincroniza `clients` en cada `POST`/`PUT /api/v1/credits` (`ClientService.upsert`), asi que el autocomplete queda al dia sin importar si el operador lo uso o tipeo todo de cero.

## Validaciones
- La cedula o ID del cliente es el primer campo del formulario (identifica al cliente antes de pedir el nombre) y solo acepta digitos.
- El registro separa primer nombre, segundo nombre, primer apellido y segundo apellido.
- Primer nombre, primer apellido, cedula, valor, tasa y plazo son obligatorios.
- Limites numericos (`lib/creditValidation.js#creditLimits`, espejo de `CreditLimits` en `credit-backend`): valor hasta `$200.000.000`, tasa de interes mensual entre `0.5%` y `3.5%`, plazo entre `1` y `60` meses. `CreditForm.jsx` muestra cada limite como texto de ayuda debajo del campo correspondiente.
- El comercial se toma del usuario autenticado; no se muestra ni es editable en el formulario porque ya esta implicito en la sesion. Solo aparece como referencia en el resumen de `CreditConfirmDialog.jsx`.

## Detalle, Edicion Y Borrado
- La columna "Opciones" de la tabla (`CreditsPage.jsx`) da acceso directo a ver, editar y eliminar. Ver y editar navegan al detalle pasando el registro seleccionado en `location.state`; eliminar se confirma desde el listado.
- "Editar" abre `CreditForm.jsx` en modo `edit` dentro del detalle (mismo formulario y confirmacion que el registro, con copy ajustado) y guarda con `PUT /api/v1/credits/{id}`. El comercial original no cambia.
- "Eliminar" pide confirmacion en `DeleteCreditDialog.jsx` (compartido entre listado y detalle) y llama a `DELETE /api/v1/credits/{id}`.
- "Exportar PDF" (solo en el detalle) descarga el certificado que genera `credit-backend` (mismo estilo de marca, mismo endpoint que usa `credit-mobile`) — no hay generacion de PDF en el cliente.
- El detalle tambien muestra "Historial de cambios" (`CreditAuditHistory.jsx`, `GET /api/v1/credits/{id}/audit`): quien edito o elimino el credito, cuando, y que campos cambiaron (antes/despues). Se recarga despues de cada edicion.
- Los dialogos de crear/editar pasan a pantalla completa en telefonos para evitar campos comprimidos; en escritorio conservan el modal centrado.

## Avatares
- `ui/PersonAvatar.jsx` muestra fotos locales para Adriana Castellano, Carlos Escorcia y Jennifer Navarro; cualquier otro nombre conserva iniciales con color estable.

## Referencias
- `document/module-map.md`
- `document/api.md`
- `.codex/skills/credits-management/SKILL.md`
- `.codex/skills/datatable-credit/SKILL.md`
