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
- Loading and empty states must not shift layout unexpectedly. Empty can take `emptyContent` (figure + one Spanish sentence) from the caller; keep `ui/` free of credit-specific copy.
- Sort state should be visible and accessible.
- Table remains generic enough for credit rows without backend-specific logic inside `ui/`.
- Pagination (`totalCount`/`page`/`pageCount`/`onPageChange`) is optional and owned by the caller — `DataTable` only renders the MUI `Pagination` control when `pageCount > 1`; it never fetches or slices data itself. Also used (unpaginated columns aside) by `ClientsPage.jsx` and `EmailJobsPage.jsx`, not just credits — despite the skill's name, keep it generic.

## Files
- `ui/DataTable.jsx`
- `pages/credits/credits.columns.js`
- `pages/credits/CreditsPage.jsx`
- `pages/clients/clients.columns.js`, `pages/clients/ClientsPage.jsx`
- `pages/email-jobs/email-jobs.columns.js`, `pages/email-jobs/EmailJobsPage.jsx`
