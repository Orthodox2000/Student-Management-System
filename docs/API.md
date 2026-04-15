# API Documentation

Base URL for local development: `http://localhost:3000`

All student endpoints are protected and use Firebase ID token verification.

## Auth

### `POST /api/auth/admin-login`

Validates admin credentials from env and returns a Firebase custom token.

Request body:

```json
{
  "email": "admin@pillai.local",
  "password": "Admin@12345"
}
```

Response:

```json
{
  "ok": true,
  "customToken": "firebase_custom_token",
  "user": {
    "uid": "firebase_uid",
    "email": "admin@pillai.local"
  }
}
```

### `GET /api/auth/me`

Validates Firebase ID token and returns authenticated user info.

Required header:

- `Authorization: Bearer <firebase_id_token>`

### `POST /api/auth/demo`

Creates or confirms a demo login in local development.

## Student Endpoints

## `GET /api/students`

Returns students ordered newest first.

Optional query params:

- `query`: filter by name, course, admission number, or email

## `GET /api/students/:id`

Returns a single student by ID.

## `POST /api/students`

Creates a student.

Content type:

- `multipart/form-data`

Required fields:

- `name`
- `course`
- `year`
- `dateOfBirth`
- `email`
- `mobileNumber`
- `gender`
- `address`

Optional fields:

- `photo`

Validation notes:

- course must be sanitized and valid for the UI flow
- year must match supported academic year values
- mobile number must contain 10 to 15 digits after normalization
- photo must be png, jpg, jpeg, or webp and 5 MB or smaller

## `PUT /api/students/:id`

Updates a student.

Content type:

- `multipart/form-data`

Optional extra field:

- `removePhoto=true`

## `DELETE /api/students/:id`

Deletes a student by ID.

## `POST /api/students/seed`

Creates a small demo dataset for testing the table and edit flow.
Existing sample students are skipped by email.

## Health Endpoints

## `GET /api/health`

Main application health endpoint.

## `GET /api/health/firebase`

Checks Firebase Authentication reachability.

## `GET /api/health/live`

Simple liveness check.

## `GET /api/health/ready`

Readiness check for backend availability and Data Connect access.

## `GET /api/health/routes`

Lists implemented routes for quick API discovery.

## `GET /api/health/self-test`

Runs internal checks such as admission number format and database access checks.

## Protected UI Routes

- `/dashboard`
- `/checks`

## Notes

- images are currently stored locally for development
- production should move photo storage to Firebase Storage
