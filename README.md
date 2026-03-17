# Brass Monkey

Brass Monkey is a Laravel 12 + Inertia React application.

## Prerequisites

Install these first:

- PHP 8.4+
- Composer 2+
- Node.js 20+ and npm
- A database:
  - SQLite (quick local setup), or
  - MySQL (recommended for parity with production-like setups)

## 1) Install Dependencies

From the project root:

```bash
composer install
npm install
```

## 2) Configure Environment

Create your local environment file:

```bash
cp .env.example .env
```

If you are on Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Generate your application key:

```bash
php artisan key:generate
```

### Database Configuration

Open `.env` and configure one of the following.

#### Option A: SQLite (fastest to start)

Use these values in `.env`:

```dotenv
DB_CONNECTION=sqlite
```

Then create the SQLite file if needed:

```bash
type nul > database/database.sqlite
```

PowerShell alternative:

```powershell
New-Item -ItemType File -Force database/database.sqlite
```

#### Option B: MySQL

Use values like:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brass_monkey
DB_USERNAME=root
DB_PASSWORD=
```

## 3) Run Migrations

```bash
php artisan migrate
```

## 4) Run the Application

Recommended (starts Laravel server, queue listener, and Vite together):

```bash
composer dev
```

Then open:

- http://localhost

### Alternative: Run Services Separately

If you prefer separate terminals:

```bash
php artisan serve
php artisan queue:listen --tries=1
npm run dev
```

## 5) One-Command First-Time Setup

You can also use the built-in setup script:

```bash
composer setup
```

This script runs:

- composer install
- creates `.env` if missing
- `php artisan key:generate`
- `php artisan migrate --force`
- npm install
- npm run build

## Quality Checks

### Run tests

```bash
php artisan test --compact
```

### Run PHP formatter (Laravel Pint)

```bash
vendor/bin/pint --format agent
```

### Frontend checks

```bash
npm run lint:check
npm run format:check
npm run types:check
```

## Troubleshooting

- If frontend assets are not updating, run `npm run dev` (or rebuild with `npm run build`).
- If you see database connection errors, verify `.env` database credentials and rerun `php artisan migrate`.
- If the app key is missing, run `php artisan key:generate`.
