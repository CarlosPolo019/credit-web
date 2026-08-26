---
name: project-overview
description: Use when working on credit-web architecture, routing, folders, documentation, or cross-cutting app behavior.
metadata:
  short-description: credit-web architecture and docs map
triggers:
  - credit-web architecture
  - credit-web routing
  - credit-web documentation
priority: normal
---

# Project Overview

## Purpose
Guide changes in the `credit-web` React/Vite SPA.

## Key Context
- JavaScript-only: do not create `.ts` or `.tsx`.
- Runtime folders are `main.jsx`, `app/`, `auth/`, `api/`, `lib/`, `ui/`, `pages/`.
- The web client talks only to the Spring Boot REST API.
- `document/module-map.md` is the canonical module inventory.

## Workflow
1. Read `AGENTS.md`.
2. Read `document/overview.md` and `document/module-map.md`.
3. Inspect affected files with `rg`.
4. Keep README/docs synchronized with behavior changes.
