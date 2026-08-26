# Testing

## Comandos
```bash
npm run lint
npm test
npm run build
```

## JavaScript-Only
Comprobar que no hay TypeScript propio:
```bash
find . -path './node_modules' -prune -o -path './dist' -prune -o -name '*.ts' -o -name '*.tsx' -print
```

## Cobertura Esperada
- Validacion de formulario de creditos.
- Login y persistencia de token.
- Limpieza de sesion por `401`.
- Registro de credito.
- Listado con filtros y ordenamiento.
- Estados loading, empty, error y success.

