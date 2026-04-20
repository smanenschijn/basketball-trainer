# Training Sessions — Implementation Plan

## Decisions

- **Route key:** numeric IDs (not slugs)
- **Drag-and-drop:** `@dnd-kit/core` + `@dnd-kit/sortable`
- **Time overflow:** warn but allow (no hard block)
- **Date:** required at creation (date picker in create dialog)

## Step 1 — Backend

1. Migration: `create_sessions_table` — id, user_id (FK), title, description (nullable), date, duration_minutes, age_group_id (FK nullable), timestamps
2. Migration: `create_session_exercises` — id, session_id (FK), exercise_id (FK), sort_order, duration_override (nullable), notes (nullable)
3. Model: `Session` — belongsTo User, belongsTo AgeGroup, belongsToMany Exercise (pivot: sort_order, duration_override, notes)
4. Update `User` model: hasMany Session
5. Policy: `SessionPolicy` — only owner can view/edit/delete
6. Form Requests: `StoreSessionRequest` (title required, duration_minutes required int, age_group_id required exists, date required), `UpdateSessionRequest`
7. Controller: `SessionController` — index, store, show, update, destroy, addExercise, removeExercise, reorderExercises
8. Routes: resource routes + POST/DELETE/PUT for exercise pivot management

## Step 2 — Frontend Foundation

9. TypeScript types: `Session`, `SessionExercise` in `index.d.ts`
10. Translation keys: `sessions.*` namespace in `en.json` and `nl.json`
11. Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## Step 3 — Frontend Pages

12. `Sessions/Index.tsx` — tabbed layout (Headless UI Tab):
    - **Calendar tab:** sessions sorted/grouped by date, tiles show title, exercise count, total duration, materials
    - **New Training tab:** CTA that opens create dialog
13. `CreateSessionDialog` — Headless UI Dialog: name, duration, age group select, date picker → POST → redirect to show
14. `Sessions/Show.tsx` — session builder:
    - Left panel: ordered exercise list (dnd-kit sortable), time progress bar, warning when over target duration
    - Right panel: filterable exercise library pre-filtered by session age group, draggable into session

## Step 4 — Tests

15. Feature tests: Session CRUD, adding/removing/reordering exercises, authorization
16. Component tests: reusable session UI components
