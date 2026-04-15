# Architecture

## App Structure

### Public Route

- `/`
  - admin login screen
  - Firebase connectivity preview
  - demo credential autofill

### Protected Routes

- `/dashboard`
  - student management operations only
  - add student form
  - student list table
  - edit modal

- `/checks`
  - Firebase connectivity checks
  - health endpoint checks
  - protected route checks

## Authentication Flow

1. Admin enters env-backed credentials on login page
2. `POST /api/auth/admin-login` validates credentials
3. Server creates or updates the admin Firebase Auth user
4. Server returns a Firebase custom token
5. Client signs in with that custom token
6. Protected routes fetch data with Firebase ID token in `Authorization` header

## Data Flow

### Students

- UI sends `multipart/form-data` to student APIs
- route handlers sanitize and validate input
- repository sends operations through Firebase Data Connect
- PostgreSQL stores structured student metadata

### Photos

Current:

- uploaded through server-side Firebase Admin Storage

Recommended production:

- keep photo URL/reference in student record

## Core Files

### UI

- [login-screen.tsx](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/components/student-management/login-screen.tsx)
- [dashboard-screen.tsx](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/components/student-management/dashboard-screen.tsx)
- [checks-screen.tsx](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/components/student-management/checks-screen.tsx)
- [dashboard-panels.tsx](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/components/student-management/dashboard-panels.tsx)

### Auth

- [admin-login route](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/app/api/auth/admin-login/route.ts)
- [firebase-admin.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/firebase-admin.ts)
- [firebase-auth.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/firebase-auth.ts)

### Data

- [students route](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/app/api/students/route.ts)
- [student by id route](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/app/api/students/[id]/route.ts)
- [seed route](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/app/api/students/seed/route.ts)
- [student-repository.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/student-repository.ts)
- [schema.gql](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/dataconnect/schema/schema.gql)

### Validation and Sanitization

- [student-schema.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/student-schema.ts)
- [student-form-data.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/student-form-data.ts)
- [sanitize.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/sanitize.ts)
