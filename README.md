# Apollo Energy Manager

This is a small full-stack web application for managing projects and tasks. Users can create an account, log in, create projects, and add or update tasks. The frontend uses React and TypeScript. The backend uses Laravel, Sanctum, and PostgreSQL.

## Features

- Register, log in, and log out
- Create and delete projects
- Update project status
- Add tasks with a priority
- Update task status and delete tasks
- Access only your own projects and tasks

## Requirements

- PHP 8.4.1 or higher with `pdo_pgsql` and `pdo_sqlite` enabled
- Composer
- Node.js 22.12 or higher and npm
- PostgreSQL

PostgreSQL is used for the application. SQLite is used by the automated tests.

## Setup

Clone the repository:

```bash
git clone https://github.com/daizhongtian/apollo-energy-manager.git
cd apollo-energy-manager
```

### 1. Create the database

Run the following SQL as a PostgreSQL administrator using pgAdmin or psql:

```sql
CREATE USER apollo_user WITH PASSWORD 'your_password';
CREATE DATABASE apollo_energy OWNER apollo_user;
```

Replace `your_password` with your own password.

### 2. Start the backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

On Windows PowerShell, you can copy the file with:

```powershell
Copy-Item .env.example .env
```

Update these settings in `backend/.env`. The example file defaults to SQLite, so change it to PostgreSQL:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=apollo_energy
DB_USERNAME=apollo_user
DB_PASSWORD=your_password
```

Run the database migrations and start Laravel:

```bash
php artisan migrate
php artisan serve
```

The backend runs at `http://127.0.0.1:8000`.

### 3. Start the frontend

Open another terminal in the project root:

```bash
cd frontend
npm ci
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Check that `frontend/.env` contains:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

Start React:

```bash
npm run dev
```

Open the address shown in the terminal, usually `http://localhost:5173`.

Keep both terminals running. Register an account, create a project, and add tasks to it.

Do not commit your `.env` files because they contain local settings and database credentials.

## Checks

Run the backend tests from the `backend` directory:

```bash
php artisan test
```

Build the frontend from the `frontend` directory:

```bash
npm run build
```

## Design Decisions

- React handles the pages, and TypeScript helps check the data types.
- Axios sends requests from the frontend to the Laravel REST API.
- Sanctum provides login tokens. The frontend stores the token in localStorage and sends it with protected requests.
- PostgreSQL stores the application data. A user has many projects, and a project has many tasks.
- The backend checks ownership before allowing access to projects and tasks.
- Deleting a project also deletes its tasks through a foreign key constraint.

## Program Architecture

<p align="center">
  <img src="docs/architecture.png" alt="Program architecture and database relationships" width="90%">
</p>

[Open the complete architecture diagram as PDF](docs/architecture.pdf)
