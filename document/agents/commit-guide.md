# Commit Guide

## Reglas
- Repositorio independiente: Git se inicializa dentro de `credit-web`.
- Usar Conventional Commits.
- No versionar `.env`, `dist/` ni `node_modules/`.

## Commits Sugeridos
```bash
git init
git add .
git commit -m "chore: bootstrap credit web"
```

Para cambios documentales:
```bash
git add AGENTS.md README.md document pages .codex
git commit -m "docs: add web agent documentation canon"
```

## Validacion Antes De Commit
```bash
npm run lint
npm test
npm run build
```

