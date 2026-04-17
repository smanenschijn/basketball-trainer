# Basketball Trainer

A web application for basketball trainers to plan training sessions using a library of exercises. Build exercise collections with details like duration, materials, YouTube videos, explanations, and target age groups, then compose them into structured training sessions.

## Tech Stack

- **Backend:** Laravel 13 (PHP 8.5)
- **Frontend:** React + TypeScript via Inertia.js
- **Styling:** Tailwind CSS
- **Auth:** Laravel Breeze

## Getting Started

### Prerequisites

- PHP 8.5+
- Composer
- Node.js 22+
- npm

### Installation

```bash
# Install PHP dependencies
composer install

# Install JS dependencies
npm install

# Copy environment file and generate app key
cp .env.example .env
php artisan key:generate

# Run database migrations
php artisan migrate
```

### Development

```bash
# Terminal 1 - Laravel dev server
php artisan serve

# Terminal 2 - Vite dev server (frontend hot reload)
npm run dev
```

The app will be available at `http://localhost:8000`.

### Testing

```bash
php artisan test
```

### Building for Production

```bash
npm run build
```

## Project Plan

See [PLAN.md](PLAN.md) for the full project plan, data model, build phases, and feature backlog.
