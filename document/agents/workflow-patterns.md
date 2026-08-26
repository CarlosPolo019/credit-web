# Workflow Patterns

## Research-First
Antes de editar:
1. Leer `AGENTS.md`.
2. Leer `document/module-map.md`.
3. Leer README de vista o skill local.
4. Buscar usos con `rg`.

## Cambios De Vista
Actualizar componente, servicio, README de vista y docs de dominio si cambia contrato.

## Cambios Multi-Area
Usar subagentes separados por ownership:
- auth/session
- credits UI/API
- docs/skills

El agente principal integra y valida.

