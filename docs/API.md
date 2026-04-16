# API Documentation

Base URL for local development: `http://localhost:3000`

All student endpoints are protected by the admin session cookie created after successful login.

## Auth

### `POST /api/auth/admin-login`

Validates admin credentials from env and creates the admin session cookie.

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
  "user": {
    "email": "admin@pillai.local"
  },
  "message": "Admin session created successfully."
}
```

### `POST /api/auth/logout`

Clears the admin session cookie.

### `GET /api/auth/me`

Reads the admin session cookie and returns authenticated user info.

## Student Endpoints

### `GET /api/students`

Returns students ordered newest first.

Optional query params:

- `query`: filter by name, course, admission number, email, or mobile number

### `GET /api/students/:id`

Returns a single student by ID.

### `POST /api/students`

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
- uploaded photos are stored in a public Supabase Storage bucket and the public URL is saved in the student record

### `PUT /api/students/:id`

Updates a student.

Content type:

- `multipart/form-data`

Optional extra field:

- `removePhoto=true`

### `DELETE /api/students/:id`

Deletes a student by ID.

### `POST /api/students/seed`

Creates a small demo dataset for testing the table and edit flow.
Existing sample students are skipped when unique constraints already exist.

## Health Endpoints

### `GET /api/health`

Main application health endpoint.

### `GET /api/health/supabase`

Checks Supabase database and storage reachability.

### `GET /api/health/live`

Simple liveness check.

### `GET /api/health/ready`

Readiness check for backend availability, database access, and storage bucket access.

### `GET /api/health/routes`

Lists implemented routes for quick API discovery.

### `GET /api/health/self-test`

Runs internal checks such as admission number format and backend access checks.

## Protected UI Routes

- `/dashboard`
- `/checks`

