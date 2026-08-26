---
name: datatable-credit
description: Use when changing the credit table columns, sorting controls, loading, empty, or accessible table states.
metadata:
  short-description: credit table state, sorting, and accessibility
triggers:
  - credit table
  - datatable sorting
  - loading empty state
priority: normal
---

# Datatable Credit

## Purpose
Maintain the reusable table used by the credits view.

## Invariants
- Sorting only emits allowlisted `sortKey` values from column definitions.
- Loading and empty states must not shift layout unexpectedly.
- Sort state should be visible and accessible.
- Table remains generic enough for credit rows without backend-specific logic inside `ui/`.

## Files
- `ui/DataTable.jsx`
- `pages/credits/credits.columns.js`
- `pages/credits/CreditsPage.jsx`
