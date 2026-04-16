# Architecture

## App Structure

### Public Route

- `/`
  - admin login screen
  - Supabase connectivity preview
  - test credential autofill

### Protected Routes

- `/dashboard`
  - student management operations only
  - add student form
  - student list table
  - edit modal

- `/checks`
  - Supabase connectivity checks
  - health endpoint checks
  - protected route checks

## Authentication Flow

1. Admin enters env-backed credentials on login page
2. `POST /api/auth/admin-login` validates credentials
3. Server signs an admin session cookie
4. Client navigates to `/dashboard`
5. Protected routes verify the admin session cookie through `/api/auth/me`

## Data Flow

### Students

- UI sends `multipart/form-data` to student APIs
- route handlers sanitize and validate input
- repository sends operations through Supabase Postgres
- PostgreSQL stores structured student metadata

### Photos

- uploaded through server-side Supabase Storage calls
- public URLs are stored in the student record

## Core Files

### UI

- [login-screen.tsx](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/components/student-management/login-screen.tsx)
- [dashboard-screen.tsx](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/components/student-management/dashboard-screen.tsx)
- [checks-screen.tsx](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/components/student-management/checks-screen.tsx)
- [dashboard-panels.tsx](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/components/student-management/dashboard-panels.tsx)

### Auth

- [admin-login route](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/app/api/auth/admin-login/route.ts)
- [logout route](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/app/api/auth/logout/route.ts)
- [admin-session.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/admin-session.ts)

### Data

- [students route](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/app/api/students/route.ts)
- [student by id route](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/app/api/students/[id]/route.ts)
- [seed route](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/app/api/students/seed/route.ts)
- [student-repository.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/student-repository.ts)
- [supabase.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/supabase.ts)
- [schema.sql](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/supabase/schema.sql)

### Validation and Sanitization

- [student-schema.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/student-schema.ts)
- [student-form-data.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/student-form-data.ts)
- [sanitize.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/sanitize.ts)

