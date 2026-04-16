# Pillai University Student Management System

Pillai University Student Management System is a mobile-first Next.js admin application for secure student onboarding, structured record management, image uploads, searchable tables, modal-based editing, pagination, and system health checks. The app uses Supabase Postgres for student data, Supabase Storage for student images, and a protected admin session, with validation and input sanitization applied across the stack.

## What It Does

- Admin-only login with protected dashboard and checks page
- Add student records with validation and input sanitization
- Upload and link student photos through Supabase Storage
- Edit existing records in a dedicated popup form
- View a searchable student table with pagination
- Delete student records safely
- Auto-generate unique admission numbers
- Run API, database, storage, and readiness checks

## Stack

- Frontend: Next.js 16, React 19, Tailwind CSS 4
- Backend: Next.js route handlers
- Database: Supabase Postgres
- Image Storage: Supabase Storage public bucket
- Validation: Zod
- Auth: signed admin cookie session
- Future Auth Option: Firebase Auth with Google sign-in can be added later if the project moves beyond fixed admin credentials

## Routes

- `/` login page
- `/dashboard` protected student management dashboard
- `/checks` protected diagnostics page
- `/api/auth/*` admin session routes
- `/api/students/*` CRUD and seed routes
- `/api/health/*` health and connection routes

## Quick Start

1. Install dependencies with `npm install`
2. Create `.env.local` using the variable names in [`.env.example`](./.env.example)
3. Apply [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor
4. Create a public Supabase bucket matching `SUPABASE_STORAGE_BUCKET`
5. Start the app with `npm run dev`

## Required Env

Use [`.env.example`](./.env.example) as the reference.

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `ADMIN_LOGIN_EMAIL`
- `ADMIN_LOGIN_PASSWORD`
- `AUTH_SESSION_SECRET`

## Startup Checks

`npm run test:startup` verifies:

- admission number format
- env presence
- route handlers
- Supabase database connectivity
- Supabase storage bucket availability

If startup fails with a bucket message, create that exact bucket in Supabase Storage or update `SUPABASE_STORAGE_BUCKET`.

## Images and Storage

- Student images are uploaded through the app server
- Files are stored in the Supabase bucket defined by `SUPABASE_STORAGE_BUCKET`
- The public image URL is saved with each student record in Supabase Postgres

## Auth Notes

- The current production flow uses env-backed admin credentials plus a signed admin session
- Firebase Auth is not active in the current build
- A future enhancement can add Firebase Auth with Google sign-in for role-based institutional access

## Docs

- [`docs/API.md`](./docs/API.md)
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/OPERATIONS.md`](./docs/OPERATIONS.md)

## GitHub Safety

- `.env` and `.env.local` stay ignored
- `.env.example` is safe to push
- local secret files and uploads stay ignored
