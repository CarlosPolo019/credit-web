# Vista: Credits

## Estado
- `active`

## Proposito
- Registrar creditos.
- Consultar creditos activos.
- Filtrar por cliente, documento y comercial.
- Ordenar por fecha o monto.

## Ruta Y Acceso
- Ruta: `/credits`
- Acceso: `ProtectedRoute`.
- Sidebar: layout privado.

## Fuente De Verdad
- Vista: `CreditsPage.jsx`
- Formulario: `CreditForm.jsx`
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

## Referencias
- `document/module-map.md`
- `document/api.md`
- `.codex/skills/credits-management/SKILL.md`
- `.codex/skills/datatable-credit/SKILL.md`
