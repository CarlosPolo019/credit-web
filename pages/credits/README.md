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
- Error para fallas de API.
- Success al registrar credito.

## Validaciones
- La cedula o ID del cliente solo acepta digitos.
- El registro separa primer nombre, segundo nombre, primer apellido y segundo apellido.
- Primer nombre, primer apellido, cedula, valor, tasa, plazo y comercial son obligatorios.

## Referencias
- `document/module-map.md`
- `document/api.md`
- `.codex/skills/credits-management/SKILL.md`
- `.codex/skills/datatable-credit/SKILL.md`
