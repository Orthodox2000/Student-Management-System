# Operations

## Local Development

### Start app

```bash
npm run dev
```

### Start Data Connect emulator

```bash
npm run emulators:dataconnect
```

### Run startup checks manually

```bash
npm run test:startup
```

## Production Readiness Notes

## Database

Current:

- Firebase Data Connect schema and queries are already in repo
- local development can use emulator

Production target:

1. Deploy Firebase Data Connect service
2. apply the schema from:
   - [schema.gql](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/dataconnect/schema/schema.gql)
3. use cloud PostgreSQL managed through Firebase Data Connect
4. keep secrets in deployment env, not in repo

## Image Storage

Current:

- [file-storage.ts](c:/Users/ANKIT/Desktop/work%20projects/pillai%20assesment/student-management-system/lib/file-storage.ts) uploads images to Firebase Storage using Firebase Admin SDK

Production recommendation:

1. enable Firebase Storage in the Firebase project
2. add bucket env on server side:
   - `FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app`
3. update the upload flow to use Firebase Admin Storage
4. upload files into a folder such as `students/`
5. store signed URL or permanent file reference in student `photoUrl`

Recommended final pattern:

- Auth: Firebase Auth
- DB: Firebase Data Connect / PostgreSQL
- Files: Firebase Storage
- App backend: Next.js route handlers

## GitHub Upload Checklist

Push:

- source code
- `dataconnect/`
- `docs/`
- `.env.example`
- `firebase.json`
- `.firebaserc` if needed for project wiring

Do not push:

- `.env`
- `.env.local`
- Firebase service account JSON files
- `public/uploads/*`
- emulator/debug artifacts

## Diagnostic Pages

### `/checks`

Use this page to verify:

- Firebase Auth health
- API route health
- protected route access
- Data Connect readiness endpoints

### Startup checks

These run before app boot and help catch:

- missing env keys
- broken route handlers
- Data Connect connectivity issues

## Known Development Gap

The current course-add action updates available course options in the running UI session.
If persistent custom course management is needed, add a dedicated course table or config-backed API.
