# Technical Framework (Technisch Kader) — Implementation Plan

## Overview

A new section where trainers view the organization's technical framework PDF, navigate by age group bookmarks, and see related exercises in a sidebar. Exercises can be tagged as "framework exercises" for specific age groups.

## Tasks

1. Migration: `technical_framework` table
2. Migration: add `is_framework` to `exercise_age_group` pivot
3. `TechnicalFramework` model
4. Update `Exercise` model (pivot field)
5. `TechnicalFrameworkController` + routes + form request
6. Update exercise store/update to handle `is_framework`
7. i18n keys (en.json + nl.json)
8. Frontend: `TechnicalFramework/Index.tsx` page with PDF viewer + sidebar + upload/manage UI
9. Frontend: Update `ExerciseDialog` with framework toggle
10. Frontend: Add nav item to AuthenticatedLayout
11. Tests

## Database

### `technical_frameworks` table
- `id`, `file_path`, `original_filename`, `age_group_bookmarks` (JSON), `uploaded_by` (FK users), `timestamps`
- One active PDF at a time; new upload replaces old.

### `exercise_age_group` pivot update
- Add `is_framework` boolean (default false)

## Routes

```
GET    /technical-framework          → index (view PDF + sidebar)
POST   /technical-framework/upload   → upload PDF + bookmarks
GET    /technical-framework/pdf      → serve PDF file
```

## Frontend Layout

```
┌─────────────────────────────────────────────────┐
│  Nav bar                                         │
├──────────────────────┬──────────────────────────┤
│                      │  Sidebar                  │
│   PDF Viewer         │  Age Group Tabs           │
│   (<iframe>)         │  Framework Exercises      │
│                      │  for selected group       │
├──────────────────────┴──────────────────────────┤
│  Age group bookmark buttons (jump to page)       │
└─────────────────────────────────────────────────┘
```

Upload/replace UI shown at top of page for managing the PDF and bookmark config.
