# Guia De Documentacion

## README Por Vista
Cada vista activa bajo `pages/**` debe documentar:
- Estado.
- Proposito.
- Ruta y acceso.
- Fuente de verdad.
- Permisos/sesion.
- Archivos clave.
- Referencias.

## Canon
- `document/module-map.md` es el inventario principal.
- `document/overview.md` explica arquitectura.
- `document/api.md` documenta el contrato REST usado por web.
- `document/security.md` cubre sesion y permisos.

## Cambios
Cuando cambie comportamiento funcional, actualizar en el mismo commit:
1. README de la vista.
2. `document/module-map.md` si cambia ruta, estado o fuente.
3. Documento de dominio aplicable.

