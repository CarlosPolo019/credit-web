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
- Cada fila de la tabla navega a `/credits/:id`; el correo de "nuevo credito registrado" tambien enlaza ahi.

## Fuente De Verdad
- Vista listado: `CreditsPage.jsx`
- Vista detalle: `CreditDetailPage.jsx`
- Formulario (crear y editar): `CreditForm.jsx`
- Confirmacion: `CreditConfirmDialog.jsx`
- Exportacion PDF: `creditPdf.js` (jsPDF, un solo archivo)
- Servicio: `credits.service.js`
- Columnas: `credits.columns.js`
- Tabla: `ui/DataTable.jsx`

## Permisos
- Requiere `Authorization: Bearer <token>`.
- El backend decide fecha oficial, validaciones finales y visibilidad de activos.

## Estados
- Loading en consulta.
- Empty cuando no hay registros.
- Error para fallas de API (se muestra en la pagina y, si el modal de registro esta abierto, tambien dentro del modal).
- Success al registrar credito.

## Confirmacion De Registro
- Al enviar el formulario no se llama a la API directamente: se valida y se abre `CreditConfirmDialog.jsx` con un resumen (cliente, cedula, comercial, valor, tasa, plazo) y una cuota/total estimados (`lib/creditPayment.js`, amortizacion francesa con tasa mensual).
- El calculo es solo informativo para el operador; el backend no lo recibe ni lo almacena.
- El operador puede "Revisar datos" (vuelve al formulario sin perder lo escrito) o "Confirmar y registrar" (dispara el `POST /api/v1/credits` real).

## Validaciones
- La cedula o ID del cliente es el primer campo del formulario (identifica al cliente antes de pedir el nombre) y solo acepta digitos.
- El registro separa primer nombre, segundo nombre, primer apellido y segundo apellido.
- Primer nombre, primer apellido, cedula, valor, tasa y plazo son obligatorios.
- El comercial se toma del usuario autenticado; no se muestra ni es editable en el formulario porque ya esta implicito en la sesion. Solo aparece como referencia en el resumen de `CreditConfirmDialog.jsx`.

## Detalle, Edicion Y Borrado
- La columna "Opciones" de la tabla (`CreditsPage.jsx`) da acceso directo a ver, editar y eliminar sin salir del listado; el detalle completo vive en `/credits/:id` (`CreditDetailPage.jsx`, `GET /api/v1/credits/{id}`).
- "Editar" reabre `CreditForm.jsx` en modo `edit` (mismo formulario y confirmacion que el registro, con copy ajustado) y guarda con `PUT /api/v1/credits/{id}`. El comercial original no cambia.
- "Eliminar" pide confirmacion en `DeleteCreditDialog.jsx` (compartido entre listado y detalle) y llama a `DELETE /api/v1/credits/{id}`.
- "Exportar PDF" (solo en el detalle) genera un certificado de una pagina con el mismo estilo de marca (verde `#00d280`, tinta `#052224`, logo) via `creditPdf.js` (jsPDF), 100% en el cliente.

## Referencias
- `document/module-map.md`
- `document/api.md`
- `.codex/skills/credits-management/SKILL.md`
- `.codex/skills/datatable-credit/SKILL.md`
