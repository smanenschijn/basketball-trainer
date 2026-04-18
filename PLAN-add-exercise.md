# Plan: Add Exercise Dialog

## Status: COMPLETED

## Context
First domain feature for the basketball trainer app. Added full exercise creation flow: backend (models, migrations, controllers, routes) and frontend (Tiptap rich text editor, materials autocomplete, modal dialog on Dashboard).

## Decisions Made
- **Rich text**: Tiptap WYSIWYG editor for the explanation field with inline image uploads
- **Materials**: Separate `materials` table with pivot for proper autocomplete (not JSON)
- **Dialog location**: Dashboard first, built as standalone component for reuse on future exercises index page
- **Auth**: Exercise creation does NOT require login (changed during implementation). `user_id` is nullable — guests get `null`.

---

## Phase A: Backend Foundation — DONE

### A1. Database migrations — DONE
- `exercises` table: `id`, `user_id` (nullable FK, nullOnDelete), `title`, `description` (max 500), `explanation` (longText), `youtube_url` (nullable), `duration_minutes`, `timestamps`
- `materials` table: `id`, `name` (unique), `timestamps`
- `exercise_material` pivot: `exercise_id`, `material_id` (composite PK)
- `exercise_images` table: `id`, `exercise_id` (nullable FK), `path`, `timestamps`

Files:
- `database/migrations/2026_04_17_175820_create_exercises_table.php`
- `database/migrations/2026_04_17_175821_create_materials_table.php`
- `database/migrations/2026_04_17_175822_create_exercise_material_table.php`
- `database/migrations/2026_04_17_175823_create_exercise_images_table.php`

### A2. Models — DONE
- `app/Models/Exercise.php` — `belongsTo(User)`, `belongsToMany(Material)`, `hasMany(ExerciseImage)`
- `app/Models/Material.php` — `belongsToMany(Exercise)`
- `app/Models/ExerciseImage.php` — `belongsTo(Exercise)`
- `app/Models/User.php` — added `hasMany(Exercise)` relationship

### A3. Form Request: `StoreExerciseRequest` — DONE
- `app/Http/Requests/StoreExerciseRequest.php`
- Validates: title (required, max:255), description (required, max:500), explanation (required), youtube_url (nullable, url, youtube regex), duration_minutes (required, integer, min:1), materials (array of strings)

### A4. Controller: `ExerciseController@store` — DONE
- `app/Http/Controllers/ExerciseController.php`
- Creates exercise with nullable user_id (supports guests)
- Find-or-create materials by name (lowercased, trimmed), syncs pivot

### A5. Image upload: `ExerciseImageController@store` — DONE
- `app/Http/Controllers/ExerciseImageController.php`
- Stores to `exercise-images` on public disk, returns JSON `{ url, image_id }`

### A6. Materials API: `MaterialController@index` — DONE
- `app/Http/Controllers/MaterialController.php`
- `GET /api/materials?search=...` — returns JSON array of material names, limit 10

### A7. Routes — DONE
- `routes/web.php` — all three routes are public (no auth middleware):
  - `POST /exercises` → `ExerciseController@store`
  - `POST /uploads/exercise-images` → `ExerciseImageController@store`
  - `GET /api/materials` → `MaterialController@index`
- Dashboard route passes `exerciseCount` prop via `Exercise::count()`

---

## Phase B: Frontend — DONE

### B8. TypeScript types — DONE
- `resources/js/types/index.d.ts` — added `Exercise` and `Material` interfaces

### B9. RichTextEditor component — DONE
- `resources/js/Components/RichTextEditor.tsx`
- Packages: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`, `@tiptap/pm`
- Toolbar: bold, italic, H2, H3, bullet list, ordered list, image upload
- Image upload posts to `/uploads/exercise-images` and inserts into editor

### B10. MaterialsInput component — DONE
- `resources/js/Components/MaterialsInput.tsx`
- Tag-style input with removable pills, debounced autocomplete, keyboard navigation (arrows, Enter, Backspace, Escape)

### B11. AddExerciseDialog component — DONE
- `resources/js/Components/Exercises/AddExerciseDialog.tsx`
- Uses existing `Modal` component, Inertia `useForm`
- Fields: Title, Short Description (textarea with char counter), Explanation (RichTextEditor), YouTube URL, Duration (minutes), Materials (MaterialsInput)
- On success: resets form, closes dialog, Inertia refreshes page

### B12. Wire up Dashboard — DONE
- `resources/js/Pages/Dashboard.tsx`
- "ADD NEW EXERCISE" button opens AddExerciseDialog
- "TOTAL EXERCISES" stat card shows live count from `exerciseCount` prop

---

## Phase C: Tests — DONE

### C13. Feature tests — DONE
- `tests/Feature/ExerciseTest.php` (9 tests):
  - Guest can create exercise (user_id null)
  - Authenticated user can create exercise
  - Materials created and associated correctly
  - Existing materials reused (no duplicates)
  - Title required, description max 500, youtube must be youtube, youtube optional, duration min 1

### C14. Materials endpoint tests — DONE
- `tests/Feature/MaterialTest.php` (4 tests):
  - Guest can search materials
  - Returns matching materials
  - Returns empty for no matches
  - Limits results to 10

---

## What's Next
- Exercise list/index page (`GET /exercises`)
- Exercise edit/update flow
- Exercise delete
- Age groups & categories (from PLAN.md Phase 1)
- Session builder
