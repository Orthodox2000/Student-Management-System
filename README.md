# Pillai University Student Management System

Mobile-first full stack assessment app built with Next.js, Firebase Authentication, and Firebase Data Connect backed by PostgreSQL.

## Overview

This project implements the assessment requirements for a student management system with:

- admin login
- protected dashboard
- add student flow
- separate edit student popup flow
- student list with search and pagination
- delete student
- student photo upload
- auto-generated unique admission numbers
- health and connection test pages
- startup smoke checks before app boot

## Tech Stack

- Frontend: Next.js 16, React 19, Tailwind CSS 4
- Backend: Next.js route handlers in `app/api/*`
- Auth: Firebase Authentication with Firebase Admin verification
- Database: Firebase Data Connect with PostgreSQL
- Validation: Zod
- Sanitization: custom server-side and client-side sanitizers

## Main Features

### Authentication

- Admin-only login flow
- Admin credentials sourced from env
- Firebase custom-token login
- Protected `/dashboard` and `/checks` routes

### Student Management

- Add student using a full-width form
- Edit student using a separate popup modal
- View students in a searchable full-width table
- Delete students from the table
- Seed dummy students for testing
- Admission number auto-generated in backend

### Data Quality

- Sanitized input for text, email, phone, date, and multiline address
- Controlled year and gender values
- Course selection from controlled options with ability to add more options in UI
- Stronger phone number validation
- File type and file size checks for photos

### Testing and Operations

- `/checks` page for Firebase/API/database diagnostics
- startup checks run automatically before `dev` and `start`
- Firebase health route
- API route presence checks
- Data Connect readiness check

## Route Structure

- `/` login page
- `/dashboard` protected student management page
- `/checks` protected system checks page
- `/api/auth/*` auth routes
- `/api/students/*` CRUD and seed routes
- `/api/health/*` health and diagnostics routes

## Dashboard UX

### Add Student

- One dedicated full-width add form
- Course dropdown
- Year dropdown
- Validation errors shown inline

### Edit Student

- Student list lives below the add form
- `Edit` opens a separate modal window
- Save action asks for confirmation before update
- Modal has its own close action

### Student List

- Full-width table
- Search support
- Pagination with max 30 students per page
- Edit and delete actions per row

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` from `.env.example`

3. Start Firebase Data Connect emulator if you are using local database development

```bash
npm run emulators:dataconnect
```

4. Start the app

```bash
npm run dev
```

5. Open:

- `http://localhost:3000`

## Environment Variables

See [.env.example](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/.env.example)

Important groups:

- Firebase client SDK
- Firebase Admin SDK
- Admin login credentials
- Data Connect emulator host
- allowed dev origins

## Demo and Admin Credentials

Default local testing values:

- Admin email: `admin@pillai.local`
- Admin password: `Admin@12345`

The login page includes an autofill helper for these values.

## API Summary

### Auth

- `POST /api/auth/admin-login`
- `GET /api/auth/me`
- `POST /api/auth/demo`

### Students

- `GET /api/students`
- `POST /api/students`
- `POST /api/students/seed`
- `GET /api/students/:id`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

### Health

- `GET /api/health`
- `GET /api/health/firebase`
- `GET /api/health/live`
- `GET /api/health/ready`
- `GET /api/health/routes`
- `GET /api/health/self-test`

Detailed request/response notes live in [docs/API.md](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/docs/API.md).

## Startup Checks

Runs automatically before `npm run dev` and `npm start`.

Manual run:

```bash
npm run test:startup
```

Checks include:

- admission number format
- env contract
- required API routes and HTTP handlers
- Firebase Data Connect connectivity

Optional local bypass:

```env
SKIP_DATACONNECT_CHECK=true
```

## Image Uploads

Current status:

- student photos are uploaded to Firebase Storage when bucket env is configured
- the signed file URL is stored as the student photo reference

Recommended production approach:

- store files in Firebase Storage
- store only the file URL/reference in PostgreSQL via Data Connect

See [docs/OPERATIONS.md](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/docs/OPERATIONS.md) for the production path.

## GitHub Safety

Safe to push:

- source code
- `dataconnect/`
- docs
- `.env.example`
- Firebase config files that are not secrets

Ignored by default:

- `.env`
- `.env.local`
- uploaded local photos in `public/uploads`
- Firebase Admin JSON service account files
- emulator/debug artifacts

## Documentation Map

- [API.md](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/docs/API.md)
- [ARCHITECTURE.md](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/docs/ARCHITECTURE.md)
- [OPERATIONS.md](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/docs/OPERATIONS.md)

## Current Notes

- Data Connect schema is configured for student metadata and admission number uniqueness
- Firebase Auth is cloud-only in the current setup
- checks page is separated from the student management dashboard for cleaner review
