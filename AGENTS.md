# Basketball Trainer

Web app for basketball trainers to plan training sessions using an exercise library. Built with Laravel 13 + React/TypeScript via Inertia.js.

## Stack

- **Backend:** Laravel 13, PHP 8.3+, SQLite (dev) / MySQL (prod)
- **Frontend:** React 18 + TypeScript, Inertia.js v2, Tailwind CSS, Headless UI
- **Auth:** Laravel Breeze (Inertia variant)
- **Architecture:** Standard Laravel (Controllers, Models, Form Requests, Policies)

## Development

- `composer setup` — full first-time setup (deps, .env, key, migrate, npm install + build)
- `composer dev` — runs server, queue worker, log tail, and Vite dev concurrently
- `composer test` — clears config cache then runs PHPUnit
- Tests use SQLite `:memory:` — no external DB needed

## Domain Context

See `PLAN.md` for full data model and roadmap. Core domain: exercises belong to users, are tagged with age groups and categories, and are composed into sessions with ordering and duration overrides. Respect the build phases — don't over-engineer for multi-tenancy until Phase 3.

## Conventions

### Backend (Laravel)

- **Standard Laravel structure.** Controllers in `app/Http/Controllers`, Models in `app/Models`, Form Requests for validation, Policies for authorization. No repositories or service layers unless complexity demands it — keep it simple.
- **Fat models, thin controllers.** Business logic lives on models (scopes, accessors, mutators) or dedicated Action classes. Controllers orchestrate but don't contain logic.
- **Form Requests for all validation.** Never validate inline in controllers — always extract to a Form Request class. This keeps controllers clean and validation reusable.
- **Eloquent: always eager load.** Use `->with()` on every query that touches relationships. Prevent N+1 queries.
- **Prevent lazy loading.** Enable `Model::preventLazyLoading()` in `AppServiceProvider` for non-production environments. This catches missed eager loads during development.
- **Paginate all list endpoints.** Max 50 items per page. Never return unbounded collections from controllers.
- **Use Laravel Pint** for code style. Run `vendor/bin/pint` before committing. Default Laravel preset (no custom config).
- **Enums as PHP enums.** Use backed string enums for `difficulty`, `category`, and similar fields — not string constants or config arrays.
- **Route model binding.** Use implicit route model binding. Don't manually query by ID in controllers.
- **Resources for Inertia data.** Use Eloquent API Resources or `->only()` to shape data passed to Inertia. Never pass full models with all attributes to the frontend.

### Frontend (React/TypeScript)

- **Reusable components first.** Extract UI into small, composable components. Prefer props over hardcoded values. Components should be generic enough to reuse across pages.
- **Inertia conventions.** Pages live in `resources/js/Pages/`. Shared layouts in `resources/js/Layouts/`. Use Inertia's `useForm`, `usePage`, and `Link` — don't reach for axios or React Router.
- **TypeScript strict mode.** All components and utilities must be typed. No `any` types — use proper interfaces. Shared types live in `resources/js/types/`.
- **Tailwind for all styling.** No inline styles or CSS modules. Use Tailwind utility classes. Extract repeated patterns into components, not custom CSS.
- **Component file structure.** One component per file. File name matches the exported component name (PascalCase). Keep component files focused — if a component exceeds ~150 lines, break it up.

### Testing

- **Test-first for bugs.** When fixing a bug, write a failing test that reproduces it before writing the fix.
- **Backend: integration tests by default.** Use Laravel's `RefreshDatabase` trait and test through HTTP (`$this->get()`, `$this->post()`, etc.). Test the full request lifecycle — routes, middleware, validation, database state. Only write unit tests when testing pure logic that doesn't touch the framework (e.g., a calculation helper).
- **Write tests for every backend feature.** No feature PR should land without corresponding tests covering the happy path and key edge cases.
- **Frontend: Vitest + React Testing Library.** Test components by rendering them and asserting on user-visible behavior (text, interactions), not implementation details. Don't test Inertia page components in isolation — focus on reusable UI components.
- **Test file location mirrors source.** Backend tests in `tests/Feature/` (or `tests/Unit/` for the rare unit test). Frontend tests alongside components with `.test.tsx` suffix.

### General

- **No over-engineering.** This is an early-stage app. Don't add abstractions (interfaces, DI containers, event sourcing) until the complexity justifies them. Prefer simple, readable code.
- **Secrets stay out of code.** Use `.env` for all credentials and config values. Never commit `.env` — only `.env.example` with placeholder values.
- **Migrations are append-only in production.** Never edit an existing migration — create a new one. In development, `migrate:fresh` is fine.

### Internationalization (i18n)

- **Frontend-only i18n with `react-i18next`.** All user-facing strings are translated on the frontend. No Laravel server-side translations are used (backend validation messages remain in English for now).
- **Default language: Dutch (`nl`), fallback: English (`en`).** The app defaults to Dutch since the primary audience is Dutch-speaking. English serves as the base/fallback language.
- **Translation files live in `resources/js/i18n/locales/`.** Each language has a single JSON file (e.g., `en.json`, `nl.json`). The i18n config is in `resources/js/i18n/index.ts`.
- **Flat JSON with dot-separated namespaces.** Keys use the pattern `namespace.key` (e.g., `exercises.title`, `auth.login`, `common.save`). Namespaces match domain areas: `common`, `nav`, `auth`, `dashboard`, `exercises`, `filters`, `profile`, `welcome`.
- **Never hardcode user-facing strings.** Always use the `t()` function from `useTranslation()`. Every new component with visible text must import `useTranslation` from `react-i18next` and wrap all strings with `t('namespace.key')`.
- **English is the source of truth.** Always add new keys to `en.json` first, then add the Dutch translation to `nl.json`. Both files must stay in sync — every key in `en.json` must exist in `nl.json` and vice versa.
- **Adding a new language.** To add a new language: (1) create a new `resources/js/i18n/locales/{lang}.json` file with all keys translated, (2) import it in `resources/js/i18n/index.ts` and add it to the `resources` object. No other changes needed.
- **Interpolation for dynamic values.** Use `{{variable}}` syntax in translation strings (e.g., `"showingOf": "Showing {{shown}} of {{total}} drills"`). Pass values as the second argument to `t()`: `t('exercises.showingOf', { shown: 5, total: 20 })`.
- **Pluralization.** Use `_one` and `_other` suffixes for plural forms (e.g., `drillCount_one`, `drillCount_other`). Call with `t('exercises.drillCount', { count: n })`.
