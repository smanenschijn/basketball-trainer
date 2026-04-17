# Basketball Trainer - Project Plan

## Overview

A web application for basketball trainers to plan training sessions using a library of exercises. Trainers can create exercises with detailed metadata and compose them into structured training sessions.

## Tech Stack

- **Backend:** Laravel 13 (PHP 8.5)
- **Frontend:** React + TypeScript via Inertia.js
- **Styling:** Tailwind CSS
- **Auth:** Laravel Breeze (pre-installed)
- **Database:** SQLite (dev), MySQL/PostgreSQL (prod)

## Data Model

### exercises
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| user_id | bigint | FK to users |
| title | string | |
| description | text | |
| youtube_url | string | nullable |
| duration_minutes | integer | |
| difficulty | enum | beginner, intermediate, advanced |
| category | enum | shooting, dribbling, defense, conditioning, passing, warmup, cooldown |
| materials | text | nullable, free-text list of required materials |
| min_players | integer | nullable |
| is_public | boolean | default false, for shared library |

### age_groups
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| name | string | e.g. U8, U10, U12, U14, U16, U18, Senior |

### exercise_age_group (pivot)
| Column | Type |
|--------|------|
| exercise_id | bigint |
| age_group_id | bigint |

### sessions
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| user_id | bigint | FK to users |
| title | string | |
| description | text | nullable |
| date | date | nullable |

### session_exercises (pivot with extra data)
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| session_id | bigint | FK |
| exercise_id | bigint | FK |
| sort_order | integer | for drag-and-drop ordering |
| duration_override | integer | nullable, override exercise default |
| notes | text | nullable, session-specific notes |

## Build Order

### Phase 1 - Core (MVP for your club)
1. Exercise CRUD (create, list, view, edit, delete)
2. Age groups & categories (seeded data)
3. Session builder (add exercises, reorder, set durations)
4. Dashboard with upcoming sessions

### Phase 2 - Polish
5. Drag-and-drop reordering in session builder
6. YouTube video embed/preview on exercise detail
7. Print/PDF export of a session plan
8. Duplicate/clone a session
9. Session templates (pre-built structures like "Game Day -1", "Skills Development")

### Phase 3 - Multi-club (scaling to 1000+ clubs)
10. Multi-tenancy (club_id scoping on all data)
11. Club registration & management
12. Roles & permissions (club admin, head coach, trainer)
13. Shared/public exercise library (curated exercises any trainer can use)
14. Subscription & billing (Laravel Cashier + Stripe)
15. Admin panel (Laravel Filament) for managing clubs

## Feature Ideas (Backlog)

- **Exercise tags** - flexible tagging beyond fixed categories
- **Favorites/bookmarks** - trainers can star exercises they use often
- **Session sharing** - share sessions between trainers (within a club or publicly)
- **Player count / group size** per exercise - helps plan for varying team sizes
- **Session calendar view** - visual overview of planned sessions
- **Exercise stats** - track which exercises are used most
- **Copy exercise to my library** - from the public/shared library
- **Mobile-friendly layout** - trainers often check plans on their phone at the gym
